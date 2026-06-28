import Order from "../models/newOrder.model.js";
import Service from "../models/service.model.js";
import Project from "../models/project.model.js";
import CustomOffer from "../models/customOffer.model.js";
import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  uploadFile,
  deleteFileByUrl,
  deleteMultipleFiles,
} from "../utils/cloudinary.js";
import mongoose from "mongoose";

// ==================== HELPER FUNCTIONS ====================

const calculatePlatformFee = (amount, percentage = 10) => {
  return (amount * percentage) / 100;
};

const generateOrderFromService = async (service, packageDetails, buyerId) => {
  const seller = service.seller;

  // Find the selected package
  const selectedPackage = service.packages.find(
    (p) => p.title === packageDetails.title,
  );

  if (!selectedPackage) {
    throw new ApiError(400, "Invalid package selected");
  }

  const subtotal = selectedPackage.price;
  const platformFee = calculatePlatformFee(subtotal);
  const total = subtotal + platformFee;
  const sellerEarnings = subtotal - platformFee;

  // Calculate deadline
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + selectedPackage.deliveryTime);

  return {
    orderType: "service",
    buyer: buyerId,
    seller: seller._id,
    service: service._id,
    details: {
      title: service.title,
      description: service.description,
      category: service.category,
      subCategory: service.subCategory,
      skills: service.tags,
      package: {
        name: selectedPackage.title,
        description: selectedPackage.description,
        features: selectedPackage.features || [],
      },
      requirements: packageDetails.requirements || "",
    },
    pricing: {
      subtotal,
      platformFee,
      platformFeePercentage: 10,
      total,
      sellerEarnings,
    },
    timeline: {
      deadline,
    },
    delivery: {
      revisions: {
        allowed: selectedPackage.revisions || 2,
      },
    },
    payment: {
      status: "pending",
    },
  };
};

const generateOrderFromCustomOffer = async (offerId, buyerId) => {
  const offer = await CustomOffer.findById(offerId).populate("seller service");

  if (!offer) {
    throw new ApiError(404, "Custom offer not found");
  }

  if (offer.buyer.toString() !== buyerId.toString()) {
    throw new ApiError(403, "This offer was not sent to you");
  }

  if (offer.status !== "sent" && offer.status !== "viewed") {
    throw new ApiError(400, "This offer is no longer valid");
  }

  if (offer.isExpired()) {
    throw new ApiError(400, "This offer has expired");
  }

  const subtotal = offer.pricing.amount;
  const platformFee = calculatePlatformFee(subtotal);
  const total = subtotal + platformFee;
  const sellerEarnings = subtotal - platformFee;

  // Calculate deadline
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + offer.deliveryTime);

  return {
    orderType: "custom_offer",
    buyer: buyerId,
    seller: offer.seller._id,
    customOffer: offer._id,
    service: offer.service,
    details: {
      title: offer.title,
      description: offer.description,
      category: offer.category,
      subCategory: offer.subCategory,
      package: {
        name: "Custom Offer",
        description: offer.description,
      },
      requirements: offer.requirements || "",
    },
    pricing: {
      subtotal,
      platformFee,
      platformFeePercentage: 10,
      total,
      sellerEarnings,
    },
    timeline: {
      deadline,
    },
    delivery: {
      revisions: {
        allowed: offer.revisions || 2,
      },
    },
  };
};

