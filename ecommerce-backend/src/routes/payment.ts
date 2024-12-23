import express from "express";
import { adminOnly } from "../middlewares/auth";
import {
  allCoupons,
  applyDiscount,
  createPaymentIntent,
  deleteCoupon,
  getCoupon,
  newCoupon,
  updateCoupon,
} from "../controllers/payment";

const router = express.Router();

// route - /api/v1/payment/create
router.route("/create").post(createPaymentIntent)
// app.post("/create", createPaymentIntent);

// route - /api/v1/payment/coupon/new
router.route("/discount").get(applyDiscount)
// app.get("/discount", applyDiscount);

// route - /api/v1/payment/coupon/new
router.route("/coupon/new").post(adminOnly, newCoupon)
// app.post("/coupon/new", adminOnly, newCoupon);

// route - /api/v1/payment/coupon/all
router.route("/coupon/all").get(adminOnly, allCoupons)
// app.get("/coupon/all", adminOnly, allCoupons);

// route - /api/v1/payment/coupon/:id
router.route("/coupon/:id").get(adminOnly, getCoupon).put(adminOnly, updateCoupon).delete(adminOnly, deleteCoupon)
// app.delete("/coupon/:id", adminOnly, deleteCoupon);

export default router;
