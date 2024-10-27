import express from "express";
import { adminOnly } from "../middlewares/auth";
import {
  allOrders,
  deleteOrder,
  getSingleOrder,
  myOrders,
  newOrder,
  processOrder,
} from "../controllers/order";

const router = express.Router();

// route - /api/v1/order/new
router.route('/new').post(newOrder)
// app.post("/new", newOrder);

// route - /api/v1/order/my
router.route('/my').get(myOrders)
// app.get("/my", myOrders);

// route - /api/v1/order/all
router.route('/all').get(adminOnly, allOrders)
// app.get("/all", adminOnly, allOrders);

router.route('/:id').get(getSingleOrder).put(adminOnly, processOrder).delete(adminOnly, deleteOrder)
// app
//   .route("/:id")
//   .get(getSingleOrder)
//   .put(adminOnly, processOrder)
//   .delete(adminOnly, deleteOrder);

export default router;
