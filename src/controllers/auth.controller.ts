import { NextFunction, Request, Response } from "express";
import { authService } from "../services/auth.service";
import { UserSession } from "../types/user";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, password, remember } = req.body;

  if (!username || !password || typeof remember !== "boolean") {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  try {
    const user = await authService.login({ username, password });
    const userSession: UserSession = {
      uuid: user._id,
      username,
    };
    req.session.user = userSession;
    if (remember) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    } else {
      req.session.cookie.expires = undefined;
      req.session.cookie.maxAge = undefined;
    }
    req.session.save();
    return res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  try {
    const user = await authService.register({ username, password });
    const userSession: UserSession = {
      uuid: user._id,
      username,
    };
    req.session.user = userSession;
    req.session.save();
    return res.status(200).json({ success: true });
  } catch (error: any) {
    next(error);
  }
};

export const verifySession = async (req: Request, res: Response) => {
  if (req.session.user) {
    return res.status(200).json({ success: true, user: req.session.user });
  }
  return res.status(401).json({ success: false, error: "Unauthorized" });
};

export const logout = async (req: Request, res: Response) => {
  if (!req.session.user) return res.status(401).json({ error: "Unauthorized" });

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Error al cerrar sesión" });
    }
    res.clearCookie("sessionId");
    return res.status(200).json({ message: "Sesión cerrada" });
  });
};
