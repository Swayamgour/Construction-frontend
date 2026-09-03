import Vendor from "../models/Vendor.js";
import Item from "../models/Item.js"; // ensure model is loaded
import { success, fail, getPagination, buildPagination } from "../utils/apiResponse.js";


export const addVendor = async (req, res) => {
    try {
        const {
            companyName,

            businessType,
            website,
            yearEstablished,
            contactPerson,
            email,
            phone,
            alternatePhone,
            address,
            city,
            state,
            pincode,
            country,
            gstNumber,
            panNumber,
            accountHolderName,
            bankName,
            accountNumber,
            ifscCode,
            branchName,
            itemsSupplied,
            aadhaarCardFile,
            panCardFile
        } = req.body;

        // Required field validation
        if (!companyName || !contactPerson || !phone || !address || !city || !state || !pincode) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        // Check if vendor already exists with same phone or email
        const existVendor = await Vendor.findOne({ phone });
        if (existVendor) {
            return res.status(409).json({ message: "Vendor already exists" });
        }

        const vendor = await Vendor.create({
            companyName,

            businessType,
            website,
            yearEstablished,
            contactPerson,
            email,
            phone,
            alternatePhone,
            address,
            city,
            state,
            pincode,
            country,
            gstNumber,
            panNumber,
            accountHolderName,
            bankName,
            accountNumber,
            ifscCode,
            branchName,
            itemsSupplied,
            createdBy: req.user?.id || null,

            //  createdBy: req.user?.id || null,
            aadhaarCardFile: req.files?.aadhaarCardFile?.[0]?.path || null,
            panCardFile: req.files?.panCardFile?.[0]?.path || null,
        });

        res.status(201).json({
            message: "Vendor added successfully",
            vendor,
        });
    } catch (error) {
        console.error("Vendor Add Error:", error);
        res.status(500).json({
            message: "Error adding vendor",
            error: error.message,
        });
    }
};


/**
 * PUT /api/vendor/:id
 * Added to close a frontend gap — CreateNewVendorForm.jsx's edit mode
 * called useUpdateVendorMutation against a route that never existed.
 */
export const updateVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const vendor = await Vendor.findById(id);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        const editableFields = [
            "companyName", "businessType", "website", "yearEstablished",
            "contactPerson", "email", "phone", "alternatePhone", "address",
            "city", "state", "pincode", "country", "gstNumber", "panNumber",
            "accountHolderName", "bankName", "accountNumber", "ifscCode",
            "branchName", "itemsSupplied",
        ];

        if (req.body.phone && req.body.phone !== vendor.phone) {
            const exists = await Vendor.findOne({ phone: req.body.phone, _id: { $ne: id } });
            if (exists) {
                return res.status(409).json({ message: "Another vendor already uses this phone number" });
            }
        }

        for (const field of editableFields) {
            if (req.body[field] !== undefined) vendor[field] = req.body[field];
        }

        if (req.files?.aadhaarCardFile?.[0]) vendor.aadhaarCardFile = req.files.aadhaarCardFile[0].path;
        if (req.files?.panCardFile?.[0]) vendor.panCardFile = req.files.panCardFile[0].path;

        await vendor.save();

        res.status(200).json({
            message: "Vendor updated successfully",
            vendor,
        });
    } catch (error) {
        console.error("Vendor Update Error:", error);
        res.status(500).json({
            message: "Error updating vendor",
            error: error.message,
        });
    }
};

/**
 * GET /api/vendors?page&limit&search&sortBy&sortOrder
 * Added pagination/search here (follow-up audit concern #12 — this list
 * had none before). Response shape changes from a bare array to the
 * standard { success, data, pagination } envelope used everywhere else
 * in the newer modules — flag this to the frontend team as a contract
 * change if anything currently reads this endpoint as a raw array.
 */
export const getAllVendors = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const { search, sortBy = "createdAt", sortOrder = "desc" } = req.query;

        const filter = {};
        if (search) {
            filter.$or = [
                { companyName: { $regex: search, $options: "i" } },
                { contactPerson: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        const [vendors, total] = await Promise.all([
            Vendor.find(filter)
                .populate("itemsSupplied", "name type category unit")
                .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
                .skip(skip)
                .limit(limit),
            Vendor.countDocuments(filter),
        ]);

        return success(res, 200, "Vendors fetched", vendors, buildPagination(page, limit, total));
    } catch (error) {
        return fail(res, 500, "Error fetching vendors", error);
    }
};


export const assignItemsToVendor = async (req, res) => {
    try {
        const { vendorId, itemIds } = req.body;

        if (!vendorId || !itemIds || !Array.isArray(itemIds)) {
            return res.status(400).json({ message: "vendorId and itemIds[] required" });
        }

        // Validate vendor
        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        // Validate items exist
        const validItems = await Item.find({ _id: { $in: itemIds } });
        if (validItems.length !== itemIds.length) {
            return res.status(400).json({ message: "Some itemIds are invalid" });
        }

        // Assign items using $addToSet to avoid duplicates
        const updatedVendor = await Vendor.findByIdAndUpdate(
            vendorId,
            { $addToSet: { itemsSupplied: { $each: itemIds } } },
            { new: true }
        ).populate("itemsSupplied");

        return res.status(200).json({
            message: "Items assigned to vendor successfully",
            vendor: updatedVendor,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error assigning items",
            error: error.message,
        });
    }
};


export const assignItemsWithDetails = async (req, res) => {
    try {
        const { vendorId, items } = req.body;

        if (!vendorId || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "vendorId and items[] required" });
        }

        // Validate vendor exists
        const vendor = await Vendor.findById(vendorId);
        if (!vendor) return res.status(404).json({ message: "Vendor not found" });

        // Validate items exist
        const itemIds = items.map((i) => i.itemId);
        const validItems = await Item.find({ _id: { $in: itemIds } });
        if (validItems.length !== itemIds.length) {
            return res.status(400).json({ message: "Invalid itemIds included" });
        }

        // Push or update vendor items
        items.forEach(newItem => {
            const existing = vendor.vendorItems.find(v => v.itemId.toString() === newItem.itemId);

            if (existing) {
                // Update existing entry
                existing.unit = newItem.unit || existing.unit;
                existing.rate = newItem.rate ?? existing.rate;
                existing.deliveryTime = newItem.deliveryTime || existing.deliveryTime;
                existing.deliveryDate = newItem.deliveryDate || existing.deliveryDate;
            } else {
                vendor.vendorItems.push(newItem);
            }
        });

        await vendor.save();

        const updatedVendor = await Vendor.findById(vendorId).populate("vendorItems.itemId");

        return res.status(200).json({
            message: "Vendor items updated successfully",
            vendor: updatedVendor,
        });

    } catch (error) {
        return res.status(500).json({ message: "Error assigning vendor items", error: error.message });
    }
};

export const getVendorDetails = async (req, res) => {
    try {
        const vendorId = req.params.id;

        const vendor = await Vendor.findById(vendorId)
            .populate("itemsSupplied", "name type category unit")
            .populate({
                path: "vendorItems.itemId",
                select: "name type category unit"
            });

        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        // convert local filename to full URL
        if (vendor.aadhaarCardFile) {
            vendor.aadhaarCardFile = `${process.env.BASE_URL}/uploads/${vendor.aadhaarCardFile}`;
        }

        if (vendor.panCardFile) {
            vendor.panCardFile = `${process.env.BASE_URL}/uploads/${vendor.panCardFile}`;
        }

        return res.status(200).json({
            message: "Vendor details fetched successfully",
            vendor,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error fetching vendor details",
            error: error.message,
        });
    }
};




