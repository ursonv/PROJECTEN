import { Trip } from "../trips/Trip.types";

export type Note = {
  _id: string;
  title: string;
  content: string;
  tripId: string;
  trip?: Trip;
};

export type NoteBody = Omit<Note, "_id">;
