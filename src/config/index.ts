import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  sessionSecret: process.env.SESSION_SECRET || "",
  mongoUri: process.env.MONGODB_URI || "",
};
