import { model, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { ModelChat } from "../types/chat";

const chatSchema = new Schema<ModelChat>(
  {
    _id: {
      type: String,
      default: uuidv4,
      immutable: true,
      required: true,
    },
    title: { type: String },
    sessionId: { type: String },
    visitorId: { type: String },
    userId: { type: String, ref: "User" },
    messages: [
      {
        _id: {
          type: String,
          default: uuidv4,
          unique: true,
          immutable: true,
          required: true,
        },
        content: { type: String, required: true },
        role: { type: String, enum: ["user", "assistant"], required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true, _id: false }
);

export default model("Chat", chatSchema);
