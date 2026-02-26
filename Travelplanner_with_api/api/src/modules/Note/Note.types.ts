import { Document, ObjectId } from "mongoose";
import { Trip } from "../Trip/Trip.types";


export type Note = Document & {
  _id?: string;
  title: string;
  ownerId: ObjectId;
  content: string;
  tripId: ObjectId;
  trip?: Trip;
};
