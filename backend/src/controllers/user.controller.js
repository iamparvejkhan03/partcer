import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { uploadImage, deleteFileByUrl } from "../utils/cloudinary.js";
import {
  emailVerifiedSuccessEmail,
  newUserRegistrationEmailForAdmin,
  passwordChangedEmail,
  passwordResetEmail,
  welcomeEmail,
} from "../utils/emailTemplates.js";
import transporter from "../utils/nodemailer.js";
import NewOrder from "../models/newOrder.model.js";
// import { sendEmail } from "../utils/sendEmail.js";

// ==================== HELPER FUNCTIONS ====================

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

const options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ==================== REGISTER ====================

const registerUser = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    userType,
    phone,
    country,
    agreeTerms,
    isAgency,
    agencyName,
    displayName,
  } = req.body;

  // Validation
  if (!email || !password || !userType) {
    throw new ApiError(400, "All required fields must be provided");
  }

  // Validation
  if (!agreeTerms) {
    throw new ApiError(400, "You must agree to terms & conditions to register");
  }

  if (!["freelancer", "buyer", "agency", "admin"].includes(userType)) {
    throw new ApiError(400, "Invalid user type");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    displayName: `${firstName} ${lastName}`,
    email,
    password,
    userType,
    phone: phone || "",
    country: country || "",
    isVerified: false,
    isActive: true,
    isAgency: isAgency,
    displayName: displayName,
    agencyName: agencyName,
    currencyPreference: country === "United States" ? "USD" : "INR", // Default to USD for USA students, INR for others
    notificationPreferences: {
      email: true,
      push: true,
      system: true,
      marketing: false,
    },
  });

  // Generate tokens for the user (so they can be logged in immediately after registration)
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );

  // Generate email verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  user.emailVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");
  user.emailVerificationExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  await user.save();

  // Get clean user object for emails and response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry -resetPasswordToken -resetPasswordTokenExpiry",
  );

  // Send emails in background using createdUser
  welcomeEmail(transporter, createdUser, verificationToken).catch((error) =>
    console.error(error),
  );

  const adminUsers = await User.find({ userType: "admin" });
  for (const admin of adminUsers) {
    newUserRegistrationEmailForAdmin(
      transporter,
      admin?.email,
      createdUser,
    ).catch((error) => console.error(error));
  }

  // Return response with createdUser
  return res.status(201).json(
    new ApiResponse(
      201,
      {
        user: createdUser,
        accessToken,
        refreshToken,
      },
      "User registered successfully. Please verify your email.",
    ),
  );
});

// ==================== LOGIN ====================

const loginUser = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // Find user by email
  const user = await User.findOne({ email }).select("+password +refreshToken");

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // Check if user is active
  if (!user.isActive) {
    throw new ApiError(
      403,
      "Your account has been deactivated. Please contact support.",
    );
  }

  // Validate password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Update last login
  await user.updateLastLogin();

  // Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );

  // Set cookie expiration based on rememberMe
  const cookieOptions = { ...options };
  if (rememberMe) {
    cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
  }

  // Get user data without sensitive info
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry -resetPasswordToken -resetPasswordTokenExpiry",
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully",
      ),
    );
});

// ==================== LOGOUT ====================

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: undefined } },
    { new: true },
  );

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// ==================== REFRESH ACCESS TOKEN ====================

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
    const user = await User.findById(decodedToken?.id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id,
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed",
        ),
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

// ==================== VERIFY EMAIL ====================

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  if (!token) {
    throw new ApiError(400, "Verification token is required");
  }

  // Hash the token from URL to compare with stored hash
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired verification token");
  }

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  await user.save();

  emailVerifiedSuccessEmail(transporter, user);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Email verified successfully"));
});

// ==================== RESEND VERIFICATION EMAIL ====================
const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isVerified) {
    throw new ApiError(400, "Email already verified");
  }

  // Generate new verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  user.emailVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");
  user.emailVerificationExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  await user.save();

  // Send new verification email
  await welcomeEmail(transporter, user, verificationToken);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Verification email resent successfully"));
});

// ==================== FORGOT PASSWORD ====================

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const resetToken = user.generateResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Send reset email (implement your email service)
  passwordResetEmail(transporter, user, resetToken);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset email sent"));
});

// ==================== RESET PASSWORD ====================

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!token || !password) {
    throw new ApiError(400, "Token and new password are required");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpiry = undefined;
  await user.save();

  passwordChangedEmail(transporter, user);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successfully"));
});

