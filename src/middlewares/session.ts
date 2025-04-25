import session from "express-session";
import MongoStore from "connect-mongo";
import { config } from "../config";

declare module "express-session" {
  interface SessionData {
    user: {
      uuid: string;
      username: string;
    };
  }
}

export default session({
  name: "sessionId",
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  },
  store: MongoStore.create({
    mongoUrl: config.mongoUri,
    ttl: 30 * 24 * 60 * 60 * 1000, // Se eliminara en 30 días en segundos
    autoRemove: "interval",
    autoRemoveInterval: 1,
  }),
});
