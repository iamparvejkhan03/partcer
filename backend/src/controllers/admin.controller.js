// controllers/admin.controller.js
import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { deleteFileByUrl, uploadImage } from "../utils/cloudinary.js";
import transporter from "../utils/nodemailer.js";
import { accountReactivatedEmail, accountSuspendedEmail } from "../utils/emailTemplates.js";

// ==================== GET ALL USERS (Admin) ====================
const getAllUsers = asyncHandler(async (req, res) => {
  const {
    role,
    status,
    verified,
    search,
    page = 1,
    limit = 100,
    sortBy = "createdAt",
    sortOrder = "desc",
    dateRange,
  } = req.query;

  const query = {};

  // Filter by role
  if (role && role !== "all") {
    query.userType = role;
  }

  // Filter by status
  if (status && status !== "all") {
    query.isActive = status === "active";
  }

  // Filter by verification
  if (verified === "verified") {
    query.isVerified = true;
  } else if (verified === "unverified") {
    query.isVerified = false;
  }

  // Search by name, email, location, company
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { agencyName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { "location.country": { $regex: search, $options: "i" } },
      { "location.city": { $regex: search, $options: "i" } },
      { companyName: { $regex: search, $options: "i" } },
    ];
  }

  // Date range filter
  if (dateRange && dateRange !== "all") {
    const days = parseInt(dateRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    query.createdAt = { $gte: cutoffDate };
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  const users = await User.find(query)
    .select(
      "-password -refreshToken -resetPasswordToken -resetPasswordTokenExpiry",
    )
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  const total = await User.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
      "Users fetched successfully",
    ),
  );
});

// ==================== GET USER STATISTICS ====================
const getUserStats = asyncHandler(async (req, res) => {
  const total = await User.countDocuments();
  const active = await User.countDocuments({ isActive: true });
  const suspended = await User.countDocuments({
    isActive: false,
    status: "suspended",
  });
  const banned = await User.countDocuments({
    isActive: false,
    status: "banned",
  });
  const pending = await User.countDocuments({ isVerified: false });

  const freelancers = await User.countDocuments({ userType: "freelancer" });
  const buyers = await User.countDocuments({ userType: "buyer" });
  const agencies = await User.countDocuments({ userType: "agency" });
  const admins = await User.countDocuments({ userType: "admin" });

  const verified = await User.countDocuments({ isVerified: true });
  const unverified = await User.countDocuments({ isVerified: false });

  // New users today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const newToday = await User.countDocuments({ createdAt: { $gte: today } });

  // New users this week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const newThisWeek = await User.countDocuments({
    createdAt: { $gte: weekAgo },
  });

  // New users this month
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  const newThisMonth = await User.countDocuments({
    createdAt: { $gte: monthAgo },
  });

  const stats = {
    total,
    active,
    suspended,
    banned,
    pending,
    freelancers,
    buyers,
    agencies,
    admins,
    verified,
    unverified,
    newToday,
    newThisWeek,
    newThisMonth,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "User statistics fetched successfully"));
});

// ==================== VERIFY USER ====================
const verifyUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.isVerified = true;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User verified successfully"));
});

// ==================== SUSPEND USER ====================
const suspendUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  if (!reason) {
    throw new ApiError(400, "Suspension reason is required");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Update user status
  user.isActive = false;
  user.status = "suspended";
  user.suspensionReason = reason;
  user.suspendedAt = new Date();
  await user.save();

  accountSuspendedEmail(transporter, user, reason, false)
    .catch(err => console.error(`Failed to send suspension email to ${user.email}:`, err.message));

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User suspended successfully"));
});

// ==================== BAN USER ====================
const banUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  if (!reason) {
    throw new ApiError(400, "Ban reason is required");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.isActive = false;
  user.status = "banned";
  user.banReason = reason;
  user.bannedAt = new Date();
  await user.save();

  accountSuspendedEmail(transporter, user, reason, true)
    .catch(err => console.error(`Failed to send ban email to ${user.email}:`, err.message));

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User banned successfully"));
});

// ==================== ACTIVATE USER ====================
const activateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.isActive = true;
  user.status = "active";
  user.suspensionReason = undefined;
  user.banReason = undefined;
  user.suspendedAt = undefined;
  user.bannedAt = undefined;
  await user.save();

  accountReactivatedEmail(transporter, user, true)
    .catch(err => console.error(`Failed to send account reactivate email to ${user.email}:`, err.message));

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User activated successfully"));
});

