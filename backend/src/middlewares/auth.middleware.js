import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const auth = async (req, res, next) => {
  try {
    // Get token from cookies OR Authorization header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "You need to login first",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Find user by ID from token
    const user = await User.findById(decoded.id).select(
      "-password -refreshToken",
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid access token - user not found",
      });
    }

    // Check if user is active
    // if (!user.isActive) {
    //     return res.status(401).json({
    //         success: false,
    //         message: 'Account is deactivated'
    //     });
    // }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid access token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access token expired",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error during authentication",
    });
  }
};

// Optional: Middleware to check user type
export const requireFreelancer = (req, res, next) => {
  if (req.user.userType !== "freelancer") {
    return res.status(403).json({
      success: false,
      message: "Only freelancers can perform this action",
    });
  }
  next();
};

export const requireBuyer = (req, res, next) => {
  if (req.user.userType !== "buyer") {
    return res.status(403).json({
      success: false,
      message: "Only buyers can perform this action",
    });
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  if (req.user.userType !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Only admins can perform this action",
    });
  }
  next();
};

// Combined middleware for specific user types
export const authFreelancer = [auth, requireFreelancer];
export const authBuyer = [auth, requireBuyer];
// export const authFreelancer = [auth];
// export const authBuyer = [auth];
export const authAdmin = [auth, requireAdmin];

// Optional: Soft auth middleware (attaches user if available, but doesn't require auth)
export const optionalAuth = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (token) {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded.id).select(
        "-password -refreshToken",
      );

      if (user && user.isActive) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?.id).select(
            "-password -refreshToken -emailVerificationToken -emailVerificationExpiry -resetPasswordToken -resetPasswordTokenExpiry"
        );

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        // Check if user is active
        if (!user.isActive) {
            throw new ApiError(403, "Your account has been deactivated");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

// export const verifyAdmin = asyncHandler(async (req, res, next) => {
//     if (req.user.userType !== "admin") {
//         throw new ApiError(403, "Access denied. Admin privileges required.");
//     }
//     next();
// });