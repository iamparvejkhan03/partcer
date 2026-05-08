import CustomOffer from "../models/customOffer.model.js";
import User from "../models/user.model.js";
import Service from "../models/service.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  uploadFile,
  deleteFileByUrl,
  deleteMultipleFiles,
} from "../utils/cloudinary.js";
import mongoose from "mongoose";

// ==================== CREATE CUSTOM OFFER ====================

const createCustomOffer = asyncHandler(async (req, res) => {
  const {
    buyerId,
    serviceId,
    title,
    description,
    category,
    subCategory,
    amount,
    deliveryTime,
    revisions,
    requirements,
    message,
    isUrgent,
  } = JSON.parse(req.body.data || "{}");

  // Validation
  if (!buyerId || !title || !description || !amount || !deliveryTime) {
    throw new ApiError(400, "Missing required fields");
  }

  // Check if buyer exists
  const buyer = await User.findById(buyerId);
  if (!buyer || buyer.userType !== "buyer") {
    throw new ApiError(404, "Buyer not found");
  }

  // Check if service exists (if provided)
  if (serviceId) {
    const service = await Service.findById(serviceId);
    if (!service) {
      throw new ApiError(404, "Service not found");
    }
  }

  // Handle attachments
  const attachments = [];
  if (req.files && req.files.length > 0) {
    if (req.files.length > 5) {
      throw new ApiError(400, "Maximum 5 files allowed");
    }

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];

      if (file.size > 10 * 1024 * 1024) { // 10MB
        throw new ApiError(400, `File ${file.originalname} exceeds 10MB limit`);
      }

      try {
        const result = await uploadFile(
          file.buffer,
          `custom-offers/${req.user._id}/${Date.now()}-${file.originalname}`
        );
        attachments.push({
          name: file.originalname,
          url: result.secure_url,
          publicId: result.public_id,
          type: file.mimetype,
          size: file.size,
        });
      } catch (error) {
        console.error("Error uploading file:", error);
        throw new ApiError(500, "Failed to upload attachments");
      }
    }
  }

  // Create custom offer
  const offer = await CustomOffer.create({
    seller: req.user._id,
    buyer: buyerId,
    service: serviceId,
    title,
    description,
    category,
    subCategory,
    pricing: {
      amount: Number(amount),
      includesPlatformFee: false,
    },
    deliveryTime: Number(deliveryTime),
    revisions: revisions ? Number(revisions) : 2,
    requirements,
    attachments,
    message,
    stats: {
      isUrgent: isUrgent || false,
    },
  });

  // Populate user details
  await offer.populate("seller", "firstName lastName displayName profileImage");
  await offer.populate("buyer", "firstName lastName displayName profileImage");

  return res
    .status(201)
    .json(new ApiResponse(201, offer, "Custom offer created successfully"));
});

// ==================== GET CUSTOM OFFERS ====================

const getCustomOffers = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = {
    $or: [{ seller: req.user._id }, { buyer: req.user._id }],
  };

  if (status && status !== "all") {
    query.status = status;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const offers = await CustomOffer.find(query)
    .populate("seller", "firstName lastName displayName profileImage")
    .populate("buyer", "firstName lastName displayName profileImage")
    .populate("service", "title slug")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await CustomOffer.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        offers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
      "Offers fetched successfully"
    )
  );
});

// ==================== GET BUYER OFFERS ====================

const getBuyerOffers = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = { buyer: req.user._id };
  if (status && status !== "all") {
    query.status = status;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const offers = await CustomOffer.find(query)
    .populate("seller", "firstName lastName displayName profileImage freelancerType rating")
    .populate("service", "title slug")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await CustomOffer.countDocuments(query);

  // Get stats
  const stats = await CustomOffer.aggregate([
    { $match: { buyer: req.user._id } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: {
          $sum: {
            $cond: [{ $in: ["$status", ["sent", "viewed"]] }, 1, 0],
          },
        },
        accepted: {
          $sum: { $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] },
        },
        declined: {
          $sum: { $cond: [{ $eq: ["$status", "declined"] }, 1, 0] },
        },
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        offers,
        stats: stats[0] || { total: 0, pending: 0, accepted: 0, declined: 0 },
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
      "Buyer offers fetched successfully"
    )
  );
});

// ==================== GET SELLER OFFERS ====================