const generateOrderFromProject = async (projectId, proposalData, buyerId) => {
  const project = await Project.findById(projectId).populate("buyer");

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (project.buyer._id.toString() !== buyerId.toString()) {
    throw new ApiError(403, "You are not the buyer of this project");
  }

  if (!project.hiredFreelancer) {
    throw new ApiError(400, "No freelancer hired for this project");
  }

  const subtotal = proposalData.proposedBudget || project.budget;
  const platformFee = calculatePlatformFee(subtotal);
  const total = subtotal + platformFee;
  const sellerEarnings = subtotal - platformFee;

  // Calculate deadline based on project duration
  const deadline = new Date();
  switch (project.duration) {
    case "Less than 1 week":
      deadline.setDate(deadline.getDate() + 7);
      break;
    case "1-2 weeks":
      deadline.setDate(deadline.getDate() + 14);
      break;
    case "2-4 weeks":
      deadline.setDate(deadline.getDate() + 28);
      break;
    case "1-3 months":
      deadline.setMonth(deadline.getMonth() + 3);
      break;
    case "3-6 months":
      deadline.setMonth(deadline.getMonth() + 6);
      break;
    default:
      deadline.setMonth(deadline.getMonth() + 3);
  }

  return {
    orderType: "project",
    buyer: buyerId,
    seller: project.hiredFreelancer,
    project: project._id,
    details: {
      title: project.title,
      description: project.description,
      category: project.category,
      subCategory: project.subCategory,
      skills: project.skills,
      requirements: project.requirements || "",
    },
    pricing: {
      subtotal,
      platformFee,
      platformFeePercentage: 10,
      total,
      sellerEarnings,
    },
    timeline: {
      deadline,
    },
    delivery: {
      revisions: {
        allowed: 3, // Default revisions for projects
      },
    },
  };
};

// ==================== CREATE ORDER ====================

const createOrder = asyncHandler(async (req, res) => {
  const {
    type,
    serviceId,
    packageDetails,
    offerId,
    projectId,
    billingInfo,
    paymentMethod,
    notes,
    subtotal,
    platformFee,
    total,
  } = req.body;

  let orderData;

  // Generate order data based on type
  if (type === "service" && serviceId) {
    const service = await Service.findById(serviceId);
    if (!service) {
      throw new ApiError(404, "Service not found");
    }
    orderData = await generateOrderFromService(
      service,
      packageDetails,
      req.user._id,
    );
  } else if (type === "offer" && offerId) {
    orderData = await generateOrderFromCustomOffer(offerId, req.user._id);
  } else if (type === "project" && projectId) {
    orderData = await generateOrderFromProject(
      projectId,
      packageDetails,
      req.user._id,
    );
  } else {
    throw new ApiError(400, "Invalid order type or missing parameters");
  }

  // Add billing info and payment method to order data
  orderData.billingInfo = billingInfo;
  orderData.payment.method = paymentMethod;
  orderData.payment.status = "pending";
  orderData.notes = notes;

  // Override pricing if provided from frontend
  if (subtotal && platformFee && total) {
    orderData.pricing = {
      ...orderData.pricing,
      subtotal,
      platformFee,
      total,
      sellerEarnings: subtotal - platformFee,
    };
  }

  // Create order
  const order = await Order.create(orderData);

  // Update service/project stats
  if (type === "service" && serviceId) {
    await Service.findByIdAndUpdate(serviceId, {
      $inc: { ordersInQueue: 1 },
    });
  }

  // Mark custom offer as accepted
  if (type === "offer" && offerId) {
    const offer = await CustomOffer.findById(offerId);
    if (offer) {
      offer.status = "accepted";
      offer.acceptedAt = new Date();
      offer.order = order._id;
      await offer.save();
    }
  }

  // Populate user details
  await order.populate(
    "buyer",
    "firstName lastName displayName email profileImage",
  );
  await order.populate(
    "seller",
    "firstName lastName displayName email profileImage",
  );

  return res
    .status(201)
    .json(new ApiResponse(201, order, "Order created successfully"));
});

// ==================== GET ORDERS (with filters) ====================

