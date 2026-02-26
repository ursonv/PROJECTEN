import { Document, ObjectId } from "mongoose";

export type Trip = Document & {
  _id?: string;
  destination: string;
  ownerId: ObjectId;
  img: string;
  startDate: Date;
  endDate: Date;
   status: string;
   activities: ObjectId[];
   expenses: ObjectId[];
   notes: ObjectId[];
};
