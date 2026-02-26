import { NextFunction, Response, Request } from "express";
import NotFoundError from "../../middleware/error/NotFoundError";
import { AuthRequest } from "../../middleware/auth/authMiddleware";
import NoteModel from "./Note.model";
import TripModel from "../Trip/Trip.model";

const getNotes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthRequest;
    const notes = await NoteModel.find({
      ownerId: user._id,
    })
      .lean()
      .populate("trip", ["destination", "_id"]);

    res.json(notes);
    
  } catch (e) {
    next(e);
  }
};

const getNoteDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthRequest;
    const { id } = req.params;
    const note = await NoteModel.findOne({
      _id: id,
      ownerId: user._id,
    })
      .lean()
      .populate("trip");

    if (!note) {
      throw new NotFoundError("Note not found");
    }
    res.json(note);
  } catch (e) {
    next(e);
  }
};

const createNote = async (req: Request, res: Response, next: NextFunction) => {
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

    const note = new NoteModel({
      ...req.body,
      ownerId: user._id,
    });

    const savedNote = await note.save();

    trip.notes.push(savedNote._id);
    await trip.save();

    res.json(savedNote);
  } catch (e) {
    next(e);
  }
};

const updateNote = async (req: Request, res: Response, next: NextFunction) => {
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

    const note = await NoteModel.findOneAndUpdate(
      {
        _id: id,
        ownerId: user._id,
      },
      req.body,
      { new: true, runValidators: true }
    );
    if (!note) {
      throw new NotFoundError("Note not found");
    }
    res.json(note);
  } catch (e) {
    next(e);
  }
};

const deleteNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthRequest;
    const { id } = req.params;

    const note = await NoteModel.findOne({
      _id: id,
      ownerId: user._id,
    });

    if (!note) {
      throw new NotFoundError("Note not found");
    }

    const trip = await TripModel.findOne({
      _id: note.tripId,
      ownerId: user._id,
    });

    if (!trip) {
      throw new NotFoundError("Trip not found");
    }

    const index = trip.notes.indexOf(note._id);
    if (index !== -1) {
      trip.notes.splice(index, 1);
    }

    await trip.save();
    
    await NoteModel.findOneAndDelete({
      _id: id,
      ownerId: user._id,
    });

    res.json({});
  } catch (e) {
    next(e);
  }
};

export { getNotes, getNoteDetail, createNote, updateNote, deleteNote };
