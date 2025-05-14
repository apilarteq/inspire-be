import { v4 as uuidv4 } from "uuid";
import ChatModel from "../models/chat.model";
import {
  AddMessageToChatDto,
  Chat,
  ChatAndMessageResponse,
  CreateChatWithMessagesDto,
  GroupedChats,
  ModelChat,
  UpdateChatArgs,
} from "../types/chat";
import { ModelMessage } from "../types/message";
import { escapeStringRegexp, isToday, isYesterday } from "../utils/functions";
import { AppError } from "../errors/app-error";

export const chatService = {
  async createAndAddMessage(
    args: CreateChatWithMessagesDto
  ): Promise<ChatAndMessageResponse> {
    const chat = new ChatModel({ ...args, messages: args.messages });
    await chat.save();

    return { chat, message: chat.messages![0] };
  },

  async addMessageToChat(args: AddMessageToChatDto): Promise<ModelMessage> {
    const uuid = uuidv4();
    const chat = await ChatModel.findOne({ _id: args.chatUuid });

    if (!chat) {
      throw new AppError("Chat not found");
    }

    chat.messages!.push({ ...args.message, _id: uuid });
    await chat.save();
    return { ...args.message, _id: uuid };
  },

  async getChatsByUser(uuid: string): Promise<Chat[]> {
    const chats = await ChatModel.aggregate([
      {
        $match: {
          userId: uuid,
        },
      },
      {
        $project: {
          title: 1,
          sessionId: 1,
          visitorId: 1,
          userId: 1,
          createdAt: 1,
          messages: 1,
        },
      },
      {
        $addFields: {
          messages: { $slice: ["$messages", -1] },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $limit: 20,
      },
    ]);

    if (!chats) {
      throw new AppError("Chats not found");
    }

    const chatsFormatted: Chat[] = chats.map((chat) => ({
      _id: chat._id,
      title: chat.title,
      createdAt: chat.createdAt,
      message: chat.messages[0].content,
    }));

    return chatsFormatted;
  },

  async getGroupedChatsByUser(userId: string): Promise<GroupedChats[]> {
    const chats = await this.getChatsByUser(userId);

    const groups: { [key: string]: Chat[] } = {};

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
    const chat = await ChatModel.findOne({ _id: uuid });

    if (!chat) {
      throw new AppError("Chat not found");
    }

    return chat;
  },

  async searchChats(
    search: string,
    page = 1,
    limit = 15
  ): Promise<{ chats: Chat[]; totalCount: number }> {
    const escapedTerm = escapeStringRegexp(search);
    const regex = new RegExp(escapedTerm, "i");
    const skip = (page - 1) * limit;

    const result = await ChatModel.aggregate([
      {
        $match: {
          $or: [{ title: regex }, { "messages.content": regex }],
        },
      },
      {
        $facet: {
          totalCount: [{ $count: "count" }],
          chats: [
            {
              $project: {
                title: 1,
                sessionId: 1,
                visitorId: 1,
                userId: 1,
                createdAt: 1,
                totalMatchingMessages: {
                  $size: {
                    $filter: {
                      input: "$messages",
                      as: "msg",
                      cond: {
                        $regexMatch: { input: "$$msg.content", regex: regex },
                      },
                    },
                  },
                },
                messages: {
                  $slice: [
                    {
                      $sortArray: {
                        input: {
                          $filter: {
                            input: "$messages",
                            as: "msg",
                            cond: {
                              $regexMatch: {
                                input: "$$msg.content",
                                regex: regex,
                              },
                            },
                          },
                        },
                        sortBy: { createdAt: -1 },
                      },
                    },
                    1,
                  ],
                },
              },
            },
            { $skip: skip },
            { $limit: limit },
          ],
        },
      },
      {
        $project: {
          totalCount: { $arrayElemAt: ["$totalCount.count", 0] },
          chats: 1,
        },
      },
    ]);

    console.log(result[0].chats);

    if (!result) {
      throw new AppError("Chats not found");
    }

    const chatsFormatted: Chat[] =
      result[0].chats.length > 0
        ? result[0].chats.map((chat: ModelChat) => ({
            _id: chat._id,
            title: chat.title,
            createdAt: chat.createdAt,
            message: chat.messages![0]?.content,
          }))
        : [];

    return {
      chats: chatsFormatted,
      totalCount: result[0].totalCount,
    };
  },

  async updateChatTitle(args: UpdateChatArgs): Promise<ModelChat> {
    const chat = await ChatModel.findOne({ _id: args.chatUuid });

    if (!chat) {
      throw new AppError("Chat not found");
    }

    chat.title = args.title;
    return await chat.save();
  },

  async deleteChat(uuid: string): Promise<void> {
    const { deletedCount } = await ChatModel.deleteOne({ _id: uuid });

    if (deletedCount === 0) {
      throw new AppError("Chat not found");
    }
  },
};
