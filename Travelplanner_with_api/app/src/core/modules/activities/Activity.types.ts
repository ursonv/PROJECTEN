import { Trip } from "../trips/Trip.types";

export type Activity = {
  _id: string;
  date: string;
  description: string;
  image: string,
  location: string;
  tripId: string;
  trip?: Trip;
};

export type ActivityBody = Omit<Activity, "_id">;
