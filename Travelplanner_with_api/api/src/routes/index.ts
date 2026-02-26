import { Express, Router } from "express";
import tripRoutes from "../modules/Trip/Trip.routes";
import activityRoutes from "../modules/Activity/Activity.routes";
import expenseRoutes from "../modules/Expense/Expense.routes";
import noteRoutes from "../modules/Note/Note.routes";
import { errorHandler } from "../middleware/error/errorHandlerMiddleware";
import userPublicRoutes from "../modules/User/User.public.routes";
import userPrivateRoutes from "../modules/User/User.private.routes";

import { authJwt } from "../middleware/auth/authMiddleware";




const registerRoutes = (app: Express) => {

  app.use("/", userPublicRoutes);

  const authRoutes = Router();
  authRoutes.use("/", userPrivateRoutes);
  authRoutes.use("/", tripRoutes);
  authRoutes.use("/", activityRoutes);
  authRoutes.use("/", expenseRoutes);
  authRoutes.use("/", noteRoutes);

  app.use(authJwt, authRoutes);

  // Komt altijd na alle routes !
  app.use(errorHandler);
};

export { registerRoutes };
