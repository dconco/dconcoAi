import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import { CachedMessageData } from "@/types/cache";
import { config } from "dotenv";
import instructions from "./training";
import path from "path";
import fs from "fs";

config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const filePath = path.join(__dirname, "../cache/db/cachedMessages.json");

function loadMessages(number: string) {
   if (!fs.existsSync(filePath)) return [];

   const data: CachedMessageData = JSON.parse(fs.readFileSync(filePath, "utf8"));

   if (data[number]?.messages.length > 10) {
      // Keep only the last 10 messages
      data[number].messages = data[number].messages.slice(-10);
   }
   return data[number]?.messages || [];
}

export default async function chatWithUser(name: string|undefined, number: string, userMessage: string): Promise<string> {
   const oldMessages = loadMessages(number);
   if (name) instructions.push(`The user's name is ${name}. Respond in a friendly and professional manner.`);

   const history = oldMessages.flatMap(msg => [
      { role: "user", parts: [{ text: msg.text } as Part] },
      { role: "model", parts: [{ text: msg.reply } as Part] }
   ]);

   const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: instructions.join('\n\n')
   });

   const chat = model.startChat({ history });

  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}
