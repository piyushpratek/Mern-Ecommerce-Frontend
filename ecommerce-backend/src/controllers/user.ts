import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.js";
import { NewUserRequestBody } from "../types/types.js";
import { catchAsyncErrors } from "../middlewares/error.js";
import ErrorHandler from "../utils/utility-class.js";
import { HttpStatus } from "../http-status.enum.js";

export const newUser = catchAsyncErrors(
  async (
    req: Request<{}, {}, NewUserRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, email, photo, gender, _id, dob } = req.body;

    // let user = await User.findById(_id);

    // if (user)
    //   return res.status(HttpStatus.OK).json({
    //     success: true,
    //     message: `Welcome, ${user.name}`,
    //   });

    // if (!_id || !name || !email || !photo || !gender || !dob)
    //   return next(new ErrorHandler("Please add all fields", 400));

    const user = await User.create({
      name,
      email,
      photo,
      gender,
      _id,
      dob: new Date(dob),
    });

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: `Welcome, ${user.name}`,
    });
  }
);

export const getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find({});

  return res.status(HttpStatus.OK).json({
    success: true,
    users,
  });
});

export const getUser = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);

  if (!user) return next(new ErrorHandler("Invalid Id", 400));

  return res.status(HttpStatus.OK).json({
    success: true,
    user,
  });
});

export const deleteUser = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);

  if (!user) return next(new ErrorHandler("Invalid Id", 400));

  await user.deleteOne();

  return res.status(HttpStatus.OK).json({
    success: true,
    message: "User Deleted Successfully",
  });
});
