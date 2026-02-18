// routes/reportRoutes.js
import express from "express";
import {
    submitDailyReport,
    getDailyReport,
    listDailyReports,
    updateDailyReport,
    deleteDailyReport,
    approveDailyReport
} from "../controllers/reportController.js";
// import { auth } from "../middlewares/auth.js"; // assume exists
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, submitDailyReport);               // create
router.get("/", auth, listDailyReports);                 // list + filters
router.get("/:id", auth, getDailyReport);                // single
router.put("/:id", auth, updateDailyReport);             // update
router.delete("/:id", auth, deleteDailyReport);          // delete
router.patch("/:id/approve", auth, approveDailyReport);  // approve/reject

export default router;
