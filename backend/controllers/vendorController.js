import Vendor from "../models/Vendor.js";
// import Vendor from "../models/Vendor.js";
import Item from "../models/Item.js"; // ensure model is loaded


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


export const getAllVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find()
            .populate("itemsSupplied", "name type category unit"); // populate to show item names

        return res.status(200).json(vendors);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching vendors",
            error: error.message
        });
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