const getSellerOffers = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = { seller: req.user._id };
  if (status && status !== "all") {
    query.status = status;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const offers = await CustomOffer.find(query)
    .populate("buyer", "firstName lastName displayName profileImage")
    .populate("service", "title slug")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await CustomOffer.countDocuments(query);

  // Get stats
  const stats = await CustomOffer.aggregate([
    { $match: { seller: req.user._id } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        draft: {
          $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] },
        },
        sent: {
          $sum: { $cond: [{ $in: ["$status", ["sent", "viewed"]] }, 1, 0] },
        },
        accepted: {
          $sum: { $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] },
        },
        declined: {
          $sum: { $cond: [{ $eq: ["$status", "declined"] }, 1, 0] },
        },
        conversionRate: {
          $avg: {
            $cond: [
              { $and: [{ $eq: ["$status", "accepted"] }, { $ne: ["$status", "draft"] }] },
              100,
              0,
            ],
          },
        },
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        offers,
        stats: stats[0] || { total: 0, draft: 0, sent: 0, accepted: 0, declined: 0, conversionRate: 0 },
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
      "Seller offers fetched successfully"
    )
  );
});

// ==================== GET CUSTOM OFFER BY ID ====================

const getCustomOfferById = asyncHandler(async (req, res) => {
  const { offerId } = req.params;

  const offer = await CustomOffer.findById(offerId)
    .populate("seller", "firstName lastName displayName profileImage email phone country city freelancerType rating reviewCount")
    .populate("buyer", "firstName lastName displayName profileImage email phone country city")
    .populate("service", "title slug description gallery")
    .populate("category", "name")
    .populate("subCategory", "name");

  if (!offer) {
    throw new ApiError(404, "Custom offer not found");
  }

  // Check if user is authorized
  if (
    offer.seller._id.toString() !== req.user._id.toString() &&
    offer.buyer._id.toString() !== req.user._id.toString() &&
    req.user.userType !== "admin"
  ) {
    throw new ApiError(403, "You don't have permission to view this offer");
  }

  // If buyer is viewing and offer is sent, mark as viewed
  if (
    offer.buyer._id.toString() === req.user._id.toString() &&
    offer.status === "sent"
  ) {
    await offer.view();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, offer, "Offer fetched successfully"));
});

// ==================== UPDATE CUSTOM OFFER ====================

const updateCustomOffer = asyncHandler(async (req, res) => {
  const { offerId } = req.params;
  const updates = JSON.parse(req.body.data || "{}");

  const offer = await CustomOffer.findById(offerId);

  if (!offer) {
    throw new ApiError(404, "Custom offer not found");
  }

  // Check if user is seller
  if (offer.seller.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only seller can update this offer");
  }

  // Check if offer can be updated (only draft)
  if (offer.status !== "draft") {
    throw new ApiError(400, "Cannot update offer that has been sent");
  }

  // Handle removed attachments
  if (updates.removedAttachments && updates.removedAttachments.length > 0) {
    const remainingAttachments = offer.attachments.filter(
      (att) => !updates.removedAttachments.includes(att.publicId)
    );

    // Delete from Cloudinary
    try {
      await deleteMultipleFiles(updates.removedAttachments);
    } catch (error) {
      console.error("Error deleting attachments:", error);
    }

    updates.attachments = remainingAttachments;
  }

  // Handle new attachments
  if (req.files && req.files.length > 0) {
    const currentTotal = offer.attachments.length;
    if (currentTotal + req.files.length > 5) {
      throw new ApiError(400, "Maximum 5 files allowed");
    }

    const newAttachments = [...(updates.attachments || offer.attachments)];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];

      try {
        const result = await uploadFile(
          file.buffer,
          `custom-offers/${req.user._id}/${Date.now()}-${file.originalname}`
        );
        newAttachments.push({
          name: file.originalname,
          url: result.secure_url,
          publicId: result.public_id,
          type: file.mimetype,
          size: file.size,
        });
      } catch (error) {
        console.error("Error uploading file:", error);
        throw new ApiError(500, "Failed to upload attachments");
      }
    }

    updates.attachments = newAttachments;
  }

  // Remove temporary fields
  delete updates.removedAttachments;

  // Update offer
  Object.assign(offer, updates);
  await offer.save();

  return res
    .status(200)
    .json(new ApiResponse(200, offer, "Offer updated successfully"));
});

// ==================== SEND CUSTOM OFFER ====================

const sendCustomOffer = asyncHandler(async (req, res) => {
  const { offerId } = req.params;

  const offer = await CustomOffer.findById(offerId);

  if (!offer) {
    throw new ApiError(404, "Custom offer not found");
  }

  // Check if user is seller
  if (offer.seller.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only seller can send this offer");
  }

  // Check if offer is in draft
  if (offer.status !== "draft") {
    throw new ApiError(400, "Offer has already been sent");
  }

  // Send offer
  await offer.send();

  return res
    .status(200)
    .json(new ApiResponse(200, offer, "Offer sent successfully"));
});

