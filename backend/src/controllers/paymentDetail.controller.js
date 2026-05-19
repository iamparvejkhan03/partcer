import PaymentDetail from "../models/paymentDetail.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

// ==================== GET PAYMENT DETAILS ====================
const getPaymentDetails = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const paymentDetails = await PaymentDetail.find({ userId });

  return res
    .status(200)
    .json(new ApiResponse(200, paymentDetails, "Payment details fetched successfully"));
});

// ==================== CREATE/UPDATE PAYPAL ====================
const updatePaypal = asyncHandler(async (req, res) => {
  const { paypalEmail, isDefault } = req.body;
  const userId = req.user._id;

  if (!paypalEmail) {
    throw new ApiError(400, "PayPal email is required");
  }

  // If setting as default, remove default from others
  if (isDefault) {
    await PaymentDetail.updateMany(
      { userId, isDefault: true },
      { isDefault: false }
    );
  }

  // Check if PayPal already exists
  let paymentDetail = await PaymentDetail.findOne({ userId, paypalEmail: { $exists: true, $ne: null } });

  if (paymentDetail) {
    // Update existing
    paymentDetail.paypalEmail = paypalEmail;
    paymentDetail.isDefault = isDefault || false;
    await paymentDetail.save();
  } else {
    // Create new
    paymentDetail = await PaymentDetail.create({
      userId,
      paypalEmail,
      isDefault: isDefault || false
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, paymentDetail, "PayPal details updated successfully"));
});

// ==================== CREATE/UPDATE UPI ====================
const updateUpi = asyncHandler(async (req, res) => {
  const { upiId, isDefault } = req.body;
  const userId = req.user._id;

  if (!upiId) {
    throw new ApiError(400, "UPI ID is required");
  }

  // If setting as default, remove default from others
  if (isDefault) {
    await PaymentDetail.updateMany(
      { userId, isDefault: true },
      { isDefault: false }
    );
  }

  // Check if UPI ID already exists
  let paymentDetail = await PaymentDetail.findOne({ userId, upiId: { $exists: true, $ne: null } });

  if (paymentDetail) {
    // Update existing
    paymentDetail.upiId = upiId;
    paymentDetail.isDefault = isDefault || false;
    await paymentDetail.save();
  } else {
    // Create new
    paymentDetail = await PaymentDetail.create({
      userId,
      upiId,
      isDefault: isDefault || false
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, paymentDetail, "UPI details updated successfully"));
});

// ==================== CREATE/UPDATE PAYONEER ====================
const updatePayoneer = asyncHandler(async (req, res) => {
  const { payoneerEmail, isDefault } = req.body;
  const userId = req.user._id;

  if (!payoneerEmail) {
    throw new ApiError(400, "Payoneer email is required");
  }

  // If setting as default, remove default from others
  if (isDefault) {
    await PaymentDetail.updateMany(
      { userId, isDefault: true },
      { isDefault: false }
    );
  }

  // Check if Payoneer already exists
  let paymentDetail = await PaymentDetail.findOne({ userId, payoneerEmail: { $exists: true, $ne: null } });

  if (paymentDetail) {
    // Update existing
    paymentDetail.payoneerEmail = payoneerEmail;
    paymentDetail.isDefault = isDefault || false;
    await paymentDetail.save();
  } else {
    // Create new
    paymentDetail = await PaymentDetail.create({
      userId,
      payoneerEmail,
      isDefault: isDefault || false
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, paymentDetail, "Payoneer details updated successfully"));
});

// ==================== CREATE/UPDATE BANK DETAILS ====================
const updateBankDetails = asyncHandler(async (req, res) => {
  const {
    accountTitle,
    accountNumber,
    bankName,
    routingNumber,
    iban,
    bic,
    isDefault
  } = req.body;
  const userId = req.user._id;

  if (!accountTitle || !accountNumber || !bankName) {
    throw new ApiError(400, "Account title, account number, and bank name are required");
  }

  // If setting as default, remove default from others
  if (isDefault) {
    await PaymentDetail.updateMany(
      { userId, isDefault: true },
      { isDefault: false }
    );
  }

  // Check if bank details already exist
  let paymentDetail = await PaymentDetail.findOne({
    userId,
    "bankDetails.accountNumber": { $exists: true, $ne: null }
  });

  if (paymentDetail) {
    // Update existing
    paymentDetail.bankDetails = {
      accountTitle,
      accountNumber,
      bankName,
      routingNumber: routingNumber || "",
      iban: iban || "",
      bic: bic || ""
    };
    paymentDetail.isDefault = isDefault || false;
    await paymentDetail.save();
  } else {
    // Create new
    paymentDetail = await PaymentDetail.create({
      userId,
      bankDetails: {
        accountTitle,
        accountNumber,
        bankName,
        routingNumber: routingNumber || "",
        iban: iban || "",
        bic: bic || ""
      },
      isDefault: isDefault || false
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, paymentDetail, "Bank details updated successfully"));
});

// ==================== DELETE PAYMENT METHOD ====================
const deletePaymentMethod = asyncHandler(async (req, res) => {
  const { methodId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(methodId)) {
    throw new ApiError(400, "Invalid payment method ID");
  }

  const paymentDetail = await PaymentDetail.findOneAndDelete({
    _id: methodId,
    userId
  });

  if (!paymentDetail) {
    throw new ApiError(404, "Payment method not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Payment method deleted successfully"));
});

// ==================== SET DEFAULT PAYMENT METHOD ====================
const setDefaultMethod = asyncHandler(async (req, res) => {
  const { methodId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(methodId)) {
    throw new ApiError(400, "Invalid payment method ID");
  }

  // Remove default from all
  await PaymentDetail.updateMany(
    { userId, isDefault: true },
    { isDefault: false }
  );

  // Set new default
  const paymentDetail = await PaymentDetail.findOneAndUpdate(
    { _id: methodId, userId },
    { isDefault: true },
    { new: true }
  );

  if (!paymentDetail) {
    throw new ApiError(404, "Payment method not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, paymentDetail, "Default payment method updated"));
});

export {
  getPaymentDetails,
  updatePaypal,
  updateUpi,
  updatePayoneer,
  updateBankDetails,
  deletePaymentMethod,
  setDefaultMethod
};