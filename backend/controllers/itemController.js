import Item from "../models/Item.js";
import Vendor from "../models/Vendor.js";

// CREATE ITEM
export const addItem = async (req, res) => {
  try {
    const { vendorId, name, type, category, unit, hsnCode, description } = req.body;
    // console.log(req.body)

    if (!vendorId) {
      return res.status(400).json({ message: "Vendor ID is required" });
    }

    if (!name || !type) {
      return res.status(400).json({ message: "Name & type are required" });
    }

    // Check duplicate for this vendor
    const existing = await Item.findOne({ name, type, vendorId });
    if (existing) {
      return res.status(409).json({ message: "Item already exists for this vendor" });
    }

    // Create new item
    const item = await Item.create({
      vendorId,
      name,
      type,
      category,
      unit,
      hsnCode,
      description,
    });

    // --- IMPORTANT: Add item reference inside Vendor ---
    await Vendor.findByIdAndUpdate(
      vendorId,
      { $push: { itemsSupplied: item._id } },
      { new: true }
    );

    return res.status(201).json({ message: "Item added successfully", item });

  } catch (error) {
    return res.status(500).json({ message: "Error adding item", error: error.message });
  }
};



// GET ALL ITEMS
export const getAllItems = async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    return res.status(200).json({ message: "Items fetched", total: items.length, items });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching items", error: error.message });
  }
};

// GET SINGLE ITEM
export const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    return res.status(200).json({ message: "Item fetched", item });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching item", error: error.message });
  }
};

// UPDATE ITEM
export const updateItem = async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedItem) return res.status(404).json({ message: "Item not found" });

    return res.status(200).json({ message: "Item updated", item: updatedItem });
  } catch (error) {
    return res.status(500).json({ message: "Error updating item", error: error.message });
  }
};

// DELETE ITEM
export const deleteItem = async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);

    if (!deletedItem) return res.status(404).json({ message: "Item not found" });

    return res.status(200).json({ message: "Item deleted", deletedItem });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting item", error: error.message });
  }
};
