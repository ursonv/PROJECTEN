import mongoose from "mongoose";
import { Activity } from "./Activity.types";
import validateModel from "../../validation/validateModel";

const activitySchema = new mongoose.Schema<Activity>(
    {
        date: {
        type: Date,
        required: true,
        },
        ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        },
        description: {
        type: String,
        required: true,
        },
        image: {
        type: String,
        required: true,
        },
        location: {
        type: String,
        required: true,
        },
        tripId: {
        // don't import ObjectId -> TS problems
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        },
    },
    {
        timestamps: true,
    }
);

activitySchema.virtual("trip", {
    ref: "Trip",
    localField: "tripId",
    foreignField: "_id",
    justOne: true,
});

activitySchema.pre("save", function (next) {
    validateModel(this);
    next();
});

const ActivityModel = mongoose.model<Activity>("Activity", activitySchema);

export default ActivityModel;