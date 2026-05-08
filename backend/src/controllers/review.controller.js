// controllers/review.controller.js
import Review from "../models/review.model.js";
import Order from "../models/order.model.js";
import Service from "../models/service.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ==================== BUYER/FREELANCER REVIEW CONTROLLERS ====================

/**
 * @desc    Add a review for a completed order
 * @route   POST /api/v1/reviews/order/:orderId
 * @access  Private (Buyer or Freelancer who was part of the order)
 */
export const addOrderReview = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { rating, comment, privateFeedback } = req.body;
  const userId = req.user._id;

  // Validation
  if (!rating || rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  if (!comment || comment.length < 10) {
    throw new ApiError(400, "Comment must be at least 10 characters");
  }

  // Find the order
  const order = await Order.findById(orderId)
    .populate("service")
    .populate("buyer")
    .populate("seller");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Check if order is completed
  if (order.status !== "completed") {
    throw new ApiError(400, "You can only review completed orders");
  }

  // Determine if user is buyer or seller
  const isBuyer = order.buyer._id.toString() === userId.toString();
  const isSeller = order.seller._id.toString() === userId.toString();

  if (!isBuyer && !isSeller) {
    throw new ApiError(403, "You are not part of this order");
  }

  // Check if user has already reviewed this order
  const existingReview = await Review.findOne({
    order: orderId,
    reviewer: userId,
  });

  if (existingReview) {
    throw new ApiError(400, "You have already reviewed this order");
  }

  // Determine reviewer and reviewee
  const reviewer = userId;
  const reviewerRole = isBuyer ? "buyer" : "freelancer";
  const reviewee = isBuyer ? order.seller._id : order.buyer._id;
  const revieweeRole = isBuyer ? "freelancer" : "buyer";

  // Create review
  const review = await Review.create({
    rating,
    comment,
    privateFeedback: privateFeedback || "",
    reviewer,
    reviewerRole,
    reviewee,
    revieweeRole,
    order: orderId,
    service: order.service?._id || order.service,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    source: req.headers["x-source"] || "web",
  });

  // Update order with review reference based on who reviewed
  if (isBuyer) {
    order.review = {
      rating,
      comment,
      privateFeedback,
      submittedBy: userId,
      submittedAt: new Date(),
    };
  } else {
    order.sellerReview = {
      rating,
      comment,
      submittedAt: new Date(),
    };
  }

  await order.save();

  // Populate response
  await review.populate([
    { path: "reviewer", select: "firstName lastName displayName profileImage" },
    { path: "reviewee", select: "firstName lastName displayName profileImage" },
    { path: "service", select: "title" },
  ]);

  return res
    .status(201)
    .json(new ApiResponse(201, review, "Review added successfully"));
});

/**
 * @desc    Get all reviews for an order (both buyer and seller reviews)
 * @route   GET /api/v1/reviews/order/:orderId
 * @access  Private (Participants of the order or admin)
 */
export const getOrderReviews = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user._id;

  // Find the order
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Check if user is part of the order or admin
  const isParticipant =
    order.buyer.toString() === userId.toString() ||
    order.seller.toString() === userId.toString();

  if (!isParticipant && req.user.userType !== "admin") {
    throw new ApiError(403, "You are not authorized to view these reviews");
  }

  // Get reviews for this order
  const reviews = await Review.find({
    order: orderId,
    isDeleted: false,
  })
    .populate(
      "reviewer",
      "firstName lastName displayName profileImage userType",
    )
    .populate(
      "reviewee",
      "firstName lastName displayName profileImage userType",
    )
    .populate("service", "title");

  return res
    .status(200)
    .json(new ApiResponse(200, reviews, "Order reviews fetched successfully"));
});

/**
 * @desc    Get reviews for a user (as reviewee)
 * @route   GET /api/v1/reviews/user/:userId
 * @access  Public
 */
export const getUserReviews = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role, page = 1, limit = 10 } = req.query;

  const options = {
    limit: parseInt(limit),
    skip: (parseInt(page) - 1) * parseInt(limit),
  };

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Get reviews
  const reviews = await Review.getUserReviews(userId, role, options);

  // Get total count
  const totalCount = await Review.countDocuments({
    reviewee: userId,
    status: "approved",
    isDeleted: false,
    ...(role && { revieweeRole: role }),
  });

  // Get statistics
  const stats = await Review.getUserStats(userId);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        reviews,
        stats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit)),
        },
      },
      "User reviews fetched successfully",
    ),
  );
});

/**
 * @desc    Get reviews for a user (as reviewee)
 * @route   GET /api/v1/reviews/user/:userId
 * @access  Public
 */
export const getServiceReviews = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  // Check if service exists
  const service = await Service.findById(serviceId);
  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  // Get reviews with stats and pagination
  const result = await Review.getServiceReviews(serviceId, page, limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      result,
      "Service reviews fetched successfully",
    ),
  );
});

