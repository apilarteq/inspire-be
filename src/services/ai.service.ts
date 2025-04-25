import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config";
import { generateCustomPrompt } from "../utils/functions";

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
 * Generate AI streamed response
 * @param {string} prompt - Prompt for AI
 * @returns {Promise<{ stream: AsyncGenerator<string>; title: string }>} - AI response
 */
export const generateAiStreamedResponse = async (
  prompt: string,
  onTitle?: (title: string) => void
): Promise<{ stream: AsyncGenerator<string>; title: string }> => {
  const gemini = new GoogleGenerativeAI(config.geminiApiKey);
  const model = gemini.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
  const customPrompt = generateCustomPrompt(prompt);
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
          console.log("TITULO PARA LA DB", title);

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
