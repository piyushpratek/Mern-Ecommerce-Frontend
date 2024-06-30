import { config } from "dotenv";
import express, { Application } from "express";
// import { connectDB } from "./utils/features.js";
// import { errorMiddleware } from "./middlewares/error.js";
// import NodeCache from "node-cache";
// import morgan from "morgan";
// import Stripe from "stripe";
// import cors from "cors";

// Importing Routes
import userRoute from "./routes/user.js";
import { errorMiddleware } from "./middlewares/error.js";
import { connectDB } from "./utils/features.js";
// import productRoute from "./routes/products.js";
// import orderRoute from "./routes/order.js";
// import paymentRoute from "./routes/payment.js";
// import dashboardRoute from "./routes/stats.js";

// config({
//     path: "./.env",
// });


// export const stripe = new Stripe(stripeKey);
// export const myCache = new NodeCache();

const app: Application = express();

app.use(express.json());
// app.use(morgan("dev"));
// app.use(cors());

app.get("/", (req, res) => {
    res.send("API Working with /api/v1");
});

// Using Routes
app.use("/api/v1/user", userRoute);
// app.use("/api/v1/product", productRoute);
// app.use("/api/v1/order", orderRoute);
// app.use("/api/v1/payment", paymentRoute);
// app.use("/api/v1/dashboard", dashboardRoute);

// app.use("/uploads", express.static("uploads"));
app.use(errorMiddleware);

export default app