/**
 * @desc    Get reviews written by current user
 * @route   GET /api/v1/reviews/me
 * @access  Private
 */
export const getMyReviews = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10 } = req.query;

  const reviews = await Review.find({
    reviewer: userId,
    isDeleted: false,
  })
    .populate(
      "reviewee",
      "firstName lastName displayName profileImage userType",
    )
    .populate("service", "title")
    .populate("order", "orderId")
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const totalCount = await Review.countDocuments({
    reviewer: userId,
    isDeleted: false,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit)),
        },
      },
      "My reviews fetched successfully",
    ),
  );
});

/**
 * @desc    Update a review (only by the reviewer)
 * @route   PUT /api/v1/reviews/:reviewId
 * @access  Private
 */
export const updateReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { rating, comment, privateFeedback } = req.body;
  const userId = req.user._id;

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  // Check if user is the reviewer
  if (review.reviewer.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only update your own reviews");
  }

  // Check if review is not deleted
  if (review.isDeleted) {
    throw new ApiError(400, "Cannot update deleted review");
  }

  // Check if review is not flagged/under moderation
  if (review.status === "flagged" || review.status === "pending") {
    throw new ApiError(400, "Cannot update review under moderation");
  }

  // Save to edit history
  review.editHistory.push({
    rating: review.rating,
    comment: review.comment,
    editedAt: new Date(),
  });

  // Update fields
  if (rating) {
    if (rating < 1 || rating > 5) {
      throw new ApiError(400, "Rating must be between 1 and 5");
    }
    review.rating = rating;
  }

  if (comment) {
    if (comment.length < 10) {
      throw new ApiError(400, "Comment must be at least 10 characters");
    }
    review.comment = comment;
  }

  if (privateFeedback !== undefined) {
    review.privateFeedback = privateFeedback;
  }

  review.isEdited = true;
  review.editedAt = new Date();

  await review.save();

  // Populate response
  await review.populate([
    { path: "reviewer", select: "firstName lastName displayName profileImage" },
    { path: "reviewee", select: "firstName lastName displayName profileImage" },
    { path: "service", select: "title" },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, review, "Review updated successfully"));
});

/**
 * @desc    Delete a review (soft delete by reviewer)
 * @route   DELETE /api/v1/reviews/:reviewId
 * @access  Private
 */
export const deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id;

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  // Check if user is the reviewer or admin
  if (
    review.reviewer.toString() !== userId.toString() &&
    req.user.userType !== "admin"
  ) {
    throw new ApiError(403, "You can only delete your own reviews");
  }

  if (review.isDeleted) {
    throw new ApiError(400, "Review already deleted");
  }

  await review.softDelete(userId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Review deleted successfully"));
});

/**
 * @desc    Add response to a review (by reviewee)
 * @route   POST /api/v1/reviews/:reviewId/respond
 * @access  Private
 */
export const respondToReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { comment } = req.body;
  const userId = req.user._id;

  if (!comment || comment.length < 5) {
    throw new ApiError(400, "Response must be at least 5 characters");
  }

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  // Check if user is the reviewee
  if (review.reviewee.toString() !== userId.toString()) {
    throw new ApiError(403, "Only the reviewee can respond to this review");
  }

  // Check if review is approved
  if (review.status !== "approved") {
    throw new ApiError(400, "Can only respond to approved reviews");
  }

  // Check if already responded
  if (review.response && review.response.comment) {
    throw new ApiError(400, "You have already responded to this review");
  }

  await review.addResponse(comment, userId);

  return res
    .status(200)
    .json(new ApiResponse(200, review, "Response added successfully"));
});

/**
 * @desc    Update response to a review (by reviewee)
 * @route   PUT /api/v1/reviews/:reviewId/respond
 * @access  Private
 */
export const updateResponse = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { comment } = req.body;
  const userId = req.user._id;

  if (!comment || comment.length < 5) {
    throw new ApiError(400, "Response must be at least 5 characters");
  }

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  // Check if user is the reviewee
  if (review.reviewee.toString() !== userId.toString()) {
    throw new ApiError(403, "Only the reviewee can update this response");
  }

  // Check if response exists
  if (!review.response || !review.response.respondedBy) {
    throw new ApiError(400, "No response exists to update");
  }

  await review.updateResponse(comment, userId);

  return res
    .status(200)
    .json(new ApiResponse(200, review, "Response updated successfully"));
});

/**
 * @desc    Mark review as helpful
 * @route   POST /api/v1/reviews/:reviewId/helpful
 * @access  Private
 */
