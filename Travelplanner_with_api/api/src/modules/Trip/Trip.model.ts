// Trip model
import mongoose from "mongoose";
import validateModel from "../../validation/validateModel";
import { Trip } from "./Trip.types";

const tripSchema = new mongoose.Schema<Trip>(
  {
    destination: {
      type: String,
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    img: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['planned', 'ongoing', 'completed'],
      default: 'planned',
      required: true,
    },
    activities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }],
    expenses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Expense' }], 
    notes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }], 
  },
  {
    timestamps: true,
  }
);

tripSchema.pre("save", function (next) {
  validateModel(this);
  next();
});

const TripModel = mongoose.model<Trip>("Trip", tripSchema);

export default TripModel;
