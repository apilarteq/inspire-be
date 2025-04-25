import express, { NextFunction, Request, Response } from "express";
import {
  login,
  logout,
  register,
  verifySession,
} from "../controllers/auth.controller";

const router = express.Router();

router.post("/login", (req: Request, res: Response, next: NextFunction) => {
  login(req, res, next);
});

router.post("/register", (req: Request, res: Response, next: NextFunction) => {
  register(req, res, next);
});

router.get("/verify", (req: Request, res: Response) => {
  verifySession(req, res);
});

router.post("/logout", (req: Request, res: Response) => {
  logout(req, res);
});

export default router;