// ==================== DELETE USER ====================
const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Soft delete - anonymize and deactivate
  user.isActive = false;
  user.email = `deleted_${Date.now()}_${user.email}`;
  user.firstName = "Deleted";
  user.lastName = "User";
  user.agencyName = undefined;
  user.phone = undefined;
  user.profileImage = undefined;
  user.status = "deleted";
  user.deletedAt = new Date();

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User deleted successfully"));
});

// ==================== GET SINGLE USER ====================
const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const user = await User.findById(userId).select(
    "-password -refreshToken -resetPasswordToken -resetPasswordTokenExpiry",
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User fetched successfully"));
});

// ==================== UPDATE USER ====================
const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const updateData = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Handle profile image upload if present
  if (req.file) {
    try {
      const result = await uploadImage(req.file.buffer, req.file.originalname);
      updateData.profileImage = result.secure_url;

      // Delete old image if exists
      if (user.profileImage) {
        try {
          await deleteFileByUrl(user.profileImage);
        } catch (error) {
          console.log("Error deleting old profile image:", error);
        }
      }
    } catch (error) {
      console.error("Profile image upload failed:", error);
      throw new ApiError(500, "Failed to upload profile image");
    }
  }

  // Handle arrays that might come as JSON strings (possibly double-stringified)
  if (updateData.languages && typeof updateData.languages === "string") {
    try {
      let parsedValue = updateData.languages;

      // Handle double-stringified arrays (like "[ \"English\", \"Spanish\" ]" or "[\"English\",\"Spanish\"]")
      while (
        typeof parsedValue === "string" &&
        parsedValue.trim().startsWith("[")
      ) {
        parsedValue = JSON.parse(parsedValue);
      }

      updateData.languages = parsedValue;
    } catch (error) {
      console.error("Error parsing languages:", error);
      // If parsing fails, treat as comma-separated
      if (updateData.languages.includes(",")) {
        updateData.languages = updateData.languages
          .split(",")
          .map((l) => l.trim());
      } else {
        updateData.languages = [updateData.languages.trim()];
      }
    }
  }

  // Same for skills
  if (updateData.skills && typeof updateData.skills === "string") {
    try {
      let parsedValue = updateData.skills;

      // Handle double-stringified arrays
      while (
        typeof parsedValue === "string" &&
        parsedValue.trim().startsWith("[")
      ) {
        parsedValue = JSON.parse(parsedValue);
      }

      updateData.skills = parsedValue;
    } catch (error) {
      console.error("Error parsing skills:", error);
      if (updateData.skills.includes(",")) {
        updateData.skills = updateData.skills.split(",").map((s) => s.trim());
      } else {
        updateData.skills = [updateData.skills.trim()];
      }
    }
  }

  if (
    updateData.notificationPreferences &&
    typeof updateData.notificationPreferences === "string"
  ) {
    try {
      updateData.notificationPreferences = JSON.parse(
        updateData.notificationPreferences,
      );
    } catch (error) {
      console.error("Error parsing notification preferences:", error);
    }
  }

  // Update user fields
  Object.keys(updateData).forEach((key) => {
    if (
      updateData[key] !== undefined &&
      key !== "experiences" &&
      key !== "educations"
    ) {
      user[key] = updateData[key];
    }
  });

  // Handle experiences if provided
  if (updateData.experiences) {
    if (typeof updateData.experiences === "string") {
      try {
        user.experience = JSON.parse(updateData.experiences);
      } catch (error) {
        console.error("Error parsing experiences:", error);
      }
    } else if (Array.isArray(updateData.experiences)) {
      user.experience = updateData.experiences;
    }
  }

  // Handle education if provided
  if (updateData.educations) {
    if (typeof updateData.educations === "string") {
      try {
        user.education = JSON.parse(updateData.educations);
      } catch (error) {
        console.error("Error parsing educations:", error);
      }
    } else if (Array.isArray(updateData.educations)) {
      user.education = updateData.educations;
    }
  }

  await user.save();

  // Return updated user without sensitive data
  const updatedUser = await User.findById(userId).select(
    "-password -refreshToken -resetPasswordToken -resetPasswordTokenExpiry -emailVerificationToken -emailVerificationExpiry",
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User updated successfully"));
});

export {
  getAllUsers,
  getUserStats,
  verifyUser,
  suspendUser,
  banUser,
  activateUser,
  deleteUser,
  getUserById,
  updateUser,
};
