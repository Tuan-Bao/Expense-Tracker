import formatDate from "./dateUtils.js";

const serializeExpense = (expense) => {
  const expenseData = expense.toJSON();
  return {
    category: expenseData.category,
    description: expenseData.description,
    amount: expenseData.amount,
    ExpenseDate: formatDate(expenseData.ExpenseDate),
  };
};

export default serializeExpense;