// ==================== CHANGE PASSWORD ====================

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current password and new password are required");
  }

  const user = await User.findById(req.user?._id).select("+password");

  const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  passwordChangedEmail(transporter, user).catch((error) =>
    console.error(error),
  );

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// ==================== GET CURRENT USER ====================

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

// ==================== UPDATE PROFILE ====================

const updateProfile = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    displayName,
    phone,
    country,
    currencyPreference,
    city,
    address,
    postalCode,
    timezone,
    tagline,
    gender,
    bio,
    hourlyRate,
    englishLevel,
    experienceLevel,
    yearsOfExperience,
    skills,
    categories,
    services,
    languages,
    agencyName,
    notificationPreferences,
  } = req.body;

  const user = await User.findById(req.user._id);

  // Store old categories to update counts later
  const oldCategories = [...(user.categories || [])];

  // Handle profile image upload if present
  if (req.file) {
    try {
      console.log("Processing profile image upload:", req.file.originalname);

      // Upload to Cloudinary
      const result = await uploadImage(req.file.buffer, req.file.originalname);

      // Delete old profile image if exists
      if (user.profileImage) {
        try {
          await deleteFileByUrl(user.profileImage);
        } catch (error) {
          console.log("Error deleting old profile image:", error);
          // Continue even if old image deletion fails
        }
      }

      // Save the Cloudinary URL
      user.profileImage = result.secure_url;
    } catch (error) {
      console.error("Profile image upload failed:", error);
      throw new ApiError(500, "Failed to upload profile image");
    }
  }

  // Update basic info
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (displayName) user.displayName = displayName;
  if (phone !== undefined) user.phone = phone;
  if (gender !== undefined) user.gender = gender;

  // Update location
  if (country !== undefined) user.country = country;
  if (currencyPreference !== undefined) user.currencyPreference = currencyPreference;
  if (city !== undefined) user.city = city;
  if (address !== undefined) user.address = address;
  if (postalCode !== undefined) user.postalCode = postalCode;
  if (timezone !== undefined) user.timezone = timezone;
  if (tagline !== undefined) user.tagline = tagline;
  if (bio !== undefined) user.bio = bio;
  if (englishLevel !== undefined) user.englishLevel = englishLevel;
  if (experienceLevel !== undefined) user.experienceLevel = experienceLevel;
  if (yearsOfExperience !== undefined) user.yearsOfExperience = yearsOfExperience;

  if (languages) {
    try {
      // Check if it's a JSON string (like from FormData)
      if (typeof languages === "string" && languages.startsWith("[")) {
        user.languages = JSON.parse(languages);
      }
      // Check if it's a comma-separated string
      else if (typeof languages === "string" && languages.includes(",")) {
        user.languages = languages.split(",").map((l) => l.trim());
      }
      // Check if it's already an array
      else if (Array.isArray(languages)) {
        user.languages = languages;
      }
      // Single language as string
      else if (typeof languages === "string") {
        user.languages = [languages];
      }
    } catch (error) {
      console.error("Error parsing languages:", error);
      // If parsing fails, treat as comma-separated
      if (typeof languages === "string") {
        user.languages = languages.split(",").map((l) => l.trim());
      }
    }
  }

  // Update freelancer-specific fields
  if (user.userType === "freelancer") {
    if (hourlyRate !== undefined) user.hourlyRate = hourlyRate;

    // Handle skills
    if (skills) {
      try {
        // Check if it's a JSON string (like from FormData)
        if (typeof skills === "string" && skills.startsWith("[")) {
          user.skills = JSON.parse(skills);
        }
        // Check if it's a comma-separated string
        else if (typeof skills === "string" && skills.includes(",")) {
          user.skills = skills.split(",").map((s) => s.trim());
        }
        // Check if it's already an array
        else if (Array.isArray(skills)) {
          user.skills = skills;
        }
        // Single skill as string
        else if (typeof skills === "string") {
          user.skills = [skills];
        }
      } catch (error) {
        console.error("Error parsing skills:", error);
        // If parsing fails, treat as comma-separated
        if (typeof skills === "string") {
          user.skills = skills.split(",").map((s) => s.trim());
        }
      }
    }

    // Handle categories - with count update
    if (categories) {
      let newCategories = [];
      try {
        // Check if it's a JSON string (like from FormData)
        if (typeof categories === "string" && categories.startsWith("[")) {
          newCategories = JSON.parse(categories);
        }
        // Check if it's a comma-separated string
        else if (typeof categories === "string" && categories.includes(",")) {
          newCategories = categories.split(",").map((c) => c.trim());
        }
        // Check if it's already an array
        else if (Array.isArray(categories)) {
          newCategories = categories;
        }
        // Single category as string
        else if (typeof categories === "string") {
          newCategories = [categories];
        }

        user.categories = newCategories;
      } catch (error) {
        console.error("Error parsing categories:", error);
        // If parsing fails, treat as comma-separated
        if (typeof categories === "string") {
          user.categories = categories.split(",").map((c) => c.trim());
        }
      }

      // Update category counts (decrement old, increment new)
      await updateCategoryCounts(oldCategories, user.categories);
    }

    // Handle services
    if (services) {
      try {
        // Check if it's a JSON string (like from FormData)
        if (typeof services === "string" && services.startsWith("[")) {
          user.services = JSON.parse(services);
        }
        // Check if it's a comma-separated string
        else if (typeof services === "string" && services.includes(",")) {
          user.services = services.split(",").map((s) => s.trim());
        }
        // Check if it's already an array
        else if (Array.isArray(services)) {
          user.services = services;
        }
        // Single service as string
        else if (typeof services === "string") {
          user.services = [services];
        }
      } catch (error) {
        console.error("Error parsing services:", error);
        // If parsing fails, treat as comma-separated
        if (typeof services === "string") {
          user.services = services.split(",").map((s) => s.trim());
        }
      }
    }
  }

  // Update company fields
  if (agencyName !== undefined) {
    user.agencyName = agencyName;
  }

  // Update notification preferences (if provided as JSON string)
  if (notificationPreferences) {
    try {
      const prefs =
        typeof notificationPreferences === "string"
          ? JSON.parse(notificationPreferences)
          : notificationPreferences;
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...prefs,
      };
    } catch (error) {
      console.error("Error parsing notification preferences:", error);
    }
  }

  await user.save();

  const updatedUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry -resetPasswordToken -resetPasswordTokenExpiry",
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});

