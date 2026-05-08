import { Router } from "express";
import {
  auth,
  authFreelancer,
  authBuyer,
  authAdmin,
  optionalAuth,
} from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import {
  createOrder,
  getOrders,
  getOrderById,
  getOrderByOrderId,
  updateOrderStatus,
  deliverOrder,
  requestRevision,
  approveDelivery,
  cancelOrder,
  openDispute,
  addMessage,
  getOrderStats,
  addReview,
  getOverdueOrders,
  getNeedingAttention,
  adminGetAllOrders,
  adminGetOrderDetails,
  adminUpdateOrderStatus,
  adminProcessRefund,
  adminResolveDispute,
  adminAddNote,
  adminFlagOrder,
  adminDeleteOrder,
  submitRequirements,
  adminUpdatePaymentStatus,
} from "../controllers/order.controller.js";

const orderRouter = Router();

// ==================== PUBLIC ROUTES ====================

// None - all order routes require authentication

// ==================== PROTECTED ROUTES (require login) ====================

// Create order (Buyers only)
orderRouter.post("/", authBuyer, createOrder);

// Get user's orders (both buyer and seller)
orderRouter.get("/", auth, getOrders);

// Get order stats
orderRouter.get("/stats", auth, getOrderStats);

// Get overdue orders (for sellers)
orderRouter.get("/overdue", authFreelancer, getOverdueOrders);

// Get orders needing attention (for admin - but we'll handle in admin routes)

// Get order by ID
orderRouter.get("/:orderId", auth, getOrderById);

// Get order by order ID string (e.g., ORD-12345)
orderRouter.get("/id/:orderId", auth, getOrderByOrderId);

// Update order status
orderRouter.patch("/:orderId/status", auth, updateOrderStatus);

// Deliver order (Freelancers only)
orderRouter.post(
  "/:orderId/deliver",
  authFreelancer,
  upload.array("attachments", 5),
  deliverOrder,
);

// Request revision (Buyers only)
orderRouter.post(
  "/:orderId/revision",
  authBuyer,
  upload.array("attachments", 5),
  requestRevision,
);

// Request revision (Buyers only)
orderRouter.post(
  "/:orderId/delivery/:deliveryId/revision",
  authBuyer,
  requestRevision,
);

// Approve delivery (Buyers only)
orderRouter.post("/:orderId/approve", authBuyer, approveDelivery);

// Cancel order
orderRouter.post("/:orderId/cancel", auth, cancelOrder);

// Open dispute
orderRouter.post(
  "/:orderId/dispute",
  auth,
  upload.array("attachments", 5),
  openDispute,
);

// Add message to order
orderRouter.post(
  "/:orderId/messages",
  auth,
  upload.array("attachments", 5),
  addMessage,
);

// Add review (Buyers only)
orderRouter.post("/:orderId/review", authBuyer, addReview);

// Submit requirements (Buyers only)
orderRouter.post(
  "/:orderId/requirements",
  authBuyer,
  upload.array("attachments", 5),
  submitRequirements,
);

// ==================== ADMIN ROUTES ====================

// Get all orders (admin)
orderRouter.get("/admin/all", authAdmin, adminGetAllOrders);

// Get orders needing attention (admin)
orderRouter.get("/admin/attention", authAdmin, getNeedingAttention);

// Get order details (admin)
orderRouter.get("/admin/:orderId", authAdmin, adminGetOrderDetails);

// Update order status (admin)
orderRouter.patch("/admin/:orderId/status", authAdmin, adminUpdateOrderStatus);

// Process refund (admin)
orderRouter.post("/admin/:orderId/refund", authAdmin, adminProcessRefund);

// Resolve dispute (admin)
orderRouter.post(
  "/admin/:orderId/dispute/resolve",
  authAdmin,
  adminResolveDispute,
);

// Add admin note
orderRouter.post("/admin/:orderId/notes", authAdmin, adminAddNote);

// Flag order
orderRouter.post("/admin/:orderId/flag", authAdmin, adminFlagOrder);

// Delete order (admin only - hard delete)
orderRouter.delete("/admin/:orderId", authAdmin, adminDeleteOrder);

// Update payment status (admin only)
orderRouter.patch(
  "/admin/:orderId/payment-status",
  authAdmin,
  adminUpdatePaymentStatus,
);

export default orderRouter;
