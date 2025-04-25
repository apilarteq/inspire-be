import { Document } from "mongoose";

export interface Auth {
  username: string;
  password: string;
}

export interface LoginDto extends Auth {}

export interface RegisterDto extends Auth {}

export interface UserModel extends Document {
  _id: string;
  username: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserSession {
  uuid: string;
  username: string;
}
