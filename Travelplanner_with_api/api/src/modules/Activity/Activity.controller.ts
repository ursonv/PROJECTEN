import { NextFunction, Response, Request } from "express";
import NotFoundError from "../../middleware/error/NotFoundError";
import { AuthRequest } from "../../middleware/auth/authMiddleware";
import ActivityModel from "./Activity.model";
import TripModel from "../Trip/Trip.model";

const getActivities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthRequest;
    const activities = await ActivityModel.find({
      ownerId: user._id,
    })
      .sort({ date: 1 })
      .lean()
      .populate("trip", ["destination", "startDate", "endDate", "_id"]);

    res.json(activities);
    
  } catch (e) {
    next(e);
  }
};

const getActivityDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthRequest;
    const { id } = req.params;
    const activity = await ActivityModel.findOne({
      _id: id,
      ownerId: user._id,
    })
      .lean()
      .populate("trip");

    if (!activity) {
      throw new NotFoundError("Activity not found");
    }
    res.json(activity);
  } catch (e) {
    next(e);
  }
};

const createActivity = async (req: Request, res: Response, next: NextFunction) => {
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

    const activity = new ActivityModel({
      ...req.body,
      ownerId: user._id,
    });

    const savedActivity = await activity.save();

    trip.activities.push(savedActivity._id);
    await trip.save();

    res.json(savedActivity);
  } catch (e) {
    next(e);
  }
};


const updateActivity = async (req: Request, res: Response, next: NextFunction) => {
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

    const activity = await ActivityModel.findOneAndUpdate(
      {
        _id: id,
        ownerId: user._id,
      },
      req.body,
      { new: true, runValidators: true }
    );
    if (!activity) {
      throw new NotFoundError("Activity not found");
    }
    res.json(activity);
  } catch (e) {
    next(e);
  }
};

const deleteActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthRequest;
    const { id } = req.params;

    const activity = await ActivityModel.findOne({
      _id: id,
      ownerId: user._id,
    });

    if (!activity) {
      throw new NotFoundError("Activity not found");
    }

    const trip = await TripModel.findOne({
      _id: activity.tripId,
      ownerId: user._id,
    });

    if (!trip) {
      throw new NotFoundError("Trip not found");
    }

    const index = trip.activities.indexOf(activity._id);
    if (index !== -1) {
      trip.activities.splice(index, 1);
    }

    await trip.save();
    
    await ActivityModel.findOneAndDelete({
      _id: id,
      ownerId: user._id,
    });

    res.json({});
  } catch (e) {
    next(e);
  }
};


export { getActivities, getActivityDetail, createActivity, updateActivity, deleteActivity };