// Helper function to update category counts
async function updateCategoryCounts(oldCategories, newCategories) {
  const Category = await import("../models/category.model.js").then(m => m.default);

  // Categories that were removed
  const removedCategories = oldCategories.filter(cat => !newCategories.includes(cat));

  // Categories that were added
  const addedCategories = newCategories.filter(cat => !oldCategories.includes(cat));

  // Decrement counts for removed categories
  for (const categoryName of removedCategories) {
    await Category.findOneAndUpdate(
      { name: categoryName },
      { $inc: { freelancerCount: -1 } }
    ).catch(err => console.error(`Failed to decrement freelancer count for ${categoryName}:`, err));
  }

  // Increment counts for added categories
  for (const categoryName of addedCategories) {
    await Category.findOneAndUpdate(
      { name: categoryName },
      { $inc: { freelancerCount: 1 } }
    ).catch(err => console.error(`Failed to increment freelancer count for ${categoryName}:`, err));
  }
}

// ==================== UPLOAD PROFILE IMAGE (separate endpoint) ====================

const uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No image file provided");
  }

  const user = await User.findById(req.user._id);

  try {
    // Upload to Cloudinary
    const result = await uploadImage(req.file.buffer, req.file.originalname);

    // Delete old profile image if exists
    if (user.profileImage) {
      try {
        await deleteFileByUrl(user.profileImage);
      } catch (error) {
        console.log("Error deleting old profile image:", error);
        // Continue even if old image deletion fails
      }
    }

    // Save the Cloudinary URL
    user.profileImage = result.secure_url;
    await user.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { profileImage: result.secure_url },
          "Profile image uploaded successfully",
        ),
      );
  } catch (error) {
    console.error("Profile image upload failed:", error);
    throw new ApiError(500, "Failed to upload profile image");
  }
});

// ==================== REMOVE PROFILE IMAGE ====================

const removeProfileImage = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user.profileImage) {
    try {
      // Delete from Cloudinary
      await deleteFileByUrl(user.profileImage);
    } catch (error) {
      console.log("Error deleting profile image from Cloudinary:", error);
      // Continue even if Cloudinary deletion fails
    }

    // Remove from database
    user.profileImage = undefined;
    await user.save();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Profile image removed successfully"));
});

// ==================== ADD EXPERIENCE ====================

