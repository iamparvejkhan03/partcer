import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Order from "./newOrder.model.js";
import Withdrawal from "./withdrawal.model.js";

const userSchema = new Schema(
  {
    // ==================== BASIC INFORMATION ====================
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    displayName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
      lowercase: true,
      validate: {
        validator: function (email) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: "Please enter a valid email address",
      },
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
      trim: true,
    },
    currencyPreference: {
      type: String,
      enum: ["USD", "INR"],
      default: "INR",
    },

    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      trim: true,
    },

    // ==================== USER TYPE ====================
    userType: {
      type: String,
      enum: ["freelancer", "buyer", "admin"],
      required: true,
    },

    // ==================== FREELANCER SPECIFIC FIELDS ====================
    freelancerType: {
      type: String,
      enum: ["independent", "agency", ""],
    },
    tagline: {
      type: String,
      trim: true,
    },
    bio: {
      type: String, // Will store RTE content as HTML
      trim: true,
    },
    hourlyRate: {
      type: Number,
      min: 0,
    },
    englishLevel: {
      type: String,
      enum: ["basic", "conversational", "fluent", "native", ""],
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    categories: [
      {
        type: String,
        trim: true,
      },
    ],
    services: [
      {
        type: String,
        trim: true,
      },
    ],
    languages: [
      {
        type: String,
        trim: true,
      },
    ],

    // Experience - Embedded Array
    experience: [
      {
        jobTitle: { type: String, required: true },
        companyName: { type: String, required: true },
        location: { type: String },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        current: { type: Boolean, default: false },
        description: { type: String },
      },
    ],

    // Education - Embedded Array
    education: [
      {
        degreeTitle: { type: String, required: true },
        instituteName: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        current: { type: Boolean, default: false },
        description: { type: String },
      },
    ],

    // ==================== BUYER SPECIFIC FIELDS ====================
    companyName: {
      type: String,
      trim: true,
    }, // Empty by default, only for buyers if they are businesses

    // ==================== LOCATION INFORMATION ====================
    country: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    postalCode: {
      type: String,
      trim: true,
    },
    timezone: {
      type: String,
      default: "America/New_York",
    },

    // ==================== NOTIFICATION PREFERENCES ====================
    notificationPreferences: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      system: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false },
    },

    // ==================== ACCOUNT STATUS ====================
    isVerified: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "deleted", "suspended", "banned"],
      default: "active",
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    completedProjects: {
      type: Number,
      default: 0,
    },

    // ==================== TOKENS & SECURITY ====================
    refreshToken: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordTokenExpiry: {
      type: Date,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpiry: {
      type: Date,
    },

    // Optional: Two-factor authentication (not required, can be added later)
    twoFactorAuth: {
      enabled: { type: Boolean, default: false },
      secret: { type: String },
    },
  },
  { timestamps: true },
);

// ==================== INDEXES ====================
userSchema.index({ userType: 1 });
userSchema.index({ skills: 1 });
userSchema.index({ categories: 1 });
userSchema.index({ "experience.companyName": 1 });
userSchema.index({ "education.instituteName": 1 });

// ==================== MIDDLEWARE ====================
userSchema.pre("save", async function (next) {
  try {
    // Generate display name if not provided
    if (!this.displayName && this.firstName && this.lastName) {
      this.displayName = `${this.firstName} ${this.lastName}`;
    }

    // Hash password if modified
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  } catch (error) {
    next(error);
  }
});

// ==================== INSTANCE METHODS ====================

// Validate password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate access token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      userType: this.userType,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" },
  );
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
  });
};

// Generate password reset token
userSchema.methods.generateResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour

  return resetToken;
};

// Add experience
userSchema.methods.addExperience = function (experienceData) {
  this.experience.push(experienceData);
  return this.save();
};

// Update experience
userSchema.methods.updateExperience = function (experienceId, updateData) {
  const experience = this.experience.id(experienceId);
  if (experience) {
    Object.assign(experience, updateData);
    return this.save();
  }
  throw new Error("Experience not found");
};

// Remove experience
userSchema.methods.removeExperience = function (experienceId) {
  this.experience = this.experience.filter(
    (exp) => exp._id.toString() !== experienceId,
  );
  return this.save();
};

// Add education
userSchema.methods.addEducation = function (educationData) {
  this.education.push(educationData);
  return this.save();
};

