import { Router } from "express";
import {
  createActivity,
  deleteActivity,
  getActivityDetail,
  getActivities,
  updateActivity,
} from "./Activity.controller";

const router: Router = Router();

router.get("/activities", getActivities);
router.get("/activities/:id", getActivityDetail);
router.post("/activities", createActivity);
router.patch("/activities/:id", updateActivity);
router.delete("/activities/:id", deleteActivity);

export default router;
