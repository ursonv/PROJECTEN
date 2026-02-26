import { Document, ObjectId } from "mongoose";
import { Trip } from "../Trip/Trip.types";


export type Expense = Document & {
  _id?: string;
  date: Date;
  ownerId: ObjectId;
  description: string;
  amount: string;
  tripId: ObjectId;
  trip?: Trip;
};
