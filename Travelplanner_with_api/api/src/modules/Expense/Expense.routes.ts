import { Router } from "express";
import {
  createExpense,
  deleteExpense,
  getExpenseDetail,
  getExpenses,
  updateExpense,
} from "./Expense.controller";

const router: Router = Router();

router.get("/expenses", getExpenses);
router.get("/expenses/:id", getExpenseDetail);
router.post("/expenses", createExpense);
router.patch("/expenses/:id", updateExpense);
router.delete("/expenses/:id", deleteExpense);

export default router;