const getOrders = asyncHandler(async (req, res) => {
  const {
    status,
    type,
    role,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const query = {};

  // Filter by user role
  if (role === "buyer") {
    query.buyer = req.user._id;
  } else if (role === "seller") {
    query.seller = req.user._id;
  } else {
    // If no role specified, show orders where user is either buyer or seller
    query.$or = [{ buyer: req.user._id }, { seller: req.user._id }];
  }

  // Filter by status
  if (status && status !== "all") {
    if (Array.isArray(status)) {
      query.status = { $in: status };
    } else {
      query.status = status;
    }
  }

  // Filter by order type
  if (type && type !== "all") {
    query.orderType = type;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  const orders = await Order.find(query)
    .populate("buyer", "firstName lastName displayName profileImage email")
    .populate(
      "seller",
      "firstName lastName displayName profileImage email country city isVerified",
    )
    .populate({
      path: "service",
      select: "title slug gallery category subCategory",
      populate: [
        { path: "category", select: "name slug" },
        { path: "subCategory", select: "name slug" },
      ],
    })
    .populate("project", "title slug category subCategory")
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  const total = await Order.countDocuments(query);

  // Get stats
  let stats = {};
  if (role === "seller") {
    const statsResult = await Order.getSellerStats(req.user._id);
    stats = statsResult[0] || {};
  } else if (role === "buyer") {
    const statsResult = await Order.getBuyerStats(req.user._id);
    stats = statsResult[0] || {};
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        orders,
        stats,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
      "Orders fetched successfully",
    ),
  );
});

// ==================== GET ORDER BY ID ====================

const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId)
    .populate(
      "buyer",
      "firstName lastName displayName profileImage email phone country city rating reviewCount isVerified",
    )
    .populate(
      "seller",
      "firstName lastName displayName profileImage email phone country city isVerified freelancerType rating reviewCount",
    )
    .populate("service", "title slug description gallery")
    .populate("project", "title slug description")
    .populate("customOffer", "title description")
    .populate("details.category", "name")
    .populate("details.subCategory", "name");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Check if user is authorized to view this order
  if (
    order.buyer._id.toString() !== req.user._id.toString() &&
    order.seller._id.toString() !== req.user._id.toString() &&
    req.user.userType !== "admin"
  ) {
    throw new ApiError(403, "You don't have permission to view this order");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order fetched successfully"));
});

// ==================== GET ORDER BY ORDER ID ====================

const getOrderByOrderId = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findOne({ orderId })
    .populate("buyer", "firstName lastName displayName profileImage email")
    .populate("seller", "firstName lastName displayName profileImage email")
    .populate("service", "title slug");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Check if user is authorized to view this order
  if (
    order.buyer._id.toString() !== req.user._id.toString() &&
    order.seller._id.toString() !== req.user._id.toString() &&
    req.user.userType !== "admin"
  ) {
    throw new ApiError(403, "You don't have permission to view this order");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order fetched successfully"));
});

// ==================== GET UNREAD ORDERS COUNT ====================
export const getUnreadOrdersCount = async (req, res) => {
  try {
    const mentorId = req.user._id;
    
    const count = await Order.countDocuments({
      mentorId: mentorId,
      viewedByMentor: false,
      orderStatus: 'confirmed' // Only count confirmed orders
    });
    
    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error fetching unread orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread orders count'
    });
  }
};

// ==================== MARK ORDER AS VIEWED ====================
export const markOrdersAsViewed = async (req, res) => {
  try {
    const mentorId = req.user._id;
    
    await Order.updateMany(
      {
        mentorId: mentorId,
        viewedByMentor: false
      },
      {
        $set: { viewedByMentor: true }
      }
    );
    
    res.status(200).json({
      success: true,
      message: 'Orders marked as viewed'
    });
  } catch (error) {
    console.error('Error marking orders as viewed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark orders as viewed'
    });
  }
};

// ==================== UPDATE ORDER STATUS ====================

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status, reason } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Check permissions based on status change
  const isBuyer = order.buyer.toString() === req.user._id.toString();
  const isSeller = order.seller.toString() === req.user._id.toString();
  const isAdmin = req.user.userType === "admin";

  // Validate status transition
  const validTransitions = {
    pending: ["active", "cancelled"],
    active: ["delivered", "cancelled", "disputed"],
    delivered: ["completed", "disputed"],
    completed: [],
    cancelled: [],
    disputed: ["cancelled", "completed"],
  };

  if (!validTransitions[order.status]?.includes(status)) {
    throw new ApiError(
      400,
      `Cannot transition from ${order.status} to ${status}`,
    );
  }

  // Check permissions for specific status changes
  if (status === "active" && !isSeller && !isAdmin) {
    throw new ApiError(403, "Only seller can start the order");
  }

  if (status === "delivered" && !isSeller && !isAdmin) {
    throw new ApiError(403, "Only seller can mark order as delivered");
  }

  if (status === "completed" && !isBuyer && !isAdmin) {
    throw new ApiError(403, "Only buyer can mark order as completed");
  }

  if (status === "cancelled" && !isBuyer && !isSeller && !isAdmin) {
    throw new ApiError(403, "You don't have permission to cancel this order");
  }

  // Update order status
  order.status = status;

  // Update timeline dates
  switch (status) {
    case "active":
      order.timeline.startedAt = new Date();
      break;
    case "delivered":
      order.timeline.deliveredAt = new Date();
      break;
    case "completed":
      order.timeline.completedAt = new Date();
      break;
    case "cancelled":
      order.timeline.cancelledAt = new Date();
      break;
  }

  // Add note if provided
  if (reason) {
    order.timelineEvents.push({
      status,
      date: new Date(),
      note: reason,
      updatedBy: req.user._id,
    });
  }

  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, `Order ${status} successfully`));
});

