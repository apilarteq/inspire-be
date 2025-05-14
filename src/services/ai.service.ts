import { Content, GoogleGenerativeAI } from "@google/generative-ai";
import Chat from "../models/chat.model";
import { config } from "../config";
import {
  generateCustomPrompt,
  generateCustomPromptWithTitle,
} from "../utils/functions";

/**
 * Generate AI response
 * @param {string} prompt - Prompt for AI
 * @returns {Promise<string>} - AI response
 */
export const generateAiResponse = async (prompt: string): Promise<string> => {
  try {
    const gemini = new GoogleGenerativeAI(config.geminiApiKey);
    const model = gemini.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const customPrompt = `${prompt}`;
    const result = await model.generateContent(customPrompt);
    return result.response.text();
  } catch (error) {
    console.log(error);
    throw new Error("Can't get AI response");
  }
};

/**
 * Generate AI streamed response with title
 * @param {string} prompt - Prompt for AI
 * @returns {Promise<{ stream: AsyncGenerator<string>; title: string }>} - AI response
 */
export const generateStreamedResponseWithTitle = async (
  prompt: string,
  onTitle?: (title: string) => void
): Promise<{ stream: AsyncGenerator<string>; title: string }> => {
  const gemini = new GoogleGenerativeAI(config.geminiApiKey);
  const model = gemini.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
  const customPrompt = generateCustomPromptWithTitle(prompt);
  const result = await model.generateContentStream(customPrompt);

  let fullResponse = "";
  let title = "";

  async function* transformStream() {
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;

      if (!title && fullResponse.includes("TÍTULO:")) {
        const titleMatch = fullResponse.match(
          /TÍTULO:\s*([\s\S]+?)\s*RESPUESTA:/
        );
        if (titleMatch) {
          title = titleMatch[1].trim();
          onTitle?.(title);

          const responseStart = fullResponse.indexOf("RESPUESTA:") + 10;
          const initialResponse = fullResponse.slice(responseStart);
          yield initialResponse;
        }
      } else if (title) {
        yield chunkText;
      }
    }
  }

  return { stream: transformStream(), title };
};

/**
 * Generate AI streamed response
 * @param {string} prompt - Prompt for AI
 * @returns {Promise<{ stream: AsyncGenerator<string> }>} - AI response
 */
export const generateStreamedResponse = async (
  prompt: string,
  chatUuid: string,
  onTitle?: (title: string) => void
): Promise<{ stream: AsyncGenerator<string> }> => {
  try {
    const gemini = new GoogleGenerativeAI(config.geminiApiKey);
    const model = gemini.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const messages: Content[] = [];

    const chatHistory = await Chat.findOne({
      _id: chatUuid,
    }).select("messages");

    chatHistory?.messages!.forEach((message) => {
      const part =
        message.role === "user"
          ? message.content
          : message.content.match(/^(?:\s*\n)*(.*?)(?:\n\s*\n|$)/s)?.[1] || "";

      messages.push({
        role: message.role,
        parts: [{ text: part }],
      });
    });

    const chat = model.startChat({
      history: messages,
      generationConfig: {
        maxOutputTokens: 100,
      },
    });

    const result = await chat.sendMessageStream(generateCustomPrompt(prompt));

    let fullResponse = "";

    async function* transformStream() {
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
        yield chunkText;
      }
    }

    return { stream: transformStream() };
  } catch (error) {
    console.log(error);
    throw new Error("Can't get AI response");
  }
};
