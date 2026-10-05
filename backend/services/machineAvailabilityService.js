import Machine from "../models/Machine.js";
import MachineAssignment from "../models/MachineAssignment.js";
import MachineRequest from "../models/MachineRequest.js";
import MachineMaintenance from "../models/MachineMaintenance.js";
import MachineDocument from "../models/MachineDocument.js";

/**
 * Centralized Machine Availability & Double-Allocation Prevention Engine
 * 
 * Verifies:
 * 1. Machine exists & active flag is true
 * 2. Status is not "Breakdown", "Under Maintenance", or "Decommissioned"
 * 3. No active or ongoing maintenance/breakdown records in MachineMaintenance
 * 4. No overlapping assignments in MachineAssignment (PENDING, DISPATCHED, ACTIVE)
 * 5. No overlapping allocated/dispatched requests in MachineRequest
 * 6. Mandatory documents (RC, Insurance, Fitness) are not expired
 */
export async function checkMachineAvailability({
    machineId,
    requiredFrom,
    requiredTo,
    excludeRequestId = null,
    excludeAssignmentId = null,
}) {
    const machine = await Machine.findById(machineId);
    if (!machine) {
        return { available: false, reason: "Machine not found" };
    }

    if (!machine.active) {
        return { available: false, reason: `Machine ${machine.machineNumber} is marked inactive` };
    }

    if (machine.status === "Breakdown" || machine.status === "Under Maintenance" || machine.status === "Decommissioned") {
        return {
            available: false,
            reason: `Machine ${machine.machineNumber} is currently unavailable (${machine.status})`,
        };
    }

    // 1. Check Active Maintenance / Breakdown
    const activeMaintenance = await MachineMaintenance.findOne({
        machineId,
        status: { $in: ["Reported", "Scheduled", "InProgress"] },
    });
    if (activeMaintenance) {
        return {
            available: false,
            reason: `Machine ${machine.machineNumber} is currently under maintenance / breakdown (status: ${activeMaintenance.status}, issue: ${activeMaintenance.issue || activeMaintenance.description || "N/A"})`,
        };
    }

    // Parse requested dates
    const reqStart = requiredFrom ? new Date(requiredFrom) : new Date();
    const reqEnd = requiredTo ? new Date(requiredTo) : new Date(reqStart.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year if open-ended

    // 2. Check Overlapping Machine Assignments
    // A conflict exists if existing assignment period overlaps with [reqStart, reqEnd]
    // Overlap formula: existingStart <= reqEnd AND (existingEnd >= reqStart OR existingEnd is null/open-ended)
    const assignmentQuery = {
        machineId,
        assignmentStatus: { $in: ["PENDING", "DISPATCHED", "ACTIVE"] },
    };
    if (excludeAssignmentId) {
        assignmentQuery._id = { $ne: excludeAssignmentId };
    }

    const activeAssignments = await MachineAssignment.find(assignmentQuery).populate("projectId", "name code");

    for (const assign of activeAssignments) {
        const assignStart = assign.assignedFrom ? new Date(assign.assignedFrom) : new Date(assign.createdAt);
        // If assignedTo is not specified, it is ongoing
        const assignEnd = assign.assignedTo ? new Date(assign.assignedTo) : null;

        const overlaps = assignEnd
            ? assignStart <= reqEnd && assignEnd >= reqStart
            : assignStart <= reqEnd; // Ongoing assignment active indefinitely

        if (overlaps) {
            const projName = assign.projectId?.name || "another project";
            const periodStr = assignEnd
                ? `from ${assignStart.toISOString().slice(0, 10)} to ${assignEnd.toISOString().slice(0, 10)}`
                : `from ${assignStart.toISOString().slice(0, 10)} (ongoing)`;
            return {
                available: false,
                reason: `Machine ${machine.machineNumber} is already assigned to ${projName} ${periodStr}`,
                conflictType: "ASSIGNMENT",
                conflict: assign,
            };
        }
    }

    // 3. Check Overlapping Allocated / Dispatched Machine Requests
    const requestQuery = {
        machineId,
        status: { $in: ["ALLOCATED", "DISPATCHED"] },
    };
    if (excludeRequestId) {
        requestQuery._id = { $ne: excludeRequestId };
    }

    const conflictingRequests = await MachineRequest.find(requestQuery).populate("projectId", "name code");

    for (const req of conflictingRequests) {
        const reqItemStart = req.requiredFrom ? new Date(req.requiredFrom) : new Date(req.createdAt);
        const reqItemEnd = req.requiredTo ? new Date(req.requiredTo) : new Date(reqItemStart.getTime() + 30 * 24 * 60 * 60 * 1000);

        const overlaps = reqItemStart <= reqEnd && reqItemEnd >= reqStart;
        if (overlaps) {
            const projName = req.projectId?.name || "another project";
            const periodStr = `from ${reqItemStart.toISOString().slice(0, 10)} to ${reqItemEnd.toISOString().slice(0, 10)}`;
            return {
                available: false,
                reason: `Machine ${machine.machineNumber} is already reserved for Request #${req.requestNumber || req._id} (${projName}) ${periodStr}`,
                conflictType: "REQUEST",
                conflict: req,
            };
        }
    }

    // 4. Check Mandatory Document Expiry
    const expiredDocs = await MachineDocument.find({
        machineId,
        type: { $in: ["RC", "Fitness Certificate", "Insurance", "PUC"] },
        expiryDate: { $lt: new Date() },
    });

    if (expiredDocs.length > 0) {
        const docTypes = expiredDocs.map(d => d.type).join(", ");
        return {
            available: false,
            reason: `Machine ${machine.machineNumber} has expired mandatory compliance document(s): ${docTypes}. Please renew and verify before allocation.`,
            conflictType: "DOCUMENT_EXPIRED",
            expiredDocs,
        };
    }

    return { available: true, machine };
}

/**
 * Filter list of all machines available for a given type and date range
 */
export async function getAvailableMachinesForDateRange({ machineType, requiredFrom, requiredTo }) {
    const filter = { active: true };
    if (machineType) {
        filter.machineType = machineType;
    }

    const allMachines = await Machine.find(filter);
    const availableMachines = [];

    for (const m of allMachines) {
        const check = await checkMachineAvailability({
            machineId: m._id,
            requiredFrom,
            requiredTo,
        });
        if (check.available) {
            availableMachines.push(m);
        }
    }

    return availableMachines;
}

/**
 * Cumulative Machine Meter Validation
 * Enforces:
 * 1. closingMeterReading >= openingMeterReading
 * 2. openingMeterReading >= currentMachineMeter (or previous closing meter)
 */
export function validateMeterReading({
    currentMachineMeter = 0,
    openingMeterReading,
    closingMeterReading,
    allowReset = false,
}) {
    const opening = Number(openingMeterReading);
    const closing = Number(closingMeterReading);

    if (isNaN(opening) || isNaN(closing)) {
        return { valid: false, error: "Opening and closing meter readings must be valid numbers" };
    }

    if (closing < opening) {
        return {
            valid: false,
            error: `Closing meter reading (${closing}) cannot be less than opening meter reading (${opening})`,
        };
    }

    if (!allowReset && opening < Number(currentMachineMeter || 0)) {
        return {
            valid: false,
            error: `Opening meter reading (${opening}) cannot be less than machine's current cumulative meter reading (${currentMachineMeter})`,
        };
    }

    const workingHours = Number((closing - opening).toFixed(2));
    return { valid: true, workingHours };
}

/**
 * Fuel and Operational Cost Calculation
 */
export function calculateFuelAndCost({
    workingHours = 0,
    hourlyRate = 0,
    fuelOpening = 0,
    fuelAdded = 0,
    fuelClosing = 0,
    fuelRate = 0,
    overtimeAmount = 0,
}) {
    const fOpen = Math.max(0, Number(fuelOpening) || 0);
    const fAdd = Math.max(0, Number(fuelAdded) || 0);
    const fClose = Math.max(0, Number(fuelClosing) || 0);
    const rate = Math.max(0, Number(hourlyRate) || 0);
    const fRate = Math.max(0, Number(fuelRate) || 0);
    const ot = Math.max(0, Number(overtimeAmount) || 0);

    const fuelConsumed = Math.max(0, Number((fOpen + fAdd - fClose).toFixed(2)));
    const fuelEfficiency = workingHours > 0 ? Number((fuelConsumed / workingHours).toFixed(2)) : 0;
    const fuelCost = Number((fuelConsumed * fRate).toFixed(2));
    const machineUsageCost = Number((workingHours * rate).toFixed(2));
    const totalDayCost = Number((machineUsageCost + fuelCost + ot).toFixed(2));

    return {
        fuelConsumed,
        fuelEfficiency,
        fuelCost,
        machineUsageCost,
        totalDayCost,
    };
}