// ==================== DELIVER ORDER ====================

const deliverOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { message } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Check if user is seller
  if (
    order.seller.toString() !== req.user._id.toString() &&
    req.user.userType !== "admin"
  ) {
    throw new ApiError(403, "Only seller can deliver this order");
  }

  // Check if order is active
  if (order.status !== "active") {
    throw new ApiError(400, "Order must be active to deliver");
  }

  // Handle attachments
  const attachments = [];
  if (req.files && req.files.length > 0) {
    if (req.files.length > 5) {
      throw new ApiError(400, "Maximum 5 files allowed");
    }

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];

      if (file.size > 50 * 1024 * 1024) {
        // 50MB
        throw new ApiError(400, `File ${file.originalname} exceeds 50MB limit`);
      }

      try {
        const result = await uploadFile(
          file.buffer,
          `orders/${order.orderId}/deliveries/${Date.now()}-${file.originalname}`,
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

  // Prepare delivery data
  const deliveryData = {
    message,
    attachments,
    isRevision: false,
  };

  // If this is a revision
  if (
    order.delivery.current &&
    order.delivery.current.status === "revision_requested"
  ) {
    deliveryData.isRevision = true;
    deliveryData.revisionNumber = order.delivery.revisions.used;
  }

  // Deliver order
  await order.deliver(deliveryData);

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order delivered successfully"));
});

// ==================== APPROVE DELIVERY ====================

const approveDelivery = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Check if user is buyer
  if (
    order.buyer.toString() !== req.user._id.toString() &&
    req.user.userType !== "admin"
  ) {
    throw new ApiError(403, "Only buyer can approve delivery");
  }

  // Check if order is delivered
  if (order.status !== "delivered") {
    throw new ApiError(400, "Order must be delivered to approve");
  }

  // Approve delivery
  await order.approveDelivery();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Delivery approved successfully"));
});

// ==================== CANCEL ORDER ====================