// ==================== MARK OFFER AS VIEWED ====================

const markAsViewed = asyncHandler(async (req, res) => {
  const { offerId } = req.params;

  const offer = await CustomOffer.findById(offerId);

  if (!offer) {
    throw new ApiError(404, "Custom offer not found");
  }

  // Check if user is buyer
  if (offer.buyer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only buyer can mark offer as viewed");
  }

  // Check if offer is sent
  if (offer.status !== "sent") {
    throw new ApiError(400, "Offer is not in sent state");
  }

  // Mark as viewed
  await offer.view();

  return res
    .status(200)
    .json(new ApiResponse(200, offer, "Offer marked as viewed"));
});

// ==================== RESPOND TO OFFER ====================

const respondToOffer = asyncHandler(async (req, res) => {
  const { offerId } = req.params;
  const { action, message } = req.body;

  if (!["accept", "decline"].includes(action)) {
    throw new ApiError(400, "Invalid action");
  }

  const offer = await CustomOffer.findById(offerId);

  if (!offer) {
    throw new ApiError(404, "Custom offer not found");
  }

  // Check if user is buyer
  if (offer.buyer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only buyer can respond to this offer");
  }

  // Check if offer is sent or viewed
  if (!["sent", "viewed"].includes(offer.status)) {
    throw new ApiError(400, "Cannot respond to this offer");
  }

  // Check if offer is expired
  if (offer.isExpired()) {
    throw new ApiError(400, "This offer has expired");
  }

  // Respond
  if (action === "accept") {
    await offer.accept(message);
  } else {
    await offer.decline(message);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, offer, `Offer ${action}ed successfully`));
});

// ==================== DELETE CUSTOM OFFER ====================

const deleteCustomOffer = asyncHandler(async (req, res) => {
  const { offerId } = req.params;

  const offer = await CustomOffer.findById(offerId);

  if (!offer) {
    throw new ApiError(404, "Custom offer not found");
  }

  // Check if user is seller
  if (offer.seller.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only seller can delete this offer");
  }

  // Check if offer can be deleted (only draft)
  if (offer.status !== "draft") {
    throw new ApiError(400, "Cannot delete offer that has been sent");
  }

  // Delete attachments from Cloudinary
  if (offer.attachments && offer.attachments.length > 0) {
    const publicIds = offer.attachments.map((att) => att.publicId);
    try {
      await deleteMultipleFiles(publicIds);
    } catch (error) {
      console.error("Error deleting attachments:", error);
    }
  }

  // Hard delete
  await offer.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Offer deleted successfully"));
});

// ==================== ADMIN: GET ALL OFFERS ====================

const adminGetAllOffers = asyncHandler(async (req, res) => {
  const {
    status,
    seller,
    buyer,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const query = {};

  if (status) query.status = status;
  if (seller) query.seller = seller;
  if (buyer) query.buyer = buyer;

  const skip = (Number(page) - 1) * Number(limit);
  const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  const offers = await CustomOffer.find(query)
    .populate("seller", "firstName lastName email displayName")
    .populate("buyer", "firstName lastName email displayName")
    .populate("service", "title")
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  const total = await CustomOffer.countDocuments(query);

  // Get stats
  const stats = await CustomOffer.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalValue: { $sum: "$pricing.amount" },
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        offers,
        stats,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
      "All offers fetched successfully"
    )
  );
});

// ==================== ADMIN: DELETE OFFER ====================

const adminDeleteOffer = asyncHandler(async (req, res) => {
  const { offerId } = req.params;

  const offer = await CustomOffer.findById(offerId);

  if (!offer) {
    throw new ApiError(404, "Custom offer not found");
  }

  // Delete attachments from Cloudinary
  if (offer.attachments && offer.attachments.length > 0) {
    const publicIds = offer.attachments.map((att) => att.publicId);
    try {
      await deleteMultipleFiles(publicIds);
    } catch (error) {
      console.error("Error deleting attachments:", error);
    }
  }

  // Hard delete
  await offer.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Offer deleted successfully"));
});

export {
  createCustomOffer,
  getCustomOffers,
  getCustomOfferById,
  updateCustomOffer,
  sendCustomOffer,
  respondToOffer,
  getBuyerOffers,
  getSellerOffers,
  markAsViewed,
  deleteCustomOffer,
  adminGetAllOffers,
  adminDeleteOffer,
};