const addExperience = asyncHandler(async (req, res) => {
  const {
    jobTitle,
    companyName,
    location,
    startDate,
    endDate,
    current,
    description,
  } = req.body;

  if (!jobTitle || !companyName || !startDate) {
    throw new ApiError(
      400,
      "Job title, company name, and start date are required",
    );
  }

  const user = await User.findById(req.user._id);

  if (user.userType !== "freelancer") {
    throw new ApiError(403, "Only freelancers can add experience");
  }

  await user.addExperience({
    jobTitle,
    companyName,
    location,
    startDate,
    endDate,
    current,
    description,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, user.experience, "Experience added successfully"),
    );
});

// ==================== UPDATE EXPERIENCE ====================

const updateExperience = asyncHandler(async (req, res) => {
  const { experienceId } = req.params;
  const updates = req.body;

  if (!experienceId) {
    throw new ApiError(400, "Experience ID is required");
  }

  const user = await User.findById(req.user._id);

  if (user.userType !== "freelancer") {
    throw new ApiError(403, "Only freelancers can update experience");
  }

  await user.updateExperience(experienceId, updates);

  return res
    .status(200)
    .json(
      new ApiResponse(200, user.experience, "Experience updated successfully"),
    );
});

// ==================== DELETE EXPERIENCE ====================

const deleteExperience = asyncHandler(async (req, res) => {
  const { experienceId } = req.params;

  if (!experienceId) {
    throw new ApiError(400, "Experience ID is required");
  }

  const user = await User.findById(req.user._id);

  if (user.userType !== "freelancer") {
    throw new ApiError(403, "Only freelancers can delete experience");
  }

  await user.removeExperience(experienceId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, user.experience, "Experience deleted successfully"),
    );
});

// ==================== ADD EDUCATION ====================

const addEducation = asyncHandler(async (req, res) => {
  const {
    degreeTitle,
    instituteName,
    startDate,
    endDate,
    current,
    description,
  } = req.body;

  if (!degreeTitle || !instituteName || !startDate) {
    throw new ApiError(
      400,
      "Degree title, institute name, and start date are required",
    );
  }

  const user = await User.findById(req.user._id);

  if (user.userType !== "freelancer") {
    throw new ApiError(403, "Only freelancers can add education");
  }

  await user.addEducation({
    degreeTitle,
    instituteName,
    startDate,
    endDate,
    current,
    description,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, user.education, "Education added successfully"));
});

// ==================== UPDATE EDUCATION ====================

const updateEducation = asyncHandler(async (req, res) => {
  const { educationId } = req.params;
  const updates = req.body;

  if (!educationId) {
    throw new ApiError(400, "Education ID is required");
  }

  const user = await User.findById(req.user._id);

  if (user.userType !== "freelancer") {
    throw new ApiError(403, "Only freelancers can update education");
  }

  await user.updateEducation(educationId, updates);

  return res
    .status(200)
    .json(
      new ApiResponse(200, user.education, "Education updated successfully"),
    );
});

// ==================== DELETE EDUCATION ====================

const deleteEducation = asyncHandler(async (req, res) => {
  const { educationId } = req.params;

  if (!educationId) {
    throw new ApiError(400, "Education ID is required");
  }

  const user = await User.findById(req.user._id);

  if (user.userType !== "freelancer") {
    throw new ApiError(403, "Only freelancers can delete education");
  }

  await user.removeEducation(educationId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, user.education, "Education deleted successfully"),
    );
});

// ==================== ADD SKILL ====================

const addSkill = asyncHandler(async (req, res) => {
  const { skill } = req.body;

  if (!skill) {
    throw new ApiError(400, "Skill is required");
  }

  const user = await User.findById(req.user._id);

  if (user.userType !== "freelancer") {
    throw new ApiError(403, "Only freelancers can add skills");
  }

  await user.addSkill(skill);

  return res
    .status(200)
    .json(new ApiResponse(200, user.skills, "Skill added successfully"));
});

// ==================== REMOVE SKILL ====================

const removeSkill = asyncHandler(async (req, res) => {
  const { skill } = req.params;

  if (!skill) {
    throw new ApiError(400, "Skill is required");
  }

  const user = await User.findById(req.user._id);

  if (user.userType !== "freelancer") {
    throw new ApiError(403, "Only freelancers can remove skills");
  }

  await user.removeSkill(skill);

  return res
    .status(200)
    .json(new ApiResponse(200, user.skills, "Skill removed successfully"));
});

