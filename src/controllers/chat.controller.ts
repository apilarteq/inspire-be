import { Request, Response } from "express";
import { chatService } from "../services/chat.service";

export const getChats = async (req: Request, res: Response) => {
  try {
    const uuid = req.session.user?.uuid;

    const chats = await chatService.getChatsByUser(uuid);
    return res.status(200).json({ success: true, data: chats });
  } catch (error) {
    return res.status(500).json({ error: "Error getting chats" });
  }
};

export const getGroupedChats = async (req: Request, res: Response) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const chats = await chatService.getGroupedChatsByUser(
      req.session.user.uuid
    );
    return res.status(200).json({ success: true, data: chats });
  } catch (error) {
    return res.status(500).json({ error: "Error getting grouped chats" });
  }
};

export const getChatByUuid = async (req: Request, res: Response) => {
  try {
    const uuid = req.params.uuid;

    if (!uuid) {
      return res.status(400).json({ error: "Invalid uuid" });
    }

    const chat = await chatService.getChatByUuid(uuid);
    return res.status(200).json({ success: true, data: chat });
  } catch (error) {
    return res.status(500).json({ error: "Error getting chat" });
  }
};

export const updateChatTitle = async (req: Request, res: Response) => {
  try {
    const { title } = req.body;
    const uuid = req.params.uuid;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    await chatService.updateChatTitle({
      chatUuid: uuid,
      title,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Error updating chat title" });
  }
};

export const deleteChat = async (req: Request, res: Response) => {
  try {
    const uuid = req.params.uuid;

    if (!uuid) {
      return res.status(400).json({ error: "Invalid uuid" });
    }

    await chatService.deleteChat(uuid);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Error deleting chat" });
  }
};
