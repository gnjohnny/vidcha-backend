import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";

import AuthRoutes from "./routes/auth.routes.js";
import UserRoutes from "./routes/user.routes.js";
import ChatRoutes from "./routes/chat.routes.js";

import { connectDB } from "./db/db.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: false, limit: "30mb" }));
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    }),
);

app.use("/api/auth", AuthRoutes);
app.use("/api/users", UserRoutes);
app.use("/api/chat", ChatRoutes);

app.listen(PORT, () => {
    console.log("Server running on port: ", PORT);
    connectDB();
});
