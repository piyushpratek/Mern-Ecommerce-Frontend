import express, { Application } from "express";
import NodeCache from "node-cache";
// import morgan from "morgan";
import Stripe from "stripe";
import cors from "cors";
import { errorMiddleware } from "./middlewares/error";
// import { config } from "dotenv"


// Importing Routes
import userRoute from "./routes/user";
import productRoute from "./routes/products";
import orderRoute from "./routes/order";
import paymentRoute from "./routes/payment";
import dashboardRoute from "./routes/stats";
import { CLIENT_URL, STRIPE_KEY } from "./config/config";

// config({
//     path: "./.env",
// });

const stripeKey = STRIPE_KEY



export const stripe = new Stripe(stripeKey);
export const myCache = new NodeCache();


const app: Application = express();


app.use(express.json());
// app.use(morgan("dev"));
app.use(cors({
    origin: [CLIENT_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));

app.get("/", (req, res) => {
    res.send("API Working with /api/v1");
});

// Using Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/dashboard", dashboardRoute);

app.use("/uploads", express.static("uploads"));
app.use(errorMiddleware);

export default app