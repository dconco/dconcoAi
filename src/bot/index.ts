import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import { CachedMessageData } from "@/types/cache";
import { config } from "dotenv";
import instructions from "./training";
import path from "path";
import fs from "fs";
import { getCurrentModel, recordModelUsage, handleQuotaExhausted } from "@/utils/modelFallback";

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

   // Get current active model
   let currentModel = getCurrentModel();
   console.log(`🤖 Using model: ${currentModel}`);

   const model = genAI.getGenerativeModel({
      model: currentModel,
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
      
      // Record successful usage
      recordModelUsage(currentModel);
      
      return result.response.text();
   } catch (error: any) {
      console.error('❌ Gemini API Error:', error);
      
      // Handle quota exhaustion specifically
      if (error.status === 429) {
         console.log(`🔄 Quota exhausted for ${currentModel}, trying fallback...`);
         
         // Switch to fallback model and retry once
         const fallbackModel = handleQuotaExhausted(currentModel);
         
         if (fallbackModel !== currentModel) {
            try {
               console.log(`🔄 Retrying with fallback model: ${fallbackModel}`);
               const fallbackModelInstance = genAI.getGenerativeModel({
                  model: fallbackModel,
                  systemInstruction: instructions.join('\n\n')
               });
               
               const fallbackChat = fallbackModelInstance.startChat({ history });
               const result = await fallbackChat.sendMessage(parts);
               
               // Record successful usage
               recordModelUsage(fallbackModel);
               
               return result.response.text();
            } catch (fallbackError: any) {
               console.error('❌ Fallback model also failed:', fallbackError);
               
               // If fallback also fails with 429, try another fallback
               if (fallbackError.status === 429) {
                  const secondFallback = handleQuotaExhausted(fallbackModel);
                  if (secondFallback !== fallbackModel) {
                     console.log(`🔄 Trying second fallback: ${secondFallback}`);
                     try {
                        const secondFallbackInstance = genAI.getGenerativeModel({
                           model: secondFallback,
                           systemInstruction: instructions.join('\n\n')
                        });
                        const secondFallbackChat = secondFallbackInstance.startChat({ history });
                        const result = await secondFallbackChat.sendMessage(parts);
                        recordModelUsage(secondFallback);
                        return result.response.text();
                     } catch (finalError: any) {
                        console.error('❌ All fallbacks failed:', finalError);
                        return "I'm experiencing technical difficulties with my AI models! 🛠️ Please try again in a moment.";
                     }
                  }
               }
               return "I'm having technical difficulties right now! 🛠️ Try again in a few minutes.";
            }
         } else {
            return "I'm experiencing technical difficulties! �️ Please try again in a moment.";
         }
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
