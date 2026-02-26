import { Activity, ActivityBody } from "./Activity.types";
import { API } from "@core/network/api";

const getActivities = () => {
  return API.get<Activity[]>("/activities");
};

const getActivityById = (id: string) => {
  return API.get<Activity>(`/activities/${id}`);
};

const createActivity = (trip: ActivityBody) => {
  return API.post<Activity>("/activities", trip);
};

const updateActivity = (id: string, trip: ActivityBody) => {
  return API.patch<Activity>(`/activities/${id}`, trip);
};

const deleteActivity = (id: string) => {
  return API.delete(`/activities/${id}`);
};


export { getActivities, getActivityById, createActivity, updateActivity, deleteActivity };
