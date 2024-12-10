import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/User.js";
import Expense from "../models/Expense.js";
import { Op } from "sequelize";
import formatDate from "../utils/dateUtils.js";
import serializeExpense from "../utils/serializeExpense.js";
import { parse } from "json2csv";
import sequelize from "../connection/dbConnection.js";

export const addExpense = asyncHandler(async (req, res, next) => {
  const { category, description, amount, createdAt, updatedAt } = req.body;
  const userId = req.user.id;
  try {
    const formattedDate = formatDate(createdAt);
    const user = await User.findByPk(userId, {
      attributes: ["monthly_budget"],
    });
    const month = new Date(createdAt).getMonth() + 1;
    const year = new Date(createdAt).getFullYear();
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);
    const totalExpensesOfMonth = await Expense.sum("amount", {
      where: {
        userId,
        createdAt: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
    });
    const newTotal = totalExpensesOfMonth + parseFloat(amount);
    const expense = await Expense.create({
      category,
      description,
      amount,
      createdAt: formattedDate,
      updatedAt,
      userId,
    });
    let warningMessage = null;
    if (newTotal > user.monthly_budget) {
      warningMessage = "Warning: You have exceeded your monthly budget!";
    }
    res
      .status(201)
      .json(
        new ApiResponse(
          200,
          { expense, warningMessage },
          "Your expense has been added to list"
        )
      );
  } catch (error) {
    if (error.name === "SequelizeDatabaseError") {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Invalid category provided"));
    }
    return res
      .status(500)
      .json(
        new ApiResponse(500, null, "An error occurred while adding the expense")
      );
  }
});

export const updateExpense = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const expense = await Expense.findByPk(id);
  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }
  if (expense.userId !== req.user.id) {
    throw new ApiError(404, "You Can Update Only Your Expenses");
  }
  const { category, amount, description, createdAt } = req.body;
  const updatedData = await Expense.update(
    {
      category,
      amount,
      description,
      createdAt,
      updatedAt: new Date(),
    },
    { where: { id: id } }
  );
  const updatedExpense = await Expense.findByPk(id);
  res
    .status(200)
    .json(new ApiResponse(200, updatedExpense, "Expense updated successfully"));
});

export const deleteExpense = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const expense = await Expense.findByPk(id);
  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }
  if (expense.userId !== req.user.id) {
    throw new ApiError(404, "You Can Delete Only Your Expenses");
  }
  await Expense.destroy({ where: { id: id } });
  res
    .status(200)
    .json(new ApiResponse(200, null, "Expense deleted successfully"));
});

export const getAllExpenses = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const expenses = await Expense.findAll({
    where: { userId },
    attributes: [
      "category",
      "description",
      "amount",
      [sequelize.col("createdAt"), "ExpenseDate"],
    ],
    order: [["createdAt", "DESC"]],
  });
  const MoneySpend = expenses.reduce(
    (acc, expense) => acc + parseFloat(expense.amount),
    0
  );
  const formattedExpenses = expenses.map(serializeExpense);
  res.json(
    new ApiResponse(
      200,
      { expenses: formattedExpenses, TotalMoneyYouHaveSpend: MoneySpend },
      "All Expenses"
    )
  );
});

export const getExpenseSummary = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const expenses = await Expense.findAll({
    where: { userId },
    attributes: ["amount"],
  });
  const totalAmount = await Expense.sum("amount", {
    where: {
      userId,
    },
  });
  const summary = {
    totalExpenses: expenses.length,
    totalAmount,
  };
  res.json(new ApiResponse(200, summary, "Your Expense Summary"));
});

export const filterByCategory = asyncHandler(async (req, res, next) => {
  const { category } = req.params;
  const expenses = await Expense.findAll({
    where: {
      userId: req.user.id,
      category,
    },
    attributes: ["description", "amount"],
  });
  const description = expenses.map((expense) => expense.description);
  const totalAmount = expenses.reduce(
    (acc, expense) => acc + parseFloat(expense.amount),
    0
  );
  const summary = {
    totalExpenses: expenses.length,
    description,
    totalAmount,
  };
  res.json(new ApiResponse(200, summary, `Expenses for category: ${category}`));
});

// Helper function to convert month name to month number for expenseOfMonth function
const getMonthNumber = (monthName) => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthIndex = monthNames.indexOf(monthName);
  return monthIndex !== -1 ? monthIndex + 1 : null;
};

export const expenseOfMonth = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { month, year } = req.query;
  if (!month || !year) {
    return res.status(400).json({ message: "Please provide a month and year" });
  }
  const monthInt = getMonthNumber(month);
  if (!monthInt) {
    return res.status(400).json({ message: "Invalid month name provided" });
  }
  const yearInt = parseInt(year);
  const startOfMonth = new Date(yearInt, monthInt - 1, 1);
  const endOfMonth = new Date(yearInt, monthInt, 0);

  try {
    const expenses = await Expense.findAll({
      where: {
        userId,
        createdAt: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
      attributes: [
        "category",
        "description",
        "amount",
        ["createdAt", "ExpenseDate"],
      ],
    });
    const ExpenditureOfMonth = expenses.reduce(
      (acc, expense) => acc + parseFloat(expense.amount),
      0
    );
    const formattedExpenses = expenses.map(serializeExpense);
    res.json(
      new ApiResponse(
        200,
        {
          expenses: formattedExpenses,
          TotalAmountSpendThisMonth: ExpenditureOfMonth,
        },
        "Your Expenses Of This Month"
      )
    );
  } catch (error) {
    if (error.name === "SequelizeDatabaseError") {
      return res.status(400).json({
        message: "Sequelize Error Due To Month or Year wrong syntax provided",
      });
    }
    res.json(
      new ApiError(
        200,
        error.message,
        "Error Occured while processing expenseOfMonth"
      )
    );
  }
});

export const exportToCSV = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  try {
    const expenses = await Expense.findAll({
      where: { userId },
      attributes: [
        "category",
        "description",
        "amount",
        ["createdAt", "ExpenseDate"],
      ],
    });
    const expensesJSON = expenses.map(serializeExpense);
    const csv = parse(expensesJSON, { header: true });
    res.header("Content-Type", "text/csv");
    res.header("Content-Disposition", "attachment; filename=expenses.csv");
    res.send(csv);
  } catch (error) {
    res.json(
      new ApiError(500, null, "An Error occurred While Exporting To CSV")
    );
  }
});
