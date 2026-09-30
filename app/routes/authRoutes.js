import express from "express";

import {
  signup,
  verifyOTP,
  login,
  forgotPassword,
  isAuthenticated,
  getMe
} from "../controller/authController.js";

import protect from "../middleware/authMiddleware.js";

const authRouter = express.Router();

// Public routes
authRouter.post("/signup", signup);
authRouter.post("/verify-otp", verifyOTP);
authRouter.post("/login", login);
authRouter.post("/forgot-password", forgotPassword);
authRouter.get("/me",protect, getMe)
// Protected route
authRouter.get("/is-authenticated", protect, isAuthenticated);

export default authRouter;