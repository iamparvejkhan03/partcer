import { Router } from "express";
import { authFreelancer, authAdmin } from "../middlewares/auth.middleware.js";
import {
    getEarningsSummary,
    getWithdrawalHistory,
    requestWithdrawal,
    cancelWithdrawal,
    adminGetWithdrawals,
    processWithdrawal
} from "../controllers/withdrawal.controller.js";

const withdrawalRouter = Router();

// Freelancer routes
withdrawalRouter.get("/earnings", authFreelancer, getEarningsSummary);
withdrawalRouter.get("/history", authFreelancer, getWithdrawalHistory);
withdrawalRouter.post("/request", authFreelancer, requestWithdrawal);
withdrawalRouter.post("/:withdrawalId/cancel", authFreelancer, cancelWithdrawal);

// Admin routes
withdrawalRouter.get("/admin/all", authAdmin, adminGetWithdrawals);
withdrawalRouter.patch("/admin/:withdrawalId/process", authAdmin, processWithdrawal);

export default withdrawalRouter;