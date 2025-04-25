import { model, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { UserModel } from "../types/user";

const userSchema = new Schema<UserModel>(
  {
    _id: {
      type: String,
      default: uuidv4,
      immutable: true,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

export default model("User", userSchema);
