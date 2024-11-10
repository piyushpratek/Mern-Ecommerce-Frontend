import { stripe } from "../app";
import { HttpStatus } from "../http-status.enum";
import { catchAsyncErrors } from "../middlewares/error";
import { Coupon } from "../models/coupon";
import ErrorHandler from "../utils/utility-class";

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
  const { code, amount } = req.body;

  if (!code || !amount)
    return next(new ErrorHandler("Please enter both coupon and amount", HttpStatus.BAD_REQUEST));

  await Coupon.create({ code, amount });

  return res.status(HttpStatus.CREATED).json({
    success: true,
    message: `Coupon ${code} Created Successfully`,
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

export const updateCoupon = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const { code, amount } = req.body;

  const coupon = await Coupon.findById(id);

  if (!coupon) return next(new ErrorHandler("Invalid Coupon ID", HttpStatus.BAD_REQUEST));

  if (code) coupon.code = code;
  if (amount) coupon.amount = amount;

  await coupon.save();

  return res.status(HttpStatus.OK).json({
    success: true,
    message: `Coupon ${coupon.code} Updated Successfully`,
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