// ==================== ADD CATEGORY ====================

const addCategory = asyncHandler(async (req, res) => {
  const { category } = req.body;

  if (!category) {
    throw new ApiError(400, "Category is required");
  }

  const user = await User.findById(req.user._id);

  if (user.userType !== "freelancer") {
    throw new ApiError(403, "Only freelancers can add categories");
  }

  await user.addCategory(category);

  // Increment freelancer count in Category model
  const Category = await import("../models/category.model.js").then(m => m.default);
  await Category.findOneAndUpdate(
    { name: category },
    { $inc: { freelancerCount: 1 } }
  ).catch(err => console.error("Failed to update category count:", err));

  return res
    .status(200)
    .json(new ApiResponse(200, user.categories, "Category added successfully"));
});

// ==================== REMOVE CATEGORY ====================

const removeCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;

  if (!category) {
    throw new ApiError(400, "Category is required");
  }

  const user = await User.findById(req.user._id);

  if (user.userType !== "freelancer") {
    throw new ApiError(403, "Only freelancers can remove categories");
  }

  await user.removeCategory(category);

  // Decrement freelancer count in Category model
  const Category = await import("../models/category.model.js").then(m => m.default);
  await Category.findOneAndUpdate(
    { name: category },
    { $inc: { freelancerCount: -1 } }
  ).catch(err => console.error("Failed to update category count:", err));

  return res
    .status(200)
    .json(new ApiResponse(200, user.categories, "Category removed successfully"));
});

// ==================== ADD LANGUAGE ====================

const addLanguage = asyncHandler(async (req, res) => {
  const { language } = req.body;

  if (!language) {
    throw new ApiError(400, "Language is required");
  }

  const user = await User.findById(req.user._id);

  if (user.userType !== "freelancer") {
    throw new ApiError(403, "Only freelancers can add languages");
  }

  await user.addLanguage(language);

  return res
    .status(200)
    .json(new ApiResponse(200, user.languages, "Language added successfully"));
});

// ==================== REMOVE LANGUAGE ====================

const removeLanguage = asyncHandler(async (req, res) => {
  const { language } = req.params;

  if (!language) {
    throw new ApiError(400, "Language is required");
  }

  const user = await User.findById(req.user._id);

  if (user.userType !== "freelancer") {
    throw new ApiError(403, "Only freelancers can remove languages");
  }

  await user.removeLanguage(language);

  return res
    .status(200)
    .json(
      new ApiResponse(200, user.languages, "Language removed successfully"),
    );
});

// ==================== SOFT DELETE ACCOUNT ====================

const deleteAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  // Soft delete - just set isActive to false and remove sensitive data
  user.isActive = false;
  user.refreshToken = undefined;
  user.email = `deleted_${Date.now()}_${user.email}`; // Anonymize email
  user.phone = undefined;
  user.profileImage = undefined;
  user.address = undefined;
  user.skills = [];
  user.categories = [];
  user.languages = [];
  user.experience = [];
  user.education = [];

  await user.save();

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Account deleted successfully"));
});

// ==================== UPDATE NOTIFICATION PREFERENCES ====================

const updateNotificationPreferences = asyncHandler(async (req, res) => {
  const { email, push, system, marketing } = req.body;

  const user = await User.findById(req.user._id);

  user.notificationPreferences = {
    email: email !== undefined ? email : user.notificationPreferences.email,
    push: push !== undefined ? push : user.notificationPreferences.push,
    system: system !== undefined ? system : user.notificationPreferences.system,
    marketing:
      marketing !== undefined
        ? marketing
        : user.notificationPreferences.marketing,
  };

  await user.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user.notificationPreferences,
        "Notification preferences updated",
      ),
    );
});

// ==================== GET FREELANCER PUBLIC PROFILE ====================

const getFreelancerPublicProfile = asyncHandler(async (req, res) => {
  const { freelancerId } = req.params;

  const freelancer = await User.findOne({
    _id: freelancerId,
    userType: "freelancer",
    isActive: true,
  }).select(
    "firstName lastName displayName companyName profileImage tagline bio hourlyRate englishLevel skills categories languages experienceLevel yearsOfExperience completedProjects rating reviewCount experience education country city",
  );

  if (!freelancer) {
    throw new ApiError(404, "Freelancer not found");
  }

  // Get order count for this freelancer
  const orderCount = await NewOrder.countDocuments({
    mentorId: freelancerId,
    orderStatus: { $in: ['completed'] }
  });

  // Convert to plain object so we can add the orderCount
  const freelancerObject = freelancer.toObject();
  
  // Add orderCount to the response
  freelancerObject.orderCount = orderCount;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        freelancerObject,
        "Freelancer profile fetched successfully",
      ),
    );
});

