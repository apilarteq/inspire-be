import session from "express-session";
import MongoStore from "connect-mongo";
import { config } from "../config";
import { UserSession } from "../types/user";

declare module "express-session" {
  interface SessionData {
    user: UserSession;
  }
}

const sessionMiddleware = session({
  name: "sessionId",
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    domain: config.backendDomain,
    path: "/",
  },
  store: MongoStore.create({
    mongoUrl: config.mongoUri,
    ttl: 30 * 24 * 60 * 60 * 1000,
    autoRemove: "interval",
    autoRemoveInterval: 1,
  }),
});

export default sessionMiddleware;
