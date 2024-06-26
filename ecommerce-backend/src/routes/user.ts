import express from "express";
import {
  deleteUser,
  getAllUsers,
  getUser,
  newUser,
} from "../controllers/user.js";
import { adminOnly } from "../middlewares/auth.js";

const router = express.Router();

// route - /api/v1/user/new
router.route('/new').post(newUser)
// app.post("/new", newUser);

// Route - /api/v1/user/all
// app.get("/all", adminOnly, getAllUsers);

// Route - /api/v1/user/dynamicID
// app.route("/:id").get(getUser).delete(adminOnly, deleteUser);

export default router;
