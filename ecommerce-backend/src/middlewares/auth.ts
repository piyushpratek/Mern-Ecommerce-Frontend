import { HttpStatus } from "../http-status.enum";
import { User } from "../models/user";
import ErrorHandler from "../utils/utility-class";
import { catchAsyncErrors } from "./error";

// Middleware to make sure only admin is allowed
export const adminOnly = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.query;

  if (!id) return next(new ErrorHandler("Please Login First", HttpStatus.UNAUTHORIZED));

  const user = await User.findById(id);
  if (!user) return next(new ErrorHandler("user Not Found", HttpStatus.UNAUTHORIZED));
  if (user.role !== "admin")
    return next(new ErrorHandler("You Are Not An Admin To Access This Resource", HttpStatus.FORBIDDEN));

  next();
});
