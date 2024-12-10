import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import {
  addExpense,
  updateExpense,
  deleteExpense,
  getAllExpenses,
  getExpenseSummary,
  filterByCategory,
  expenseOfMonth,
  exportToCSV,
} from "../controllers/expense.controller.js";

const router = Router();

router.route("/add").post(verifyJWT, addExpense);
router.route("/update/:id").put(verifyJWT, updateExpense);
router.route("/delete/:id").delete(verifyJWT, deleteExpense);
router.route("/getall").get(verifyJWT, getAllExpenses);
router.route("/getsummary").get(verifyJWT, getExpenseSummary);
router
  .route("/getspecificcategory-expenses/:category")
  .get(verifyJWT, filterByCategory);
router.route("/expenses-month").post(verifyJWT, expenseOfMonth);
router.route("/export-expense").get(verifyJWT, exportToCSV);

export default router;
