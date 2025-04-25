import { v4 as uuidv4 } from "uuid";
import Chat from "../models/chat.model";
import {
  AddMessageToChatDto,
  ChatAndMessageResponse,
  CreateChatWithMessagesDto,
  GroupedChats,
  ModelChat,
  UpdateChatArgs,
} from "../types/chat";
import { ModelMessage } from "../types/message";
import { isToday, isYesterday } from "../utils/functions";
import { AppError } from "../errors/app-error";

export const chatService = {
  async createAndAddMessage(
    args: CreateChatWithMessagesDto
  ): Promise<ChatAndMessageResponse> {
    const chat = new Chat({ ...args, messages: args.messages });
    await chat.save();

    return { chat, message: chat.messages[0] };
  },

  async addMessageToChat(args: AddMessageToChatDto): Promise<ModelMessage> {
    const uuid = uuidv4();
    const chat = await Chat.findOne({ _id: args.chatUuid });

    if (!chat) {
      throw new AppError("Chat not found");
    }

    chat.messages.push({ ...args.message, _id: uuid });
    await chat.save();
    return { ...args.message, _id: uuid };
  },

  async getChatsByUser(uuid: string): Promise<ModelChat[]> {
    const chats = await Chat.find({ userId: uuid })
      .select("-messages -visitorId -sessionId")
      .sort({ createdAt: -1 })
      .limit(20);

    if (!chats) {
      throw new AppError("Chats not found");
    }

    return chats;
  },

  async getGroupedChatsByUser(userId: string): Promise<GroupedChats[]> {
    const chats = await this.getChatsByUser(userId);

    const groups: { [key: string]: ModelChat[] } = {};

    chats.forEach((chat) => {
      let dateKey: string;

      if (isToday(chat.createdAt!)) {
        dateKey = "Hoy";
      } else if (isYesterday(chat.createdAt!)) {
        dateKey = "Ayer";
      } else {
        dateKey = chat.createdAt!.toLocaleDateString("es-ES", {
          month: "long",
        });
      }

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(chat);
    });

    return Object.entries(groups).map(([date, chats]) => ({
      date,
      chats,
    }));
  },

  async getChatByUuid(uuid: string): Promise<ModelChat> {
    const chat = await Chat.findOne({ _id: uuid });

    if (!chat) {
      throw new AppError("Chat not found");
    }

    return chat;
  },

  async updateChatTitle(args: UpdateChatArgs): Promise<ModelChat> {
    const chat = await Chat.findOne({ _id: args.chatUuid });

    if (!chat) {
      throw new AppError("Chat not found");
    }

    chat.title = args.title;
    return await chat.save();
  },

  async deleteChat(uuid: string): Promise<void> {
    await Chat.deleteOne({ _id: uuid });
  },
};
