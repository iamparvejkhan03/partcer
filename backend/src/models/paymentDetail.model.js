import { model, Schema } from "mongoose";

const paymentDetailSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  paypalEmail: { type: String },
  upiId: { type: String },
  payoneerEmail: { type: String },
  bankDetails: {
    accountTitle: String,
    accountNumber: String,
    bankName: String,
    routingNumber: String,
    iban: String,
    bic: String,
  },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

const PaymentDetail = model("PaymentDetail", paymentDetailSchema);

export default PaymentDetail;