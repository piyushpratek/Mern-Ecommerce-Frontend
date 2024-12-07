import express from "express";
import { adminOnly } from "../middlewares/auth";
import {
  deleteProduct,
  deleteReview,
  getAdminProducts,
  getAllCategories,
  getAllProducts,
  getSingleProduct,
  getlatestProducts,
  newProduct,
  newReview,
  updateProduct,
} from "../controllers/product";
import { mutliUpload } from "../middlewares/multer";

const router = express.Router();

//To Create New Product  - /api/v1/product/new
router.route("/new").post(adminOnly, mutliUpload, newProduct)

//To get all Products with filters  - /api/v1/product/all
router.route("/all").get(getAllProducts)

//To get last 10 Products  - /api/v1/product/latest
router.route("/latest").get(getlatestProducts)

//To get all unique Categories  - /api/v1/product/categories
router.route("/categories").get(getAllCategories)

//To get all Products   - /api/v1/product/admin-products
router.route("/admin-products").get(adminOnly, getAdminProducts)

// To get, update, delete Product
router.route("/:id").get(getSingleProduct).put(adminOnly, mutliUpload, updateProduct).delete(adminOnly, deleteProduct)

// router.route("/reviews/:id").get(allReviewsOfProduct)
router.route("/review/new/:id").post(newReview);
router.route("/review/:id").delete(deleteReview);

export default router;