const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Check if user is buyer or seller
  const isBuyer = order.buyer.toString() === req.user._id.toString();
  const isSeller = order.seller.toString() === req.user._id.toString();
  const isAdmin = req.user.userType === "admin";

  if (!isBuyer && !isSeller && !isAdmin) {
    throw new ApiError(403, "You don't have permission to cancel this order");
  }

  // Check if order can be cancelled
  if (!["pending", "active"].includes(order.status)) {
    throw new ApiError(400, "Order cannot be cancelled in current state");
  }

  // Cancel order
  await order.cancel(reason, req.user._id);

  // Update service queue if service order
  if (order.service) {
    await Service.findByIdAndUpdate(order.service, {
      $inc: { ordersInQueue: -1 },
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order cancelled successfully"));
});

// ==================== REQUEST REVISION (Buyer) ====================

const requestRevision = asyncHandler(async (req, res) => {
  const { orderId, deliveryId } = req.params;
  const { message } = req.body;

  if (!message) {
    throw new ApiError(400, "Revision instructions are required");
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Check if user is buyer
  if (order.buyer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only buyer can request revisions");
  }

  // Find the delivery in current or history
  let delivery = null;
  let isCurrentDelivery = false;

  if (
    order.delivery?.current &&
    order.delivery.current._id.toString() === deliveryId
  ) {
    delivery = order.delivery.current;
    isCurrentDelivery = true;
  } else {
    delivery = order.delivery?.history?.id(deliveryId);
  }

  if (!delivery) {
    throw new ApiError(404, "Delivery not found");
  }

  // Check if delivery can be revised
  if (delivery.status !== "pending_review") {
    throw new ApiError(400, "Cannot request revision for this delivery");
  }

  // Check if revisions are available
  if (order.delivery.revisions.used >= order.delivery.revisions.allowed) {
    throw new ApiError(400, "No revisions left for this order");
  }

  // Update delivery status
  delivery.status = "revision_requested";
  delivery.feedback = message;

  // Increment revisions used
  order.delivery.revisions.used += 1;

  // Move current delivery to history if it's the current one
  if (isCurrentDelivery) {
    // Save to history
    if (!order.delivery.history) {
      order.delivery.history = [];
    }
    order.delivery.history.push(order.delivery.current);

    // Clear current delivery
    order.delivery.current = null;
  }

  // Update order status back to active
  order.status = "active";

  // Add timeline event
  order.timelineEvents.push({
    status: "active",
    date: new Date(),
    note: `Revision requested: ${message.substring(0, 50)}${message.length > 50 ? "..." : ""}`,
    updatedBy: req.user._id,
    metadata: {
      deliveryId,
      revisionNumber: order.delivery.revisions.used,
    },
  });

  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Revision requested successfully"));
});

// ==================== OPEN DISPUTE ====================

const openDispute = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { reason, description } = req.body;
  const openedBy = req.user._id;

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Check if user is buyer or seller
  const isBuyer = order.buyer.toString() === req.user._id.toString();
  const isSeller = order.seller.toString() === req.user._id.toString();

  if (!isBuyer && !isSeller) {
    throw new ApiError(403, "You don't have permission to open a dispute");
  }

  // Check if order can be disputed
  if (!["active", "delivered"].includes(order.status)) {
    throw new ApiError(400, "Cannot open dispute for this order");
  }

  // Handle attachments
  const attachments = [];
  if (req.files && req.files.length > 0) {
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];

      try {
        const result = await uploadFile(
          file.buffer,
          `orders/${order.orderId}/disputes/${Date.now()}-${file.originalname}`,
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

  // Open dispute
  await order.openDispute({
    openedBy,
    reason,
    description,
    attachments,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Dispute opened successfully"));
});

// ==================== ADD MESSAGE ====================

const addMessage = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { content } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Check if user is buyer or seller
  const isBuyer = order.buyer.toString() === req.user._id.toString();
  const isSeller = order.seller.toString() === req.user._id.toString();

  if (!isBuyer && !isSeller) {
    throw new ApiError(403, "You don't have permission to message");
  }

  // Handle attachments
  const attachments = [];
  if (req.files && req.files.length > 0) {
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];

      try {
        const result = await uploadFile(
          file.buffer,
          `orders/${order.orderId}/messages/${Date.now()}-${file.originalname}`,
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

  // Add message
  await order.addMessage({
    sender: req.user._id,
    content,
    attachments,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Message added successfully"));
});

// ==================== GET ORDER STATS ====================

const getOrderStats = asyncHandler(async (req, res) => {
  const { role } = req.query;

  let stats = {};

  if (role === "seller") {
    const statsResult = await Order.getSellerStats(req.user._id);
    stats = statsResult[0] || {};

    // Get monthly breakdown
    const monthlyStats = await Order.aggregate([
      {
        $match: {
          seller: req.user._id,
          "payment.status": "paid",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
          revenue: { $sum: "$pricing.sellerEarnings" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
    ]);

    stats.monthly = monthlyStats;
  } else if (role === "buyer") {
    const statsResult = await Order.getBuyerStats(req.user._id);
    stats = statsResult[0] || {};

    // Get monthly spending
    const monthlyStats = await Order.aggregate([
      {
        $match: {
          buyer: req.user._id,
          "payment.status": "paid",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
          spent: { $sum: "$pricing.total" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
    ]);

    stats.monthly = monthlyStats;
  }

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Stats fetched successfully"));
});

// ==================== ADD REVIEW ====================

const addReview = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { rating, comment, privateFeedback } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Check if user is buyer
  //   if (order.buyer.toString() !== req.user._id.toString()) {
  //     throw new ApiError(403, "Only buyer can leave a review");
  //   }

  // Check if order is completed
  if (order.status !== "completed") {
    throw new ApiError(400, "Can only review completed orders");
  }

  // Check if already reviewed
  if (order.review && order.review.rating) {
    throw new ApiError(400, "Order already reviewed");
  }

  // Add review
  order.review = {
    rating,
    comment,
    privateFeedback,
    submittedBy: req.user._id,
    submittedAt: new Date(),
  };

  await order.save();

  // Update seller's rating (you would need to implement this)
  // await updateSellerRating(order.seller);

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Review added successfully"));
});

// ==================== SUBMIT ORDER REQUIREMENTS ====================

const submitRequirements = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { requirements } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Check if user is buyer
  if (order.buyer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only buyer can submit requirements");
  }

  // Check if order is in correct state
  if (!["pending", "active"].includes(order.status)) {
    throw new ApiError(400, "Cannot submit requirements for this order");
  }

  // Handle attachments
  const attachments = [];
  if (req.files && req.files.length > 0) {
    if (req.files.length > 5) {
      throw new ApiError(400, "Maximum 5 files allowed");
    }

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new ApiError(400, `File ${file.originalname} exceeds 10MB limit`);
      }

      try {
        const result = await uploadFile(
          file.buffer,
          `orders/${order.orderId}/requirements/${Date.now()}-${file.originalname}`,
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

  // Update order with requirements
  order.requirements = {
    text: requirements || "",
    attachments: attachments,
    submittedAt: new Date(),
    updatedAt: new Date(),
    status: "submitted",
  };

  // Add timeline event
  order.timelineEvents.push({
    status: order.status,
    date: new Date(),
    note: "Requirements submitted by buyer",
    updatedBy: req.user._id,
  });

  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Requirements submitted successfully"));
});

// ==================== GET OVERDUE ORDERS ====================

const getOverdueOrders = asyncHandler(async (req, res) => {
  const overdue = await Order.getOverdue();

  return res
    .status(200)
    .json(new ApiResponse(200, overdue, "Overdue orders fetched successfully"));
});

// ==================== GET ORDERS NEEDING ATTENTION ====================

const getNeedingAttention = asyncHandler(async (req, res) => {
  const attention = await Order.getNeedingAttention();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        attention,
        "Orders needing attention fetched successfully",
      ),
    );
});

// ==================== ADMIN: GET ALL ORDERS ====================

const adminGetAllOrders = asyncHandler(async (req, res) => {
  const {
    status,
    type,
    buyer,
    seller,
    search,
    fromDate,
    toDate,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const query = {};

  if (status) query.status = status;
  if (type) query.orderType = type;
  if (buyer) query.buyer = buyer;
  if (seller) query.seller = seller;

  if (fromDate || toDate) {
    query.createdAt = {};
    if (fromDate) query.createdAt.$gte = new Date(fromDate);
    if (toDate) query.createdAt.$lte = new Date(toDate);
  }

  if (search) {
    query.$or = [
      { orderId: { $regex: search, $options: "i" } },
      { "details.title": { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  const orders = await Order.find(query)
    .populate("buyer", "firstName lastName displayName profileImage country email")
    .populate(
      "seller",
      "firstName lastName displayName profileImage email country city isVerified",
    )
    .populate({
      path: "service",
      select: "title slug gallery category subCategory",
      populate: [
        { path: "category", select: "name slug" },
        { path: "subCategory", select: "name slug" },
      ],
    })
    .populate("project", "title slug category subCategory")
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  const total = await Order.countDocuments(query);

  // Get summary stats
  const stats = await Order.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalRevenue: { $sum: "$pricing.total" },
        platformFees: { $sum: "$pricing.platformFee" },
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        orders,
        stats,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
      "All orders fetched successfully",
    ),
  );
});

// ==================== ADMIN: GET ORDER DETAILS ====================

const adminGetOrderDetails = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId)
    .populate(
      "buyer",
      "firstName lastName displayName email phone country city isVerified createdAt",
    )
    .populate(
      "seller",
      "firstName lastName displayName email phone country city isVerified freelancerType rating createdAt",
    )
    .populate("service", "title slug description gallery price")
    .populate("project", "title slug description budget")
    .populate("customOffer", "title description pricing")
    .populate("category", "name")
    .populate("subCategory", "name")
    .populate("timelineEvents.updatedBy", "firstName lastName displayName")
    .populate("adminNotes.addedBy", "firstName lastName displayName")
    .populate("flags.flaggedBy", "firstName lastName displayName");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order details fetched successfully"));
});

// ==================== ADMIN: UPDATE ORDER STATUS ====================

const adminUpdateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status, reason } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Validate status
  const validStatuses = [
    "pending",
    "active",
    "delivered",
    "completed",
    "cancelled",
    "disputed",
    "refunded",
    "suspended",
  ];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  // Update status
  order.status = status;

  // Add note
  order.timelineEvents.push({
    status,
    date: new Date(),
    note: reason || "Status updated by admin",
    updatedBy: req.user._id,
  });

  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order status updated successfully"));
});

// ==================== ADMIN: PROCESS REFUND ====================

const adminProcessRefund = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { amount, reason, method } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Validate refund amount
  const refundAmount = amount || order.pricing.total;
  if (refundAmount > order.pricing.total) {
    throw new ApiError(400, "Refund amount cannot exceed order total");
  }

  // Process refund
  await order.processRefund({
    amount: refundAmount,
    reason,
    method: method || "original",
    processedBy: req.user._id,
    processedAt: new Date(),
    status: "processing",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Refund processed successfully"));
});

// ==================== ADMIN: RESOLVE DISPUTE ====================

const adminResolveDispute = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { resolution, message, refundAmount } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.status !== "disputed") {
    throw new ApiError(400, "Order is not in dispute");
  }

  // Resolve dispute
  await order.resolveDispute(
    {
      type: resolution,
      message,
      refundAmount: resolution === "partial_refund" ? refundAmount : undefined,
    },
    req.user._id,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Dispute resolved successfully"));
});

// ==================== ADMIN: ADD NOTE ====================

const adminAddNote = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { note } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  await order.addAdminNote(note, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Note added successfully"));
});

// ==================== ADMIN: FLAG ORDER ====================

const adminFlagOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { type, reason } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  await order.flag({
    type,
    reason,
    flaggedBy: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order flagged successfully"));
});

// ==================== ADMIN: DELETE ORDER ====================

const adminDeleteOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Delete all associated files from Cloudinary
  const deletePromises = [];

  // Delete delivery attachments
  if (order.delivery.current?.attachments?.length) {
    order.delivery.current.attachments.forEach((att) => {
      if (att.publicId) deletePromises.push(deleteFileByUrl(att.url));
    });
  }

  order.delivery.history?.forEach((delivery) => {
    delivery.attachments?.forEach((att) => {
      if (att.publicId) deletePromises.push(deleteFileByUrl(att.url));
    });
  });

  // Delete dispute attachments
  if (order.dispute?.attachments?.length) {
    order.dispute.attachments.forEach((att) => {
      if (att.publicId) deletePromises.push(deleteFileByUrl(att.url));
    });
  }

  // Wait for all deletions
  await Promise.allSettled(deletePromises);

  // Hard delete
  await order.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Order deleted successfully"));
});

