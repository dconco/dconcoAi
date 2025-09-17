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

export default async function chatWithUser(
   name: string|undefined, 
   number: string, 
   userMessage: string, 
   media?: { type: 'image' | 'sticker', mimeType: string, data: string }
): Promise<string> {
   const oldMessages = loadMessages(number);
   if (name) instructions.push(`The user's name is ${name}. Respond in a friendly and professional manner.`);

   const history = oldMessages.flatMap(msg => [
      { role: "user", parts: [{ text: msg.text } as Part] },
      { role: "model", parts: [{ text: msg.reply } as Part] }
   ]);

   const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash", // Switch to 1.5-flash for higher quota
      systemInstruction: instructions.join('\n\n')
   });

   const chat = model.startChat({ history });

   // Prepare message parts
   const parts: Part[] = [{ text: userMessage }];
   
   // Add media if provided
   if (media) {
      parts.push({
         inlineData: {
            mimeType: media.mimeType,
            data: media.data
         }
      });
   }

   try {
      const result = await chat.sendMessage(parts);
      return result.response.text();
   } catch (error: any) {
      console.error('❌ Gemini API Error:', error);
      
      // Handle quota exhaustion specifically
      if (error.status === 429) {
         return "I've reached my daily limit for AI responses! 😅 This happens when I get too popular. Try again tomorrow or contact my creator for an upgrade! 🚀";
      }
      
      // Handle other API errors
      if (error.status === 401) {
         return "Authentication issue with my AI brain! 🤖 Please contact the developer.";
      }
      
      if (error.status === 403) {
         return "Access denied to my AI services! 🚫 Please contact the developer.";
      }
      
      // Generic fallback
      return "Sorry, I'm having technical difficulties right now! 🛠️ Try again in a few minutes.";
   }
}
