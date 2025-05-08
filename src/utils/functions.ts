import { CUSTOM_PROMPT, CUSTOM_PROMPT_WITH_TITLE } from "./constants";

export function extractTitle(llmResponse: string) {
  const titleRegex = /TÍTULO:\s*(.+?)\n/i;
  const match = llmResponse.match(titleRegex);
  return match ? match[1].trim() : "Conversación sobre arte";
}

export function cleanResponse(llmResponse: string) {
  return llmResponse.replace(/TÍTULO:\s*.+?\n/i, "").trim();
}

export function generateCustomPromptWithTitle(prompt: string) {
  return `${CUSTOM_PROMPT_WITH_TITLE} ${prompt}`;
}

export function generateCustomPrompt(prompt: string) {
  return `${CUSTOM_PROMPT} ${prompt}`;
}

export const isToday = (date: Date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const isYesterday = (date: Date) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
};

export const isSevenDaysAgo = (date: Date) => {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  return (
    date.getDate() === sevenDaysAgo.getDate() &&
    date.getMonth() === sevenDaysAgo.getMonth() &&
    date.getFullYear() === sevenDaysAgo.getFullYear()
  );
};