export const markHelpful = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id;

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  // Check if user is not the reviewer or reviewee
  if (
    review.reviewer.toString() === userId.toString() ||
    review.reviewee.toString() === userId.toString()
  ) {
    throw new ApiError(400, "You cannot mark your own review as helpful");
  }

  await review.markHelpful(userId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, { helpful: review.helpful }, "Marked as helpful"),
    );
});

/**
 * @desc    Remove helpful mark
 * @route   DELETE /api/v1/reviews/:reviewId/helpful
 * @access  Private
 */
export const unmarkHelpful = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id;

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  await review.unmarkHelpful(userId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, { helpful: review.helpful }, "Removed helpful mark"),
    );
});

/**
 * @desc    Flag a review (report inappropriate content)
 * @route   POST /api/v1/reviews/:reviewId/flag
 * @access  Private
 */
export const flagReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { reason, description } = req.body;
  const userId = req.user._id;

  if (!reason) {
    throw new ApiError(400, "Please provide a reason for flagging");
  }

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  // Check if user is not the reviewer
  if (review.reviewer.toString() === userId.toString()) {
    throw new ApiError(400, "You cannot flag your own review");
  }

  // Check if already flagged by this user
  const alreadyFlagged = review.flags.some(
    (flag) =>
      flag.flaggedBy.toString() === userId.toString() &&
      flag.status === "pending",
  );

  if (alreadyFlagged) {
    throw new ApiError(400, "You have already flagged this review");
  }

  await review.flag({ reason, description }, userId);

  return res
    .status(200)
    .json(new ApiResponse(200, review, "Review flagged successfully"));
});

// ==================== ADMIN REVIEW CONTROLLERS ====================

/**
 * @desc    Get all reviews (admin)
 * @route   GET /api/v1/reviews/admin/all
 * @access  Private (Admin only)
 */
export const adminGetAllReviews = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    reviewerRole,
    revieweeRole,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const query = { isDeleted: false };

  if (status) query.status = status;
  if (reviewerRole) query.reviewerRole = reviewerRole;
  if (revieweeRole) query.revieweeRole = revieweeRole;

  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  const reviews = await Review.find(query)
    .populate("reviewer", "firstName lastName email userType")
    .populate("reviewee", "firstName lastName email userType")
    .populate("service", "title")
    .populate("order", "orderId")
    .sort(sort)
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const totalCount = await Review.countDocuments(query);

  // Get statistics
  const stats = await Review.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        pendingReviews: {
          $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
        },
        approvedReviews: {
          $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
        },
        flaggedReviews: {
          $sum: { $cond: [{ $eq: ["$status", "flagged"] }, 1, 0] },
        },
        rejectedReviews: {
          $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
        },
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        reviews,
        stats: stats[0] || null,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit)),
        },
      },
      "All reviews fetched successfully",
    ),
  );
});

/**
 * @desc    Get flagged reviews (admin)
 * @route   GET /api/v1/reviews/admin/flagged
 * @access  Private (Admin only)
 */
export const adminGetFlaggedReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.getFlaggedReviews();

  return res
    .status(200)
    .json(
      new ApiResponse(200, reviews, "Flagged reviews fetched successfully"),
    );
});

/**
 * @desc    Get reviews needing moderation (admin)
 * @route   GET /api/v1/reviews/admin/needing-moderation
 * @access  Private (Admin only)
 */
export const adminGetNeedingModeration = asyncHandler(async (req, res) => {
  const reviews = await Review.getNeedingModeration();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        reviews,
        "Reviews needing moderation fetched successfully",
      ),
    );
});

/**
 * @desc    Get single review details (admin)
 * @route   GET /api/v1/reviews/admin/:reviewId
 * @access  Private (Admin only)
 */
export const adminGetReviewDetails = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  const review = await Review.findById(reviewId)
    .populate("reviewer", "firstName lastName email userType profileImage")
    .populate("reviewee", "firstName lastName email userType profileImage")
    .populate("service", "title slug")
    .populate("order", "orderId status pricing timeline")
    .populate("flags.flaggedBy", "firstName lastName email")
    .populate("moderationHistory.moderatedBy", "firstName lastName email")
    .populate("response.respondedBy", "firstName lastName");

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, review, "Review details fetched successfully"));
});

/**
 * @desc    Moderate review (approve/reject/flag) (admin)
 * @route   PATCH /api/v1/reviews/admin/:reviewId/moderate
 * @access  Private (Admin only)
 */
export const adminModerateReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { action, reason } = req.body;
  const adminId = req.user._id;

  if (!action || !["approve", "reject", "flag"].includes(action)) {
    throw new ApiError(
      400,
      "Please provide a valid action (approve/reject/flag)",
    );
  }

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  await review.moderate(action, reason, adminId);

  return res
    .status(200)
    .json(new ApiResponse(200, review, `Review ${action}d successfully`));
});

/**
 * @desc    Edit review (admin)
 * @route   PUT /api/v1/reviews/admin/:reviewId
 * @access  Private (Admin only)
 */
