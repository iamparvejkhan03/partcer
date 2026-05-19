import User from "../models/user.model.js";
import Service from "../models/service.model.js";
// import Order from "../models/order.model.js";
import Portfolio from "../models/portfolio.model.js";
import Review from "../models/review.model.js";
// import Transaction from "../models/transaction.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

// ==================== ADMIN DASHBOARD STATS ====================
const getAdminDashboardStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - 7);

  const startOfMonth = new Date(today);
  startOfMonth.setMonth(today.getMonth() - 1);

  const startOfYear = new Date(today);
  startOfYear.setFullYear(today.getFullYear() - 1);

  // User Stats
  const [
    totalUsers,
    totalFreelancers,
    totalBuyers,
    totalAdmins,
    pendingVerifications,
    activeUsers,
    inactiveUsers,
    newUsersToday,
    newUsersThisWeek,
    newUsersThisMonth,
    usersByCountry,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ userType: "freelancer" }),
    User.countDocuments({ userType: "buyer" }),
    User.countDocuments({ userType: "admin" }),
    User.countDocuments({ isVerified: false }),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ isActive: false }),
    User.countDocuments({ createdAt: { $gte: today } }),
    User.countDocuments({ createdAt: { $gte: startOfWeek } }),
    User.countDocuments({ createdAt: { $gte: startOfMonth } }),
    User.aggregate([
      { $match: { country: { $exists: true, $ne: "" } } },
      { $group: { _id: "$country", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
  ]);

  // Service Stats
  const [
    totalServices,
    activeServices,
    pendingServices,
    featuredServices,
    servicesByCategory,
  ] = await Promise.all([
    Service.countDocuments(),
    Service.countDocuments({ status: "active" }),
    Service.countDocuments({ status: "pending" }),
    Service.countDocuments({ isFeatured: true }),
    Service.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
  ]);

  // Order Stats
  const [
    totalOrders,
    completedOrders,
    pendingOrders,
    inProgressOrders,
    cancelledOrders,
    totalRevenue,
    revenueThisMonth,
    averageOrderValue,
    ordersByMonth,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ status: "completed" }),
    Order.countDocuments({ status: "pending" }),
    Order.countDocuments({ status: "in-progress" }),
    Order.countDocuments({ status: "cancelled" }),
    Order.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Order.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Order.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, avg: { $avg: "$amount" } } },
    ]),
    Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
          revenue: { $sum: "$amount" },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 6 },
    ]),
  ]);

  // Review Stats
  const [totalReviews, averageRating, reviewsByRating] = await Promise.all([
    Review.countDocuments(),
    Review.aggregate([{ $group: { _id: null, avg: { $avg: "$rating" } } }]),
    Review.aggregate([
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]),
  ]);

  // Transaction Stats
  const [
    totalTransactions,
    pendingPayouts,
    totalWithdrawn,
    recentTransactions,
  ] = await Promise.all([
    Transaction.countDocuments(),
    Transaction.countDocuments({ status: "pending", type: "withdrawal" }),
    Transaction.aggregate([
      { $match: { status: "completed", type: "withdrawal" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Transaction.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("userId", "firstName lastName email profileImage"),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users: {
          total: totalUsers,
          freelancers: totalFreelancers,
          buyers: totalBuyers,
          admins: totalAdmins,
          pendingVerifications,
          active: activeUsers,
          inactive: inactiveUsers,
          newToday: newUsersToday,
          newThisWeek: newUsersThisWeek,
          newThisMonth: newUsersThisMonth,
          topCountries: usersByCountry,
        },
        services: {
          total: totalServices,
          active: activeServices,
          pending: pendingServices,
          featured: featuredServices,
          topCategories: servicesByCategory,
        },
        orders: {
          total: totalOrders,
          completed: completedOrders,
          pending: pendingOrders,
          inProgress: inProgressOrders,
          cancelled: cancelledOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
          revenueThisMonth: revenueThisMonth[0]?.total || 0,
          averageOrderValue: averageOrderValue[0]?.avg || 0,
          monthlyTrend: ordersByMonth,
        },
        reviews: {
          total: totalReviews,
          averageRating: averageRating[0]?.avg || 0,
          ratingDistribution: reviewsByRating,
        },
        transactions: {
          total: totalTransactions,
          pendingPayouts,
          totalWithdrawn: totalWithdrawn[0]?.total || 0,
          recent: recentTransactions,
        },
      },
      "Admin dashboard stats fetched successfully",
    ),
  );
});

// ==================== FREELANCER DASHBOARD STATS ====================
const getFreelancerDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - 7);

  const startOfMonth = new Date(today);
  startOfMonth.setMonth(today.getMonth() - 1);

  // Profile Stats
  const [profileViews, profileCompletion, profileVisitors] = await Promise.all([
    // You might have a profile view tracking model
    User.findById(userId).select("profileViews"),
    calculateProfileCompletion(userId),
    // Get unique visitors (if you have that model)
    getUniqueVisitors(userId),
  ]);

  // Service Stats
  const [
    totalServices,
    activeServices,
    totalServiceViews,
    servicesByStatus,
    topPerformingServices,
  ] = await Promise.all([
    Service.countDocuments({ freelancerId: userId }),
    Service.countDocuments({ freelancerId: userId, status: "active" }),
    Service.aggregate([
      { $match: { freelancerId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: "$views" } } },
    ]),
    Service.aggregate([
      { $match: { freelancerId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Service.find({ freelancerId: userId, status: "active" })
      .sort({ views: -1, rating: -1 })
      .limit(5)
      .select("title price views rating orders"),
  ]);

  // Order Stats
  const [
    totalOrders,
    completedOrders,
    pendingOrders,
    inProgressOrders,
    cancelledOrders,
    totalEarnings,
    earningsThisMonth,
    earningsThisWeek,
    pendingEarnings,
    recentOrders,
    ordersByMonth,
  ] = await Promise.all([
    Order.countDocuments({ freelancerId: userId }),
    Order.countDocuments({ freelancerId: userId, status: "completed" }),
    Order.countDocuments({ freelancerId: userId, status: "pending" }),
    Order.countDocuments({ freelancerId: userId, status: "in-progress" }),
    Order.countDocuments({ freelancerId: userId, status: "cancelled" }),
    Order.aggregate([
      {
        $match: {
          freelancerId: new mongoose.Types.ObjectId(userId),
          status: "completed",
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Order.aggregate([
      {
        $match: {
          freelancerId: new mongoose.Types.ObjectId(userId),
          status: "completed",
          createdAt: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Order.aggregate([
      {
        $match: {
          freelancerId: new mongoose.Types.ObjectId(userId),
          status: "completed",
          createdAt: { $gte: startOfWeek },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Order.aggregate([
      {
        $match: {
          freelancerId: new mongoose.Types.ObjectId(userId),
          status: "in-progress",
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Order.find({ freelancerId: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("buyerId", "firstName lastName profileImage"),
    Order.aggregate([
      { $match: { freelancerId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
          revenue: { $sum: "$amount" },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 6 },
    ]),
  ]);

  // Review Stats
  const [totalReviews, averageRating, recentReviews, ratingDistribution] =
    await Promise.all([
      Review.countDocuments({ freelancerId: userId }),
      Review.aggregate([
        { $match: { freelancerId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, avg: { $avg: "$rating" } } },
      ]),
      Review.find({ freelancerId: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("buyerId", "firstName lastName profileImage"),
      Review.aggregate([
        { $match: { freelancerId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
        { $sort: { _id: -1 } },
      ]),
    ]);

  // Portfolio Stats
  const [totalPortfolioItems, featuredPortfolio, portfolioViews] =
    await Promise.all([
      Portfolio.countDocuments({ freelancerId: userId }),
      Portfolio.countDocuments({ freelancerId: userId, featured: true }),
      Portfolio.aggregate([
        { $match: { freelancerId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: "$views" } } },
      ]),
    ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        profile: {
          views: profileViews?.profileViews || 0,
          completion: profileCompletion,
          visitors: profileVisitors || 0,
        },
        services: {
          total: totalServices,
          active: activeServices,
          totalViews: totalServiceViews[0]?.total || 0,
          byStatus: servicesByStatus,
          topPerforming: topPerformingServices,
        },
        orders: {
          total: totalOrders,
          completed: completedOrders,
          pending: pendingOrders,
          inProgress: inProgressOrders,
          cancelled: cancelledOrders,
          totalEarnings: totalEarnings[0]?.total || 0,
          earningsThisMonth: earningsThisMonth[0]?.total || 0,
          earningsThisWeek: earningsThisWeek[0]?.total || 0,
          pendingEarnings: pendingEarnings[0]?.total || 0,
          recent: recentOrders,
          monthlyTrend: ordersByMonth,
        },
        reviews: {
          total: totalReviews,
          averageRating: averageRating[0]?.avg || 0,
          recent: recentReviews,
          distribution: ratingDistribution,
        },
        portfolio: {
          total: totalPortfolioItems,
          featured: featuredPortfolio,
          totalViews: portfolioViews[0]?.total || 0,
        },
      },
      "Freelancer dashboard stats fetched successfully",
    ),
  );
});

// ==================== BUYER DASHBOARD STATS ====================
const getBuyerDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(today);
  startOfMonth.setMonth(today.getMonth() - 1);

  // Order Stats
  const [
    totalOrders,
    completedOrders,
    pendingOrders,
    inProgressOrders,
    cancelledOrders,
    totalSpent,
    spentThisMonth,
    averageOrderValue,
    recentOrders,
    ordersByMonth,
    ordersByStatus,
  ] = await Promise.all([
    Order.countDocuments({ buyerId: userId }),
    Order.countDocuments({ buyerId: userId, status: "completed" }),
    Order.countDocuments({ buyerId: userId, status: "pending" }),
    Order.countDocuments({ buyerId: userId, status: "in-progress" }),
    Order.countDocuments({ buyerId: userId, status: "cancelled" }),
    Order.aggregate([
      {
        $match: {
          buyerId: new mongoose.Types.ObjectId(userId),
          status: "completed",
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Order.aggregate([
      {
        $match: {
          buyerId: new mongoose.Types.ObjectId(userId),
          status: "completed",
          createdAt: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Order.aggregate([
      {
        $match: {
          buyerId: new mongoose.Types.ObjectId(userId),
          status: "completed",
        },
      },
      { $group: { _id: null, avg: { $avg: "$amount" } } },
    ]),
    Order.find({ buyerId: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("freelancerId", "firstName lastName profileImage"),
    Order.aggregate([
      { $match: { buyerId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
          spent: { $sum: "$amount" },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 6 },
    ]),
    Order.aggregate([
      { $match: { buyerId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  // Favorite Freelancers
  const favoriteFreelancers = await User.find({
    _id: { $in: req.user.favoriteFreelancers || [] },
  }).select("firstName lastName profileImage tagline hourlyRate rating");

  // Saved Services
  const savedServices = await Service.find({
    _id: { $in: req.user.savedServices || [] },
  }).populate("freelancerId", "firstName lastName profileImage");

  // Recent Activity (combined)
  const recentActivity = await Promise.all([
    Order.find({ buyerId: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("createdAt status amount serviceTitle")
      .lean(),
    Review.find({ buyerId: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("createdAt rating comment")
      .lean(),
  ]);

  // Format recent activity
  const formattedActivity = [
    ...recentActivity[0].map((order) => ({
      type: "order",
      date: order.createdAt,
      description: `Order placed: ${order.serviceTitle}`,
      status: order.status,
      amount: order.amount,
    })),
    ...recentActivity[1].map((review) => ({
      type: "review",
      date: review.createdAt,
      description: `You left a ${review.rating}-star review`,
      rating: review.rating,
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        orders: {
          total: totalOrders,
          completed: completedOrders,
          pending: pendingOrders,
          inProgress: inProgressOrders,
          cancelled: cancelledOrders,
          byStatus: ordersByStatus,
          totalSpent: totalSpent[0]?.total || 0,
          spentThisMonth: spentThisMonth[0]?.total || 0,
          averageOrderValue: averageOrderValue[0]?.avg || 0,
          recent: recentOrders,
          monthlyTrend: ordersByMonth,
        },
        favorites: {
          total: favoriteFreelancers.length,
          freelancers: favoriteFreelancers,
        },
        saved: {
          total: savedServices.length,
          services: savedServices,
        },
        activity: formattedActivity,
      },
      "Buyer dashboard stats fetched successfully",
    ),
  );
});

// ==================== HELPER FUNCTIONS ====================
const calculateProfileCompletion = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return 0;

  const fields = [
    { name: "firstName", weight: 5 },
    { name: "lastName", weight: 5 },
    { name: "email", weight: 5 },
    { name: "phone", weight: 5 },
    { name: "profileImage", weight: 10 },
    { name: "tagline", weight: 10 },
    { name: "bio", weight: 15 },
    { name: "country", weight: 5 },
    { name: "skills", weight: 5 },
    { name: "categories", weight: 10 },
    { name: "languages", weight: 10 },
    { name: "experience", weight: 10 },
    { name: "education", weight: 5 },
  ];

  let score = 0;
  fields.forEach((field) => {
    if (
      field.name === "skills" ||
      field.name === "categories" ||
      field.name === "languages" ||
      field.name === "experience" ||
      field.name === "education"
    ) {
      if (user[field.name] && user[field.name].length > 0) {
        score += field.weight;
      }
    } else {
      if (user[field.name]) {
        score += field.weight;
      }
    }
  });

  return score;
};

const getUniqueVisitors = async (userId) => {
  // Implement if you have a profile view tracking model
  return 0;
};

export {
  getAdminDashboardStats,
  getFreelancerDashboardStats,
  getBuyerDashboardStats,
};
