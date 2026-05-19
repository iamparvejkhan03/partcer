import { Router } from "express";
import {
  getPaymentDetails,
  updatePaypal,
  updateUpi,
  updatePayoneer,
  updateBankDetails,
  deletePaymentMethod,
  setDefaultMethod
} from "../controllers/paymentDetail.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const paymentRouter = Router();

// All routes require authentication
paymentRouter.use(auth);

paymentRouter.get("/", getPaymentDetails);
paymentRouter.post("/paypal", updatePaypal);
paymentRouter.post("/upi", updateUpi);
paymentRouter.post("/payoneer", updatePayoneer);
paymentRouter.post("/bank", updateBankDetails);
paymentRouter.delete("/:methodId", deletePaymentMethod);
paymentRouter.patch("/:methodId/default", setDefaultMethod);

export default paymentRouter;