// ==================== ADMIN: UPDATE PAYMENT STATUS ====================

const adminUpdatePaymentStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { paymentStatus, transactionId, reason } = req.body;

  const validPaymentStatuses = ["pending", "processing", "paid", "held", "refunded", "failed"];
  
  if (!validPaymentStatuses.includes(paymentStatus)) {
    throw new ApiError(400, "Invalid payment status");
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Update payment status
  order.payment.status = paymentStatus;
  
  if (transactionId) {
    order.payment.transactionId = transactionId;
  }

  if (paymentStatus === "paid" && !order.payment.paidAt) {
    order.payment.paidAt = new Date();
  }

  // Add timeline event
  order.timelineEvents.push({
    status: order.status,
    date: new Date(),
    note: `Payment status updated to ${paymentStatus} by admin${reason ? `: ${reason}` : ''}`,
    updatedBy: req.user._id,
    metadata: {
      paymentStatus,
      transactionId
    }
  });

  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Payment status updated successfully"));
});

export {
  createOrder,
  getOrders,
  getOrderById,
  getOrderByOrderId,
  updateOrderStatus,
  deliverOrder,
  approveDelivery,
  cancelOrder,
  requestRevision,
  openDispute,
  addMessage,
  getOrderStats,
  addReview,
  submitRequirements,
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
  adminUpdatePaymentStatus,
};
