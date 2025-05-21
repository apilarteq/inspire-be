import { Document } from "mongoose";
import { ModelMessage } from "./message";

export interface CreateChatDto {
  visitorId: string;
  sessionId?: string;
  userId?: string;
  title?: string;
}

interface Message {
  content: string;
  role: "user" | "model";
}

export interface CreateChatWithMessagesDto extends CreateChatDto {
  messages: Message[];
}

export interface AddMessageToChatDto {
  chatUuid: string;
  message: Message;
}

export interface UpdateChatArgs {
  chatUuid: string;
  title: string;
}

export interface Chat {
  _id: string;
  title?: string;
  sessionId?: string;
  visitorId?: string;
  userId?: string;
  messages?: ModelMessage[];
  message?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ModelChat = Document & Chat;

export interface ChatResponse {
  status: "success" | "error";
  chat?: ModelChat;
  error?: string;
}

export interface GroupedChats {
  date: string;
  chats: Chat[];
}

export interface ChatAndMessageResponse {
  chat: ModelChat;
  message: ModelMessage;
}
