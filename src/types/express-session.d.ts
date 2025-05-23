import { Session, SessionData } from "express-session";
import { UserSession } from "./user";

declare module "express-session" {
  interface SessionData {
    user: UserSession;
  }
}

declare module "http" {
  interface IncomingMessage {
    sessionID: string;
    session: Session & Partial<SessionData>;
  }
}

declare global {
  namespace Express {
    interface Request {
      sessionID: string;
      session: Session & Partial<SessionData>;
    }
  }
}
