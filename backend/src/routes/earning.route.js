import { Router } from "express";
import { authFreelancer, auth } from "../middlewares/auth.middleware.js";
import {
    getEarningsTransactions,
    getEarningsSummary,
    getTransactionDetails,
    getEarningsStats,
    generateInvoice,
    exportEarnings,
    getWithdrawalHistory,
    requestWithdrawal
} from "../controllers/earning.controller.js";

const earningRouter = Router();

// ==================== FREELANCER EARNING ROUTES ====================

// Get earnings summary (for dashboard)
earningRouter.get("/summary", authFreelancer, getEarningsSummary);

// Get earnings stats (for dashboard charts)
earningRouter.get("/stats", authFreelancer, getEarningsStats);

// Get all transactions with filters
earningRouter.get("/transactions", authFreelancer, getEarningsTransactions);

// Export earnings as CSV
earningRouter.get("/export", authFreelancer, exportEarnings);

// Get single transaction details
earningRouter.get("/transactions/:orderId", authFreelancer, getTransactionDetails);

// Generate invoice for transaction
earningRouter.get("/transactions/:orderId/invoice", authFreelancer, generateInvoice);

// Withdrawal routes (for future implementation)
earningRouter.get("/withdrawals", authFreelancer, getWithdrawalHistory);
earningRouter.post("/withdraw", authFreelancer, requestWithdrawal);

export default earningRouter;