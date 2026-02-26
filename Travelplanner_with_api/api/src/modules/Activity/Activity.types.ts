import { Document, ObjectId } from "mongoose";
import { Trip } from "../Trip/Trip.types";


export type Activity = Document & {
  _id?: string;
  date: Date;
  ownerId: ObjectId;
  description: string;
  image: string;
  location: string;
  tripId: ObjectId;
  trip?: Trip;
};