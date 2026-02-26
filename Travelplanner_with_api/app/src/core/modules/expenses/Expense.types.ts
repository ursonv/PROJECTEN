import { Trip } from "../trips/Trip.types";

export type Expense = {
  _id: string;
  date: string;
  description: string;
  amount: string;
  tripId: string;
  trip?: Trip;
};

export type ExpenseBody = Omit<Expense, "_id">;
