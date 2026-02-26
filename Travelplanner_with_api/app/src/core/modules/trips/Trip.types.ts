import { Activity } from "../activities/Activity.types";
import { Expense } from "../expenses/Expense.types";
import { Note } from "../notes/Note.types";

export type Trip = {
    _id: string;
    destination: string;
    img: string;
    startDate: string;
    endDate: string;
    status: string;
    activities: Activity[];
    expenses: Expense[];
    notes: Note[];
};

export type TripBody = Omit<Trip, "_id">;