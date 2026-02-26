import { NextFunction, Response, Request } from "express";
import NotFoundError from "../../middleware/error/NotFoundError";
import { AuthRequest } from "../../middleware/auth/authMiddleware";
import ExpenseModel from "./Expense.model";
import TripModel from "../Trip/Trip.model";

const getExpenses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthRequest;
    const expenses = await ExpenseModel.find({
      ownerId: user._id,
    })
      .sort({ date: 1 })
      .lean()
      .populate("trip", ["destination", "startDate", "endDate", "_id"]);

    res.json(expenses);
    
  } catch (e) {
    next(e);
  }
};

const getExpenseDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthRequest;
    const { id } = req.params;
    const expense = await ExpenseModel.findOne({
      _id: id,
      ownerId: user._id,
    })
      .lean()
      .populate("trip");

    if (!expense) {
      throw new NotFoundError("Expense not found");
    }
    res.json(expense);
  } catch (e) {
    next(e);
  }
};

const createExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthRequest;
    const tripId = req.body.tripId;

    const trip = await TripModel.findOne({
      _id: tripId,
      ownerId: user._id,
    });

    if (!trip) {
      throw new NotFoundError("Trip not found");
    }

    const expense = new ExpenseModel({
      ...req.body,
      ownerId: user._id,
    });

    const savedExpense = await expense.save();

    trip.expenses.push(savedExpense._id);
    await trip.save();

    res.json(savedExpense);
  } catch (e) {
    next(e);
  }
};

const updateExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthRequest;
    const { id } = req.params;

    if (req.body.tripId) {
      const trip = await TripModel.findOne({
        _id: req.body.tripId,
        ownerId: user._id,
      });

      if (!trip) {
        throw new NotFoundError("Trip not found");
      }
    }

    const expense = await ExpenseModel.findOneAndUpdate(
      {
        _id: id,
        ownerId: user._id,
      },
      req.body,
      { new: true, runValidators: true }
    );
    if (!expense) {
      throw new NotFoundError("Expense not found");
    }
    res.json(expense);
  } catch (e) {
    next(e);
  }
};

const deleteExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthRequest;
    const { id } = req.params;

    const expense = await ExpenseModel.findOne({
      _id: id,
      ownerId: user._id,
    });

    if (!expense) {
      throw new NotFoundError("Expense not found");
    }

    const trip = await TripModel.findOne({
      _id: expense.tripId,
      ownerId: user._id,
    });

    if (!trip) {
      throw new NotFoundError("Trip not found");
    }

    const index = trip.expenses.indexOf(expense._id);
    if (index !== -1) {
      trip.expenses.splice(index, 1);
    }

    await trip.save();
    
    await ExpenseModel.findOneAndDelete({
      _id: id,
      ownerId: user._id,
    });

    res.json({});
  } catch (e) {
    next(e);
  }
};

export { getExpenses, getExpenseDetail, createExpense, updateExpense, deleteExpense };
