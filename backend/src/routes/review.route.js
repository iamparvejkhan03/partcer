// routes/review.routes.js
import { Router } from "express";
import {
  auth,
  authFreelancer,
  authBuyer,
  authAdmin,
} from "../middlewares/auth.middleware.js";
import {
  // User review controllers
  addOrderReview,
  getOrderReviews,
  getUserReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  respondToReview,
  updateResponse,
  markHelpful,
  unmarkHelpful,
  flagReview,

  // Admin review controllers
  adminGetAllReviews,
  adminGetFlaggedReviews,
  adminGetNeedingModeration,
  adminGetReviewDetails,
  adminModerateReview,
  adminEditReview,
  adminResolveFlag,
  adminHardDeleteReview,
  adminRestoreReview,
  adminSearchReviews,
  adminGetReviewStats,
  getServiceReviews,
} from "../controllers/review.controller.js";

const reviewRouter = Router();

// ==================== PUBLIC ROUTES ====================

// Get reviews for a user (public profile)
reviewRouter.get("/user/:userId", getUserReviews);

// Get reviews for a service (public)
reviewRouter.get("/service/:serviceId", getServiceReviews);

// ==================== PROTECTED ROUTES (require login) ====================

// Get reviews for an order (participants only)
reviewRouter.get("/order/:orderId", auth, getOrderReviews);

// Get current user's reviews
reviewRouter.get("/me", auth, getMyReviews);

// Add review for an order (buyer or freelancer who was part of the order)
reviewRouter.post("/order/:orderId", auth, addOrderReview);

// Update/delete own review
reviewRouter.put("/:reviewId", auth, updateReview);
reviewRouter.delete("/:reviewId", auth, deleteReview);

// Respond to review (reviewee only)
reviewRouter.post("/:reviewId/respond", auth, respondToReview);
reviewRouter.put("/:reviewId/respond", auth, updateResponse);

// Helpful marks
reviewRouter.post("/:reviewId/helpful", auth, markHelpful);
reviewRouter.delete("/:reviewId/helpful", auth, unmarkHelpful);

// Flag review
reviewRouter.post("/:reviewId/flag", auth, flagReview);

// ==================== ADMIN ROUTES ====================

// Get all reviews with filters
reviewRouter.get("/admin/all", authAdmin, adminGetAllReviews);

// Get review statistics
reviewRouter.get("/admin/stats", authAdmin, adminGetReviewStats);

// Get flagged reviews
reviewRouter.get("/admin/flagged", authAdmin, adminGetFlaggedReviews);

// Get reviews needing moderation
reviewRouter.get(
  "/admin/needing-moderation",
  authAdmin,
  adminGetNeedingModeration,
);

// Search reviews
reviewRouter.get("/admin/search", authAdmin, adminSearchReviews);

// Get single review details
reviewRouter.get("/admin/:reviewId", authAdmin, adminGetReviewDetails);

// Moderate review
reviewRouter.patch("/admin/:reviewId/moderate", authAdmin, adminModerateReview);

// Edit review
reviewRouter.put("/admin/:reviewId", authAdmin, adminEditReview);

// Resolve flag
reviewRouter.patch(
  "/admin/:reviewId/flags/:flagId/resolve",
  authAdmin,
  adminResolveFlag,
);

// Restore soft-deleted review
reviewRouter.post("/admin/:reviewId/restore", authAdmin, adminRestoreReview);

// Hard delete review
reviewRouter.delete("/admin/:reviewId/hard", authAdmin, adminHardDeleteReview);

export default reviewRouter;