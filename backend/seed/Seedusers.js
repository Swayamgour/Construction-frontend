/**
 * seedTestData.js
 *
 * PURPOSE: Testing ke liye ek full realistic dataset banata hai — poore
 * app ke roles se login test kar sako, aur multiple projects, vendors,
 * labour/operators, machines, items aur stock bhi already linked milega.
 *
 * Kya-kya banega:
 *   1. Users        -> har role ka ek ya zyada test user (password sabka same)
 *   2. Items         -> materials (Cement, Steel, Bricks, Sand) + machine items
 *   3. Vendors        -> Material Supplier, Machine Supplier, Both
 *   4. Machines       -> Excavator, Loader, Truck
 *   5. Labour         -> permanent/contract labour + mistri + OPERATORS
 *   6. Projects       -> 3 alag projects, manager/supervisor assigned
 *   7. LabourAssignment -> labour ko projects me active assign
 *   8. MachineAllocation -> machines ko projects me operator ke saath allocate
 *   9. Stock          -> har material item ka stock + project-wise balance
 *
 * SAFE TO RE-RUN: har cheez upsert (findOneAndUpdate + upsert:true) se
 * banti hai, unique key (email / phone / machineNumber / projectCode /
 * companyName) ke basis par — dubara chalane pe duplicate nahi banega,
 * bas existing record update ho jayega.
 *
 * USAGE:
 *   node scripts/seedTestData.js
 *
 * (.env me MONGO_URI set hona chahiye — same jo server.js use karta hai)
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import Project from "../models/Project.js";
import Vendor from "../models/Vendor.js";
import Labour from "../models/Labour.js";
import Machine from "../models/Machine.js";
import Item from "../models/Item.js";
import Stock from "../models/Stock.js";
import LabourAssignment from "../models/LabourAssignment.js";
import MachineAssignment from "../models/MachineAssignment.js";

const COMMON_PASSWORD = "Test@123";

async function run() {
    if (!process.env.MONGO_URI) {
        console.error("❌ MONGO_URI not found in .env");
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected\n");

    const hashedPassword = await bcrypt.hash(COMMON_PASSWORD, 10);

    /* ======================================================================
     * 1. USERS — har role ke liye (multiple manager/supervisor taaki
     *    alag-alag projects pe assign kiye ja sakein)
     * ==================================================================== */
    const userDefs = [
        { key: "admin", name: "Admin User", phone: "9000000001", email: "admin@test.com", role: "admin" },
        { key: "manager1", name: "Manager One", phone: "9000000002", email: "manager1@test.com", role: "manager" },
        { key: "manager2", name: "Manager Two", phone: "9000000003", email: "manager2@test.com", role: "manager" },
        { key: "supervisor1", name: "Supervisor One", phone: "9000000004", email: "supervisor1@test.com", role: "supervisor" },
        { key: "supervisor2", name: "Supervisor Two", phone: "9000000005", email: "supervisor2@test.com", role: "supervisor" },
        { key: "supervisor3", name: "Supervisor Three", phone: "9000000006", email: "supervisor3@test.com", role: "supervisor" },
        { key: "storekeeper", name: "Storekeeper User", phone: "9000000007", email: "storekeeper@test.com", role: "storekeeper" },
        { key: "accountant", name: "Accountant User", phone: "9000000008", email: "accountant@test.com", role: "accountant" },
        { key: "operatorUser", name: "Operator User", phone: "9000000009", email: "operator@test.com", role: "operator" },
        { key: "labourUser", name: "Labour User", phone: "9000000010", email: "labour@test.com", role: "labour" },
        { key: "drawingManager", name: "Drawing Manager User", phone: "9000000011", email: "drawingmanager@test.com", role: "drawing_manager" },
    ];

    const users = {};
    for (const u of userDefs) {
        const doc = await User.findOneAndUpdate(
            { email: u.email },
            {
                $setOnInsert: {
                    name: u.name,
                    phone: u.phone,
                    email: u.email,
                    password: hashedPassword,
                    role: u.role,
                    status: true,
                },
            },
            { upsert: true, new: true }
        );
        users[u.key] = doc;
        console.log(`👤 User ready: ${u.email} [${u.role}]`);
    }
    const adminId = users.admin._id;

    /* ======================================================================
     * 2. ITEMS — materials + machine-type items
     * ==================================================================== */
    const itemDefs = [
        { name: "Cement (OPC 53)", type: "material", category: "Cement", unit: "Bag" },
        { name: "TMT Steel Bar 12mm", type: "material", category: "Steel", unit: "Kg" },
        { name: "Red Bricks", type: "material", category: "Masonry", unit: "Nos" },
        { name: "River Sand", type: "material", category: "Aggregate", unit: "Cubic Ft" },
        { name: "Excavator (Item)", type: "machine", category: "Earthmoving", unit: "Nos" },
        { name: "Wheel Loader (Item)", type: "machine", category: "Earthmoving", unit: "Nos" },
    ];

    const items = {};
    for (const it of itemDefs) {
        const doc = await Item.findOneAndUpdate(
            { name: it.name, type: it.type },
            { $setOnInsert: { ...it, isActive: true } },
            { upsert: true, new: true }
        );
        items[it.name] = doc;
        console.log(`📦 Item ready: ${it.name} [${it.type}]`);
    }

    /* ======================================================================
     * 3. VENDORS
     * ==================================================================== */
    const vendorDefs = [
        {
            companyName: "Shree Cement Suppliers",
            vendorType: "Material Supplier",
            contactPerson: "Ramesh Gupta",
            phone: "9111100001",
            email: "shreecement@vendor.test",
            address: "Plot 12, Industrial Area",
            city: "Kanpur",
            state: "Uttar Pradesh",
            pincode: "208001",
            gstNumber: "09ABCDE1234F1Z5",
            paymentTerms: "30 days credit",
            creditLimit: 500000,
            rating: 4,
        },
        {
            companyName: "Bharat Machine Rentals",
            vendorType: "Machine Supplier",
            contactPerson: "Suresh Yadav",
            phone: "9111100002",
            email: "bharatmachines@vendor.test",
            address: "Sector 5, Transport Nagar",
            city: "Kanpur",
            state: "Uttar Pradesh",
            pincode: "208002",
            gstNumber: "09FGHIJ5678K1Z2",
            paymentTerms: "Immediate",
            creditLimit: 200000,
            rating: 5,
        },
        {
            companyName: "Om Sai Building Materials & Equipment",
            vendorType: "Both",
            contactPerson: "Vikram Singh",
            phone: "9111100003",
            email: "omsai@vendor.test",
            address: "Near GT Road",
            city: "Lucknow",
            state: "Uttar Pradesh",
            pincode: "226001",
            gstNumber: "09LMNOP9012Q1Z8",
            paymentTerms: "15 days credit",
            creditLimit: 350000,
            rating: 3,
        },
    ];

    const vendors = {};
    for (const v of vendorDefs) {
        const doc = await Vendor.findOneAndUpdate(
            { companyName: v.companyName },
            { $setOnInsert: { ...v, country: "India", createdBy: adminId } },
            { upsert: true, new: true }
        );
        vendors[v.companyName] = doc;
        console.log(`🏢 Vendor ready: ${v.companyName} [${v.vendorType}]`);
    }

    /* ======================================================================
     * 4. MACHINES
     * ==================================================================== */
    const machineDefs = [
        { machineNumber: "UP78-EXC-101", machineType: "Excavator", ownedOrRented: "owned" },
        { machineNumber: "UP78-LDR-202", machineType: "Wheel Loader", ownedOrRented: "rented" },
        { machineNumber: "UP78-TRK-303", machineType: "Tipper Truck", ownedOrRented: "owned" },
    ];

    const machines = {};
    for (const m of machineDefs) {
        const doc = await Machine.findOneAndUpdate(
            { machineNumber: m.machineNumber },
            { $setOnInsert: { ...m, active: true } },
            { upsert: true, new: true }
        );
        machines[m.machineNumber] = doc;
        console.log(`🚜 Machine ready: ${m.machineNumber} [${m.machineType}]`);
    }

    /* ======================================================================
     * 5. LABOUR — labour, mistri, AND operators (category: "Operator")
     * ==================================================================== */
    const labourDefs = [
        {
            key: "labour1",
            name: "Ramesh Kumar",
            phone: "9222200001",
            gender: "Male",
            age: 32,
            labourType: "Permanent Labour",
            category: "Labour",
            skillLevel: "Unskilled",
            wageType: "Daily",
            dailyWage: 500,
            address: "Village Bilhaur, Kanpur",
        },
        {
            key: "labour2",
            name: "Sita Devi",
            phone: "9222200002",
            gender: "Female",
            age: 28,
            labourType: "Contract Labour",
            category: "Labour",
            skillLevel: "Unskilled",
            wageType: "Daily",
            dailyWage: 450,
            address: "Village Ghatampur, Kanpur",
        },
        {
            key: "mistri1",
            name: "Rajesh Mistri",
            phone: "9222200003",
            gender: "Male",
            age: 40,
            labourType: "Permanent Mistri",
            category: "Mistri",
            skillLevel: "Skilled",
            wageType: "Monthly",
            monthlySalary: 22000,
            address: "Kalyanpur, Kanpur",
        },
        {
            key: "mistri2",
            name: "Anil Mistri",
            phone: "9222200004",
            gender: "Male",
            age: 35,
            labourType: "Contract Mistri",
            category: "Mistri",
            skillLevel: "Semi-skilled",
            wageType: "Daily",
            dailyWage: 700,
            address: "Panki, Kanpur",
        },
        {
            key: "operator1",
            name: "Devendra Operator",
            phone: "9222200005",
            gender: "Male",
            age: 38,
            labourType: "Permanent Operator",
            category: "Operator",
            skillLevel: "Skilled",
            wageType: "Monthly",
            monthlySalary: 28000,
            address: "Rawatpur, Kanpur",
        },
        {
            key: "operator2",
            name: "Mahesh Operator",
            phone: "9222200006",
            gender: "Male",
            age: 30,
            labourType: "Contract Operator",
            category: "Operator",
            skillLevel: "Skilled",
            wageType: "Daily",
            dailyWage: 900,
            address: "Barra, Kanpur",
        },
    ];

    const labours = {};
    for (const l of labourDefs) {
        const { key, ...data } = l;
        const doc = await Labour.findOneAndUpdate(
            { phone: l.phone },
            { $setOnInsert: { ...data, status: "Active", createdBy: adminId } },
            { upsert: true, new: true }
        );
        labours[key] = doc;
        console.log(`👷 Labour ready: ${l.name} [${l.category} / ${l.labourType}]`);
    }

    /* ======================================================================
     * 6. PROJECTS — multiple, with manager/supervisor linked
     * ==================================================================== */
    const projectDefs = [
        {
            projectCode: "PRJ-ALPHA-001",
            projectName: "Alpha Residential Tower",
            clientName: "Green Valley Developers",
            projectType: "Residential",
            workScope: "Full Construction",
            contractType: "Lump Sum",
            siteLocation: "Kalyanpur, Kanpur",
            city: "Kanpur",
            state: "Uttar Pradesh",
            pinCode: "208017",
            managerId: users.manager1._id,
            supervisors: [users.supervisor1._id, users.supervisor2._id],
            labours: [labours.labour1._id, labours.mistri1._id, labours.operator1._id],
            expectedStartDate: "2026-01-15",
            expectedCompletionDate: "2027-06-30",
        },
        {
            projectCode: "PRJ-BETA-002",
            projectName: "Beta Commercial Complex",
            clientName: "Skyline Mall Pvt Ltd",
            projectType: "Commercial",
            workScope: "Civil + Finishing",
            contractType: "Item Rate",
            siteLocation: "Civil Lines, Kanpur",
            city: "Kanpur",
            state: "Uttar Pradesh",
            pinCode: "208001",
            managerId: users.manager2._id,
            supervisors: [users.supervisor2._id, users.supervisor3._id],
            labours: [labours.labour2._id, labours.mistri2._id, labours.operator2._id],
            expectedStartDate: "2026-03-01",
            expectedCompletionDate: "2027-12-31",
        },
        {
            projectCode: "PRJ-GAMMA-003",
            projectName: "Gamma Road Infrastructure",
            clientName: "UP State Highways Dept",
            projectType: "Infrastructure",
            workScope: "Road + Drainage",
            contractType: "Government Tender",
            siteLocation: "Outer Ring Road, Kanpur",
            city: "Kanpur",
            state: "Uttar Pradesh",
            pinCode: "208022",
            managerId: users.manager1._id,
            supervisors: [users.supervisor3._id],
            labours: [],
            expectedStartDate: "2026-05-01",
            expectedCompletionDate: "2026-11-30",
        },
    ];

    const projects = {};
    for (const p of projectDefs) {
        const doc = await Project.findOneAndUpdate(
            { projectCode: p.projectCode },
            { $setOnInsert: { ...p, createdBy: adminId, projectIncharge: p.managerId } },
            { upsert: true, new: true }
        );
        projects[p.projectCode] = doc;
        console.log(`🏗️  Project ready: ${p.projectName} [${p.projectCode}]`);
    }

    /* ======================================================================
     * 7. LABOUR ASSIGNMENT — active assignment history (Alpha & Beta)
     * ==================================================================== */
    const assignmentDefs = [
        {
            machineId: machines["UP78-EXC-101"]._id,
            projectId: projects["PRJ-ALPHA-001"]._id,
            operatorId: labours.operator1._id,
            assignDate: new Date("2026-01-20"),
            assignedFrom: new Date("2026-01-20"),
            assignmentStatus: "ACTIVE",
            assignedBy: users.manager1._id,
        },
        {
            machineId: machines["UP78-LDR-202"]._id,
            projectId: projects["PRJ-BETA-002"]._id,
            operatorId: labours.operator2._id,
            assignDate: new Date("2026-03-05"),
            assignedFrom: new Date("2026-03-05"),
            assignmentStatus: "ACTIVE",
            assignedBy: users.manager2._id,
        },
        {
            machineId: machines["UP78-TRK-303"]._id,
            projectId: projects["PRJ-GAMMA-003"]._id,
            operatorId: null,
            assignDate: new Date("2026-05-05"),
            assignedFrom: new Date("2026-05-05"),
            assignmentStatus: "ACTIVE",
            assignedBy: users.manager1._id,
        },
    ];

    for (const a of assignmentDefs) {
        await LabourAssignment.findOneAndUpdate(
            { labourId: a.labourId, status: "Active" },
            {
                $setOnInsert: {
                    ...a,
                    assignmentDate: new Date(),
                    status: "Active",
                },
            },
            { upsert: true, new: true }
        );
    }
    console.log("🔗 Labour assignments linked to Alpha & Beta projects");

    /* ======================================================================
     * 8. MACHINE ASSIGNMENT — machines allotted to projects w/ operator
     * ==================================================================== */


    for (const a of assignmentDefs) {
        await MachineAssignment.findOneAndUpdate(
            { machineId: a.machineId, projectId: a.projectId, releaseDate: null },
            { $setOnInsert: { ...a } },
            { upsert: true, new: true }
        );
    }
    console.log("🔗 Machines assigned to projects");

    /* ======================================================================
     * 9. STOCK — material items ka quantity + project-wise balance
     * ==================================================================== */
    const stockDefs = [
        {
            item: items["Cement (OPC 53)"],
            quantity: 1000,
            damaged: 10,
            projectBalances: [
                { projectId: projects["PRJ-ALPHA-001"]._id, qty: 400 },
                { projectId: projects["PRJ-BETA-002"]._id, qty: 300 },
            ],
        },
        {
            item: items["TMT Steel Bar 12mm"],
            quantity: 5000,
            damaged: 0,
            projectBalances: [
                { projectId: projects["PRJ-ALPHA-001"]._id, qty: 2000 },
                { projectId: projects["PRJ-BETA-002"]._id, qty: 1500 },
            ],
        },
        {
            item: items["Red Bricks"],
            quantity: 20000,
            damaged: 150,
            projectBalances: [{ projectId: projects["PRJ-ALPHA-001"]._id, qty: 8000 }],
        },
        {
            item: items["River Sand"],
            quantity: 300,
            damaged: 0,
            projectBalances: [{ projectId: projects["PRJ-GAMMA-003"]._id, qty: 100 }],
        },
    ];

    for (const s of stockDefs) {
        await Stock.findOneAndUpdate(
            { itemId: s.item._id },
            {
                $setOnInsert: {
                    itemId: s.item._id,
                    quantity: s.quantity,
                    damaged: s.damaged,
                    projectBalances: s.projectBalances,
                },
            },
            { upsert: true, new: true }
        );
        console.log(`📊 Stock ready: ${s.item.name}`);
    }

    /* ======================================================================
     * SUMMARY
     * ==================================================================== */
    console.log("\n================ LOGIN CREDENTIALS (password same for all) ================");
    console.table(
        userDefs.map((u) => ({ Role: u.role, Email: u.email, Password: COMMON_PASSWORD }))
    );
    console.log(`Password for every user above: ${COMMON_PASSWORD}`);
    console.log("=============================================================================\n");

    console.log("Projects seeded:", Object.keys(projects).join(", "));
    console.log("Vendors seeded:", Object.keys(vendors).join(", "));
    console.log("Machines seeded:", Object.keys(machines).join(", "));
    console.log("Labour (incl. operators) seeded:", Object.values(labours).map((l) => l.name).join(", "));

    await mongoose.disconnect();
    console.log("\n🔌 MongoDB disconnected. Seeding complete.");
    process.exit(0);
}

run().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});