export const adminEditReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { rating, comment, reason } = req.body;
  const adminId = req.user._id;

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  if (rating && (rating < 1 || rating > 5)) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  if (comment && comment.length < 10) {
    throw new ApiError(400, "Comment must be at least 10 characters");
  }

  await review.adminEdit({ rating, comment, reason }, adminId);

  return res
    .status(200)
    .json(new ApiResponse(200, review, "Review updated successfully"));
});

/**
 * @desc    Resolve a flag on a review (admin)
 * @route   PATCH /api/v1/reviews/admin/:reviewId/flags/:flagId/resolve
 * @access  Private (Admin only)
 */
export const adminResolveFlag = asyncHandler(async (req, res) => {
  const { reviewId, flagId } = req.params;
  const { status, action, reason, newStatus } = req.body;
  const adminId = req.user._id;

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  await review.resolveFlag(
    flagId,
    { status, action, reason, newStatus },
    adminId,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, review, "Flag resolved successfully"));
});

/**
 * @desc    Delete review (hard delete - admin only)
 * @route   DELETE /api/v1/reviews/admin/:reviewId/hard
 * @access  Private (Admin only)
 */
export const adminHardDeleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  await Review.findByIdAndDelete(reviewId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Review permanently deleted"));
});

/**
 * @desc    Restore soft-deleted review (admin)
 * @route   POST /api/v1/reviews/admin/:reviewId/restore
 * @access  Private (Admin only)
 */
export const adminRestoreReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  await review.restore();

  return res
    .status(200)
    .json(new ApiResponse(200, review, "Review restored successfully"));
});

/**
 * @desc    Search reviews (admin)
 * @route   GET /api/v1/reviews/admin/search
 * @access  Private (Admin only)
 */
export const adminSearchReviews = asyncHandler(async (req, res) => {
  const {
    q,
    status,
    reviewerRole,
    revieweeRole,
    page = 1,
    limit = 20,
  } = req.query;

  const filters = {};
  if (status) filters.status = status;
  if (reviewerRole) filters.reviewerRole = reviewerRole;
  if (revieweeRole) filters.revieweeRole = revieweeRole;

  const reviews = await Review.adminSearch(q, filters)
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const totalCount = await Review.countDocuments({
    isDeleted: false,
    ...filters,
    ...(q && {
      $or: [
        { comment: { $regex: q, $options: "i" } },
        { "orderContext.orderId": { $regex: q, $options: "i" } },
      ],
    }),
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit)),
        },
      },
      "Search results fetched successfully",
    ),
  );
});

/**
 * @desc    Get review statistics (admin)
 * @route   GET /api/v1/reviews/admin/stats
 * @access  Private (Admin only)
 */
export const adminGetReviewStats = asyncHandler(async (req, res) => {
  const { timeframe = "all" } = req.query;

  let dateFilter = {};
  const now = new Date();

  if (timeframe === "today") {
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    dateFilter = { createdAt: { $gte: startOfDay } };
  } else if (timeframe === "week") {
    const weekAgo = new Date(now.setDate(now.getDate() - 7));
    dateFilter = { createdAt: { $gte: weekAgo } };
  } else if (timeframe === "month") {
    const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
    dateFilter = { createdAt: { $gte: monthAgo } };
  } else if (timeframe === "year") {
    const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
    dateFilter = { createdAt: { $gte: yearAgo } };
  }

  const stats = await Review.aggregate([
    { $match: { isDeleted: false, ...dateFilter } },
    {
      $facet: {
        overview: [
          {
            $group: {
              _id: null,
              totalReviews: { $sum: 1 },
              averageRating: { $avg: "$rating" },
              totalHelpful: { $sum: "$helpful.count" },
              reviewsWithResponse: {
                $sum: {
                  $cond: [{ $ifNull: ["$response.respondedBy", false] }, 1, 0],
                },
              },
            },
          },
        ],
        byRating: [
          {
            $group: {
              _id: "$rating",
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ],
        byStatus: [
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ],
        byRole: [
          {
            $group: {
              _id: "$reviewerRole",
              count: { $sum: 1 },
              avgRating: { $avg: "$rating" },
            },
          },
        ],
        flaggedStats: [
          { $match: { "flags.0": { $exists: true } } },
          {
            $project: {
              flagCount: { $size: "$flags" },
              pendingFlags: {
                $size: {
                  $filter: {
                    input: "$flags",
                    cond: { $eq: ["$$this.status", "pending"] },
                  },
                },
              },
            },
          },
          {
            $group: {
              _id: null,
              totalFlaggedReviews: { $sum: 1 },
              totalFlags: { $sum: "$flagCount" },
              pendingFlags: { $sum: "$pendingFlags" },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, stats[0], "Review statistics fetched successfully"),
    );
});