// Update education
userSchema.methods.updateEducation = function (educationId, updateData) {
  const education = this.education.id(educationId);
  if (education) {
    Object.assign(education, updateData);
    return this.save();
  }
  throw new Error("Education not found");
};

// Remove education
userSchema.methods.removeEducation = function (educationId) {
  this.education = this.education.filter(
    (edu) => edu._id.toString() !== educationId,
  );
  return this.save();
};

// Add skill
userSchema.methods.addSkill = function (skill) {
  if (!this.skills.includes(skill)) {
    this.skills.push(skill);
    return this.save();
  }
  return this;
};

// Remove skill
userSchema.methods.removeSkill = function (skill) {
  this.skills = this.skills.filter((s) => s !== skill);
  return this.save();
};

// Add category
userSchema.methods.addCategory = function (category) {
  if (!this.categories.includes(category)) {
    this.categories.push(category);
    return this.save();
  }
  return this;
};

// Remove category
userSchema.methods.removeCategory = function (category) {
  this.categories = this.categories.filter((c) => c !== category);
  return this.save();
};

// Add language
userSchema.methods.addLanguage = function (language) {
  if (!this.languages.includes(language)) {
    this.languages.push(language);
    return this.save();
  }
  return this;
};

// Remove language
userSchema.methods.removeLanguage = function (language) {
  this.languages = this.languages.filter((l) => l !== language);
  return this.save();
};

// Update last login
userSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  return this.save();
};

userSchema.methods.calculateAvailableBalance = async function () {
  // Total earned from paid orders
  const earnedResult = await Order.aggregate([
    {
      $match: {
        mentorId: this._id,
        paymentStatus: "paid"
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$mentorFee" }
      }
    }
  ]);

  const totalEarned = earnedResult[0]?.total || 0;

  // Total withdrawn (completed withdrawals only)
  const withdrawnResult = await Withdrawal.aggregate([
    {
      $match: {
        freelancerId: this._id,
        status: "completed"
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" }
      }
    }
  ]);

  const totalWithdrawn = withdrawnResult[0]?.total || 0;

  // Pending withdrawals (not yet completed)
  const pendingResult = await Withdrawal.aggregate([
    {
      $match: {
        freelancerId: this._id,
        status: { $in: ["pending", "clearing"] }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" }
      }
    }
  ]);

  const pendingWithdrawals = pendingResult[0]?.total || 0;

  return {
    available: totalEarned - totalWithdrawn - pendingWithdrawals,
    totalEarned,
    totalWithdrawn,
    pendingWithdrawals
  };
};

// Get public profile (safe object without sensitive data)
userSchema.methods.getPublicProfile = function () {
  const userObject = this.toObject();

  // Remove sensitive fields
  delete userObject.password;
  delete userObject.refreshToken;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordTokenExpiry;
  delete userObject.emailVerificationToken;
  delete userObject.emailVerificationExpiry;
  delete userObject.twoFactorAuth?.secret;

  return userObject;
};

// Get freelancer profile (for public viewing)
userSchema.methods.getFreelancerProfile = function () {
  const publicProfile = this.getPublicProfile();

  // Only return relevant freelancer fields
  return {
    ...publicProfile,
    // Ensure only freelancer-specific fields are included
    freelancerType: this.freelancerType,
    tagline: this.tagline,
    bio: this.bio,
    hourlyRate: this.hourlyRate,
    englishLevel: this.englishLevel,
    skills: this.skills,
    categories: this.categories,
    languages: this.languages,
    experience: this.experience,
    education: this.education,
    rating: this.rating, // This will come from reviews collection
    completedProjects: this.completedProjects, // This will come from orders collection
  };
};

// ==================== STATIC METHODS ====================

// Find freelancers by skill
userSchema.statics.findBySkill = function (skill) {
  return this.find({
    userType: "freelancer",
    skills: { $in: [skill] },
    isActive: true,
  });
};

// Find freelancers by category
userSchema.statics.findByCategory = function (category) {
  return this.find({
    userType: "freelancer",
    categories: { $in: [category] },
    isActive: true,
  });
};

// Find freelancers by language
userSchema.statics.findByLanguage = function (language) {
  return this.find({
    userType: "freelancer",
    languages: { $in: [language] },
    isActive: true,
  });
};

// Find freelancers by hourly rate range
userSchema.statics.findByHourlyRate = function (min, max) {
  return this.find({
    userType: "freelancer",
    hourlyRate: { $gte: min, $lte: max },
    isActive: true,
  });
};

const User = model("User", userSchema);

export default User;
