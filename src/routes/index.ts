import { Express } from "express";
import authRoutes from "./auth.route";
import chatRoutes from "./chat.route";
import { errorHandler } from "../middlewares/error";

export default function router(app: Express) {
  app.use("/auth", authRoutes);
  app.use("/chat", chatRoutes);
  app.use(errorHandler);
}
