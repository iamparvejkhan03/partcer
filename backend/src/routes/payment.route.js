import express from "express";
import {
    createOrder,
    verifyPayment,
    handleWebhook,
    getOrderStatus,
    getUserOrders,
    markOrderDelivered,
    completeOrder,
    getAllTransactions,
    getTransactionById,
    getTransactionSummary,
    getAllOrdersForAdmin,
    adminGetOrderById,
    adminUpdateOrderStatus,
    adminGetOrderStats,
    getOrderHistoryBetweenUsers,
} from "../controllers/payment.controller.js";
import { verifyJWT, authAdmin } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const paymentRouter = express.Router();

// Public webhook endpoint (no auth required)
paymentRouter.post("/webhook", express.raw({ type: "application/json" }), handleWebhook);

// Protected routes (require authentication)
paymentRouter.post("/create-order", verifyJWT, createOrder);
paymentRouter.post("/verify", verifyJWT, verifyPayment);
paymentRouter.get("/status/:orderId", verifyJWT, getOrderStatus);
paymentRouter.get("/user/:userId", verifyJWT, getUserOrders);

// Order history between two users
paymentRouter.get("/history/:userId1/:userId2", verifyJWT, getOrderHistoryBetweenUsers);

// Delivery and completion routes
paymentRouter.post("/orders/:orderId/deliver", verifyJWT, upload.array('attachments', 5), markOrderDelivered);
paymentRouter.post("/orders/:orderId/complete", verifyJWT, completeOrder);

// Transaction routes (Admin only)
paymentRouter.get("/admin/transactions", verifyJWT, authAdmin, getAllTransactions);
paymentRouter.get("/admin/transactions/:transactionId", verifyJWT, authAdmin, getTransactionById);
paymentRouter.get("/admin/transactions/summary", verifyJWT, authAdmin, getTransactionSummary);

// Admin Order Management Routes
paymentRouter.get("/admin/orders", verifyJWT, authAdmin, getAllOrdersForAdmin);
paymentRouter.get("/admin/orders/:orderId", verifyJWT, authAdmin, adminGetOrderById);
paymentRouter.put("/admin/orders/:orderId/status", verifyJWT, authAdmin, adminUpdateOrderStatus);
paymentRouter.get("/admin/stats", verifyJWT, authAdmin, adminGetOrderStats);

export default paymentRouter;