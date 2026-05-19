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
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  verifyEmail,
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
  resendVerificationEmail,
} from "../controllers/user.controller.js";

const userRouter = Router();

// ==================== PUBLIC ROUTES ====================
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/refresh-token", refreshAccessToken);
userRouter.get("/verify-email/:token", verifyEmail);
userRouter.post("/resend-verification", resendVerificationEmail);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password/:token", resetPassword);
userRouter.get("/freelancers/search", searchFreelancers);
userRouter.get("/freelancers/:freelancerId", getFreelancerPublicProfile);

// ==================== PROTECTED ROUTES (require login) ====================
// Profile management
userRouter.get("/me", auth, getCurrentUser);
userRouter.put("/profile", auth, upload.single('profileImage'), updateProfile);
userRouter.post(
  "/profile/image",
  auth,
  upload.single("profileImage"),
  uploadProfileImage,
);
userRouter.delete("/profile/image", auth, removeProfileImage);
userRouter.delete("/account", auth, deleteAccount);
userRouter.post("/change-password", auth, changePassword);
userRouter.patch("/notifications", auth, updateNotificationPreferences);

// Experience management (Freelancer only)
userRouter.post("/experience", authFreelancer, addExperience);
userRouter.patch("/experience/:experienceId", authFreelancer, updateExperience);
userRouter.delete("/experience/:experienceId", authFreelancer, deleteExperience);

// Education management (Freelancer only)
userRouter.post("/education", authFreelancer, addEducation);
userRouter.patch("/education/:educationId", authFreelancer, updateEducation);
userRouter.delete("/education/:educationId", authFreelancer, deleteEducation);

// Skills management (Freelancer only)
userRouter.post("/skills", authFreelancer, addSkill);
userRouter.delete("/skills/:skill", authFreelancer, removeSkill);

// Categories management (Freelancer only)
userRouter.post("/categories", authFreelancer, addCategory);
userRouter.delete("/categories/:category", authFreelancer, removeCategory);

// Languages management (Freelancer only)
userRouter.post("/languages", authFreelancer, addLanguage);
userRouter.delete("/languages/:language", authFreelancer, removeLanguage);

// ==================== ADMIN ROUTES ====================
userRouter.get("/admin/users", authAdmin, getAllUsers);
userRouter.patch("/admin/users/:userId/status", authAdmin, updateUserStatus);
userRouter.delete("/admin/users/:userId", authAdmin, adminDeleteUser);

export default userRouter;