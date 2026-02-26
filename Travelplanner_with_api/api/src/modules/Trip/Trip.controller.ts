import { NextFunction, Request, Response } from "express";
import Trip from "./Trip.model";
import NotFoundError from "../../middleware/error/NotFoundError";
import { AuthRequest } from "../../middleware/auth/authMiddleware";
import ActivityModel from "../Activity/Activity.model";
import ExpenseModel from "../Expense/Expense.model";
import NoteModel from "../Note/Note.model";

const getTrips = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthRequest;
    const trips = await Trip.find({ ownerId: user._id })
      .sort({ startDate: 1 })
      .lean()
      .populate('activities')
      .populate('expenses')
      .populate('notes');


    res.json(trips);
  } catch (e) {
    next(e);
  }
};


const getTripById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthRequest;
    const { id } = req.params;
    const trip = await Trip.findOne({
      _id: id,
      ownerId: user._id,
    })
      .lean()
      .populate('activities')
      .populate('expenses')
      .populate('notes');


    if (!trip) {
      throw new NotFoundError("Trip not found");
    }
    res.json(trip);
  } catch (e) {
    next(e);
  }
};

const createTrip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthRequest;
    const trip = new Trip({ ...req.body, ownerId: user._id });
    const result = await trip.save();
    res.json(result);
  } catch (e) {
    next(e);
  }
};

const updateTrip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthRequest;
    const { id } = req.params;
    const trip = await Trip.findOneAndUpdate(
      {
        _id: id,
        ownerId: user._id, 
      }, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!trip) {
      throw new NotFoundError("Trip not found");
    }
    res.json(trip);
  } catch (e) {
    next(e);
  }
};

const deleteTrip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthRequest;
    const { id } = req.params;

    const trip = await Trip.findOne({
      _id: id,
      ownerId: user._id,
    });

    if (!trip) {
      throw new NotFoundError("Trip not found");
    }

    await ActivityModel.deleteMany({ tripId: id });

    await ExpenseModel.deleteMany({ tripId: id });

    await NoteModel.deleteMany({ tripId: id });

    await Trip.findOneAndDelete({
      _id: id,
      ownerId: user._id,
    });

    res.json({});
  } catch (e) {
    next(e);
  }
};

export { getTrips, createTrip, getTripById, updateTrip, deleteTrip };