// ==================== SEARCH FREELANCERS ====================

const searchFreelancers = asyncHandler(async (req, res) => {
  const {
    skill,
    category,
    service,
    language,
    minRate,
    maxRate,
    englishLevel,
    country,
    search,
    freelancerType,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const query = { userType: "freelancer", isActive: true };

  // Search by keyword (in firstName, lastName, tagline, bio)
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { tagline: { $regex: search, $options: "i" } },
      { bio: { $regex: search, $options: "i" } },
    ];
  }

  // Filter by skill
  if (skill) {
    const skillsArray = Array.isArray(skill) ? skill : [skill];
    // Use case-insensitive regex for partial matching
    query.skills = {
      $in: skillsArray.map(s => new RegExp(s, 'i'))
    };
  }

  // Filter by category
  if (category) {
    const categoriesArray = Array.isArray(category) ? category : [category];
    // Use case-insensitive regex for partial matching
    query.categories = {
      $in: categoriesArray.map(s => new RegExp(s, 'i'))
    };
  }

  // Filter by service
  if (service) {
    const servicesArray = Array.isArray(service) ? service : [service];
    query.services = { $in: servicesArray };
  }

  // Filter by language
  if (language) {
    const languagesArray = Array.isArray(language) ? language : [language];
    query.languages = { $in: languagesArray };
  }

  // Filter by hourly rate range
  if (minRate || maxRate) {
    query.hourlyRate = {};
    if (minRate) query.hourlyRate.$gte = Number(minRate);
    if (maxRate) query.hourlyRate.$lte = Number(maxRate);
  }

  // Filter by English level
  if (englishLevel) {
    const levelsArray = Array.isArray(englishLevel)
      ? englishLevel
      : [englishLevel];
    query.englishLevel = { $in: levelsArray };
  }

  // Filter by country
  if (country) {
    query.country = country;
  }

  // Filter by freelancer type
  if (freelancerType) {
    query.freelancerType = freelancerType;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  const freelancers = await User.find(query)
    .select(
      "firstName lastName displayName profileImage tagline bio hourlyRate englishLevel skills categories services languages freelancerType createdAt country city experience education rating reviewCount hired rejected",
    )
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  const total = await User.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        freelancers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
      "Freelancers fetched successfully",
    ),
  );
});

// ==================== ADMIN: GET ALL USERS ====================

const getAllUsers = asyncHandler(async (req, res) => {
  const {
    userType,
    isActive,
    isVerified,
    search,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const query = {};

  // Filter by user type
  if (userType && userType !== "all") {
    query.userType = userType;
  }

  // Filter by status
  if (isActive !== undefined) {
    query.isActive = isActive === "true";
  }

  // Filter by verification
  if (isVerified !== undefined) {
    query.isVerified = isVerified === "true";
  }

  // Search by name or email
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  const users = await User.find(query)
    .select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry -resetPasswordToken -resetPasswordTokenExpiry",
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

// ==================== ADMIN: UPDATE USER STATUS ====================

const updateUserStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { isActive, isVerified } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (isActive !== undefined) user.isActive = isActive;
  if (isVerified !== undefined) user.isVerified = isVerified;

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User status updated successfully"));
});

// ==================== ADMIN: DELETE USER (SOFT DELETE) ====================

const adminDeleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Soft delete
  user.isActive = false;
  user.refreshToken = undefined;
  user.email = `deleted_${Date.now()}_${user.email}`;
  user.phone = undefined;
  user.profileImage = undefined;

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User deleted successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  getCurrentUser,
  updateProfile,
  uploadProfileImage,
  removeProfileImage,
  addExperience,
  updateExperience,
  deleteExperience,
  addEducation,
  updateEducation,
  deleteEducation,
  addSkill,
  removeSkill,
  addCategory,
  removeCategory,
  addLanguage,
  removeLanguage,
  deleteAccount,
  updateNotificationPreferences,
  getFreelancerPublicProfile,
  searchFreelancers,
  getAllUsers,
  updateUserStatus,
  adminDeleteUser,
};
