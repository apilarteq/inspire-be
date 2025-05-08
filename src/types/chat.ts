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

export interface ModelChat extends Document {
  _id: string;
  title?: string;
  sessionId?: string;
  visitorId?: string;
  userId?: string;
  messages: ModelMessage[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChatResponse {
  status: "success" | "error";
  chat?: ModelChat;
  error?: string;
}

export interface GroupedChats {
  date: string;
  chats: ModelChat[];
}

export interface ChatAndMessageResponse {
  chat: ModelChat;
  message: ModelMessage;
}
