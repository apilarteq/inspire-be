export interface SocketRequestMessage {
  content: string;
  visitorId: string;
}

export interface SocketChatMessageRequest extends SocketRequestMessage {
  chatUuid: string;
}

export interface SocketReturnMessage {
  content: string;
  role: "user" | "model";
}

export interface ModelMessage {
  _id: string;
  content: string;
  role: "user" | "model";
  createdAt?: Date;
}

export interface MessageResponse {
  status: "success" | "error";
  message?: ModelMessage;
  error?: string;
}
