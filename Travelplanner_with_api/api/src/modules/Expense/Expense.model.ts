import mongoose from "mongoose";
import { Expense } from "./Expense.types";
import validateModel from "../../validation/validateModel";

const expenseSchema = new mongoose.Schema<Expense>(
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
        amount: {
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

expenseSchema.virtual("trip", {
    ref: "Trip",
    localField: "tripId",
    foreignField: "_id",
    justOne: true,
});

expenseSchema.pre("save", function (next) {
    validateModel(this);
    next();
});

const ExpenseModel = mongoose.model<Expense>("Expense", expenseSchema);

export default ExpenseModel;