import { stripe } from "../app.js";
import { HttpStatus } from "../http-status.enum.js";
import { catchAsyncErrors } from "../middlewares/error.js";
import { Coupon } from "../models/coupon.js";
import ErrorHandler from "../utils/utility-class.js";

export const createPaymentIntent = catchAsyncErrors(async (req, res, next) => {
  const { amount } = req.body;

  if (!amount) return next(new ErrorHandler("Please enter amount", HttpStatus.BAD_REQUEST));

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Number(amount) * 100,
    currency: "inr",
  });

  return res.status(HttpStatus.CREATED).json({
    success: true,
    clientSecret: paymentIntent.client_secret,
  });
});

export const newCoupon = catchAsyncErrors(async (req, res, next) => {
  const { coupon, amount } = req.body;

  if (!coupon || !amount)
    return next(new ErrorHandler("Please enter both coupon and amount", HttpStatus.BAD_REQUEST));

  await Coupon.create({ code: coupon, amount });

  return res.status(HttpStatus.CREATED).json({
    success: true,
    message: `Coupon ${coupon} Created Successfully`,
  });
});

export const applyDiscount = catchAsyncErrors(async (req, res, next) => {
  const { coupon } = req.query;

  const discount = await Coupon.findOne({ code: coupon });

  if (!discount) return next(new ErrorHandler("Invalid Coupon Code", HttpStatus.BAD_REQUEST));

  return res.status(HttpStatus.OK).json({
    success: true,
    discount: discount.amount,
  });
});

export const allCoupons = catchAsyncErrors(async (req, res, next) => {
  const coupons = await Coupon.find({});

  return res.status(HttpStatus.OK).json({
    success: true,
    coupons,
  });
});

export const deleteCoupon = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const coupon = await Coupon.findByIdAndDelete(id);

  if (!coupon) return next(new ErrorHandler("Invalid Coupon ID", HttpStatus.BAD_REQUEST));

  return res.status(HttpStatus.OK).json({
    success: true,
    message: `Coupon ${coupon.code} Deleted Successfully`,
  });
});
