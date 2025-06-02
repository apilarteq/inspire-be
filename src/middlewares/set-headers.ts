import { NextFunction, Request, Response } from "express";
import { config } from "../config";

const acceptedOrigins = ["http://localhost:3001", config.prodFrontendUrl];

const setHeaders = (req: Request, res: Response, next: NextFunction) => {
  console.log("ORIGIN", req.headers.origin);
  if (!req.headers.origin || !acceptedOrigins.includes(req.headers.origin)) {
    return next();
  }

  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Credentials", "true");
  next();
};

export default setHeaders;
