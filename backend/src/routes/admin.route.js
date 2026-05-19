import { Router } from "express";
import {
  getAllUsers,
  getUserStats,
  verifyUser,
  suspendUser,
  banUser,
  activateUser,
  deleteUser,
  getUserById,
  updateUser
} from "../controllers/admin.controller.js";
import { auth, authAdmin } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import { getAllOrdersForAdmin } from "../controllers/payment.controller.js";

const adminRouter = Router();

// All routes require admin authentication
adminRouter.use(auth, authAdmin);

// User management
adminRouter.get("/users", getAllUsers);
adminRouter.get("/users/stats", getUserStats);
adminRouter.get("/users/:userId", getUserById);
adminRouter.post("/users/:userId/verify", verifyUser);
adminRouter.post("/users/:userId/suspend", suspendUser);
adminRouter.post("/users/:userId/ban", banUser);
adminRouter.post("/users/:userId/activate", activateUser);
adminRouter.delete("/users/:userId", deleteUser);
adminRouter.put("/users/:userId", upload.single('profileImage'), updateUser);
adminRouter.get("/orders", getAllOrdersForAdmin);

export default adminRouter;