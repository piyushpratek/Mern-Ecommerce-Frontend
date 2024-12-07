import { Request } from "express";
import { catchAsyncErrors } from "../middlewares/error";
import { NewOrderRequestBody } from "../types/types";
import { Order } from "../models/order";
import { invalidateCache, reduceStock } from "../utils/features";
import ErrorHandler from "../utils/utility-class";
import { HttpStatus } from "../http-status.enum";
import { redis } from "../../server";

export const myOrders = catchAsyncErrors(async (req, res, next) => {
  const { id: user } = req.query;

  const key = `my-orders-${user}`;

  let orders;

  orders = await redis.get(key)

  if (orders) orders = JSON.parse(orders);
  else {
    orders = await Order.find({ user });
    await redis.set(key, JSON.stringify(orders));
  }
  return res.status(HttpStatus.OK).json({
    success: true,
    orders,
  });
});

export const allOrders = catchAsyncErrors(async (req, res, next) => {
  const key = `all-orders`;

  let orders;

  orders = await redis.get(key)


  if (orders) orders = JSON.parse(orders);
  else {
    orders = await Order.find().populate("user", "name");
    await redis.set(key, JSON.stringify(orders));
  }
  return res.status(HttpStatus.OK).json({
    success: true,
    orders,
  });
});

export const getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const key = `order-${id}`;

  let order;

  order = await redis.get(key)

  if (order) order = JSON.parse(order);
  else {
    order = await Order.findById(id).populate("user", "name");

    if (!order) return next(new ErrorHandler("Order Not Found", HttpStatus.NOT_FOUND));

    await redis.set(key, JSON.stringify(order));
  }
  return res.status(HttpStatus.OK).json({
    success: true,
    order,
  });
});

export const newOrder = catchAsyncErrors(
  async (req: Request<{}, {}, NewOrderRequestBody>, res, next) => {
    const {
      shippingInfo,
      orderItems,
      user,
      subtotal,
      tax,
      shippingCharges,
      discount,
      total,
    } = req.body;

    if (!shippingInfo || !orderItems || !user || !subtotal || !tax || !total)
      return next(new ErrorHandler("Please Enter All Fields", HttpStatus.BAD_REQUEST));

    const order = await Order.create({
      shippingInfo,
      orderItems,
      user,
      subtotal,
      tax,
      shippingCharges,
      discount,
      total,
    });

    await reduceStock(orderItems);

    await invalidateCache({
      product: true,
      order: true,
      admin: true,
      userId: user,
      productId: order.orderItems.map((i) => String(i.productId)),
    });

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: "Order Placed Successfully",
    });
  }
);

export const processOrder = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const order = await Order.findById(id);

  if (!order) return next(new ErrorHandler("Order Not Found", HttpStatus.NOT_FOUND));

  switch (order.status) {
    case "Processing":
      order.status = "Shipped";
      break;
    case "Shipped":
      order.status = "Delivered";
      break;
    default:
      order.status = "Delivered";
      break;
  }

  await order.save();

  await invalidateCache({
    product: false,
    order: true,
    admin: true,
    userId: order.user,
    orderId: String(order._id),
  });

  return res.status(HttpStatus.OK).json({
    success: true,
    message: "Order Processed Successfully",
  });
});

export const deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const order = await Order.findById(id);
  if (!order) return next(new ErrorHandler("Order Not Found", HttpStatus.NOT_FOUND));

  await order.deleteOne();

  await invalidateCache({
    product: false,
    order: true,
    admin: true,
    userId: order.user,
    orderId: String(order._id),
  });

  return res.status(HttpStatus.OK).json({
    success: true,
    message: "Order Deleted Successfully",
  });
});
