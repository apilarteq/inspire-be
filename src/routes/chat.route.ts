import express, { Request, Response } from "express";
import {
  deleteChat,
  getChatByUuid,
  getChats,
  getGroupedChats,
  searchChats,
  updateChatTitle,
} from "../controllers/chat.controller";
import { isAuthenticated } from "../middlewares/auth";

const router = express.Router();

router.use(isAuthenticated);

router.get("/", (req: Request, res: Response) => {
  getChats(req, res);
});

router.get("/grouped", (req: Request, res: Response) => {
  getGroupedChats(req, res);
});

router.get("/search", (req: Request, res: Response) => {
  searchChats(req, res);
});

router.get("/:uuid", (req: Request, res: Response) => {
  getChatByUuid(req, res);
});

router.patch("/:uuid", (req: Request, res: Response) => {
  updateChatTitle(req, res);
});

router.delete("/:uuid", (req: Request, res: Response) => {
  deleteChat(req, res);
});

export default router;
