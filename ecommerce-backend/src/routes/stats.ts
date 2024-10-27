import express from "express";
import { adminOnly } from "../middlewares/auth";
import {
  getBarCharts,
  getDashboardStats,
  getLineCharts,
  getPieCharts,
} from "../controllers/stats";

const router = express.Router();

// route - /api/v1/dashboard/stats
router.route("/stats").get(adminOnly, getDashboardStats)
// app.get("/stats", adminOnly, getDashboardStats);

// route - /api/v1/dashboard/pie
router.route("/pie").get(adminOnly, getPieCharts)
// app.get("/pie", adminOnly, getPieCharts);

// route - /api/v1/dashboard/bar
router.route("/bar").get(adminOnly, getBarCharts)
// app.get("/bar", adminOnly, getBarCharts);

// route - /api/v1/dashboard/line
router.route("/line").get(adminOnly, getLineCharts)
// app.get("/line", adminOnly, getLineCharts);

export default router;
