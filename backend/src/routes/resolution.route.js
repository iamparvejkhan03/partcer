import { Router } from "express";
import { auth, authAdmin } from "../middlewares/auth.middleware.js";
import {
    submitComplaint,
    getResolutionStatus,
    getAllResolutions,
    updateResolutionStatus,
    adminGetResolutionStats,
} from "../controllers/resolution.controller.js";
import { validateRefundableOrder } from "../middlewares/transaction.middleware.js";

const resolutionRouter = Router();

// User routes
resolutionRouter.post("/orders/:orderId/complaint", auth, submitComplaint);
resolutionRouter.get("/orders/:orderId/status", auth, getResolutionStatus);

// Admin routes
resolutionRouter.get("/admin/resolutions", auth, authAdmin, getAllResolutions);
resolutionRouter.put("/admin/resolutions/:resolutionId", auth, authAdmin, validateRefundableOrder, updateResolutionStatus);
resolutionRouter.get("/admin/stats", auth, authAdmin, adminGetResolutionStats);

export default resolutionRouter;