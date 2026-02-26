import { Expense, ExpenseBody } from "./Expense.types";
import { API } from "@core/network/api";

const getExpenses = () => {
  return API.get<Expense[]>("/expenses");
};

const getExpenseById = (id: string) => {
  return API.get<Expense>(`/expenses/${id}`);
};

const createExpense = (trip: ExpenseBody) => {
  return API.post<Expense>("/expenses", trip);
};

const updateExpense = (id: string, trip: ExpenseBody) => {
  return API.patch<Expense>(`/expenses/${id}`, trip);
};

const deleteExpense = (id: string) => {
  return API.delete(`/expenses/${id}`);
};


export { getExpenses, getExpenseById, createExpense, updateExpense, deleteExpense };
