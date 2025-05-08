import { Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import {
  generateStreamedResponse,
  generateStreamedResponseWithTitle,
} from "../../services/ai.service";
import { chatService } from "../../services/chat.service";
import handleSocketOperation from "./error-handler";
import {
  SocketChatMessageRequest,
  SocketRequestMessage,
} from "../../types/message";

export const messageHandler = (socket: Socket) => {
  socket.on("start-chat", async (message: SocketRequestMessage) => {
    let counter = 0;
    let fullResponse = "";
    let title = "";
    const streamedMessageUuid = uuidv4();

    const aiResponse = await handleSocketOperation(
      socket,
      "Error al generar la respuesta",
      generateStreamedResponseWithTitle(message.content, (value) => {
        title = value;
      })
    );

    if (!aiResponse) return;

    const chatAndMessage = await handleSocketOperation(
      socket,
      "Error al crear el chat",
      chatService.createAndAddMessage({
        title,
        sessionId: socket.request.sessionID,
        visitorId: message.visitorId,
        userId: socket.request.session.user.uuid,
        messages: [{ content: message.content, role: "user" }],
      })
    );

    if (!chatAndMessage) return;

    socket.emit("message-saved-successfully", {
      _id: chatAndMessage.message._id,
      content: message.content,
      role: "user",
      createdAt: chatAndMessage.message.createdAt,
      chatUuid: chatAndMessage.chat._id,
    });

    for await (const chunk of aiResponse.stream) {
      socket.emit("streamed-message", {
        content: chunk,
        role: "model",
        _id: streamedMessageUuid,
        isFirstChunk: counter === 0,
      });
      fullResponse += chunk;
      counter++;
    }

    await handleSocketOperation(
      socket,
      "Error al guardar el mensaje",
      chatService.addMessageToChat({
        chatUuid: chatAndMessage.chat._id,
        message: { content: fullResponse, role: "model" },
      })
    );

    await handleSocketOperation(
      socket,
      "Error al guardar el titulo",
      chatService.updateChatTitle({
        chatUuid: chatAndMessage.chat._id,
        title,
      })
    );

    socket.emit("end-streamed-message", { chatUuid: chatAndMessage.chat._id });
  });

  socket.on("message", async (message: SocketChatMessageRequest) => {
    let counter = 0;
    let fullResponse = "";
    const streamedMessageUuid = uuidv4();

    const userMessage = await handleSocketOperation(
      socket,
      "Error al guardar el mensaje",
      chatService.addMessageToChat({
        chatUuid: message.chatUuid,
        message: { content: message.content, role: "user" },
      })
    );

    if (!userMessage) return;

    socket.emit("message-saved-successfully", {
      _id: userMessage._id,
      content: message.content,
      role: "user",
      createdAt: userMessage.createdAt,
    });

    const aiResponse = await handleSocketOperation(
      socket,
      "Error al generar la respuesta",
      generateStreamedResponse(message.content, message.chatUuid)
    );

    if (!aiResponse) return;

    for await (const chunk of aiResponse.stream) {
      socket.emit("streamed-message", {
        content: chunk,
        role: "model",
        _id: streamedMessageUuid,
        isFirstChunk: counter === 0,
      });
      fullResponse += chunk;
      counter++;
    }

    await handleSocketOperation(
      socket,
      "Error al guardar el mensaje",
      chatService.addMessageToChat({
        chatUuid: message.chatUuid,
        message: { content: fullResponse, role: "model" },
      })
    );

    socket.emit("end-streamed-message");
  });
};
