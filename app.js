import express from "express";
import cookieParser from "cookie-parser";
import userRoute from "./routes/user.routes.js";
import expenseRoute from "./routes/expense.routes.js";
import db from "./models/index.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/user", userRoute);
app.use("/api/v1/user-expense", expenseRoute);

export default app;
