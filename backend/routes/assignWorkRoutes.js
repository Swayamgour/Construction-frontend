import express from "express";
import {
    createAssignedWork,
    getAllAssignedWork,
    getAssignedWorkById,
    updateAssignedWork,
    deleteAssignedWork
} from "../controllers/assignWorkController.js";

const router = express.Router();

router.post("/", createAssignedWork);
router.get("/", getAllAssignedWork);
router.get("/:id", getAssignedWorkById);
router.put("/:id", updateAssignedWork);
router.delete("/:id", deleteAssignedWork);

export default router;
