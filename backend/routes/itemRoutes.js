import express from "express";
import {
    addItem,
    getAllItems,
    getItemById,
    updateItem,
    deleteItem
} from "../controllers/itemController.js";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";

const router = express.Router();

// CREATE
router.post("/add", auth, roleCheck("admin", "manager"), addItem);

// READ
router.get("/all", auth, getAllItems);
router.get("/:id", auth, getItemById);

// UPDATE
router.put("/update/:id", auth, roleCheck("admin", "manager"), updateItem);

// DELETE
router.delete("/delete/:id", auth, roleCheck("admin"), deleteItem);

export default router;
