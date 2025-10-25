import { getCurrentModel, recordModelUsage, handleQuotaExhausted } from "@/utils/modelFallback";
import { getMessageHistory, getGroupMessageHistory } from "@/services/messageService";
import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import instructions from "@/bot/training";
import { config } from "dotenv";

config();

export default async function chatWithUser(
   number: string, 
   userMessage: string, 
   media?: { type: 'image' | 'sticker', mimeType: string, data: string },
   context?: 'group' | 'private' | 'status',
   chatName?: string,
   author?: string,
): Promise<string> {
   let API_KEY: string | undefined;

   // Get messages from MongoDB
   let oldMessages: { text: string; reply?: string; user?: string }[] = [];

   if (context === 'group') {
      API_KEY = process.env.GEMINI_API_KEY_GROUP;
      instructions.push("YOU ARE IN GROUP CHAT, so keep your responses straight to the point accoring to the previous messages.\nAVOID ASKING QUESTIONS LIKE 'How can I help you'?\nYou are in a group chat, not to help anybody!");

      // Get history from database
      oldMessages = await getGroupMessageHistory(number);

      oldMessages = oldMessages.map(groupMsg => ({
         ...groupMsg,
         text: `[${chatName}] ${author ? author + ': ' : ''}${groupMsg.text}`
      }));
   }

   else if (context === 'private') {
      API_KEY = process.env.GEMINI_API_KEY_PRIVATE;
      instructions.push("YOU ARE IN PRIVATE CHAT.");
      
      // Get history from database
      oldMessages = await getGroupMessageHistory(number);

      oldMessages = oldMessages.map(groupMsg => ({
         ...groupMsg,
         text: `[${author ? author + ':' : ''}] ${groupMsg.text}`
      }));
   }

   else if (context === 'status') {
      API_KEY = process.env.GEMINI_API_KEY_STATUS;
      instructions.push("You are responding to a status update, so keep your message short and relevant to the status.");
   }
   
   else {
      API_KEY = process.env.GEMINI_API_KEY;
      instructions.push("YOU ARE IN PRIVATE CHAT");

      oldMessages = await getMessageHistory(number);
   }

   const genAI = new GoogleGenerativeAI(API_KEY || "");

   const history = oldMessages.flatMap(msg => [
      { role: "user", parts: [{ text: msg.text } as Part] },
      { role: "model", parts: [{ text: msg.reply || "Ok" } as Part] }
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
               console.log("I'm having technical difficulties right now! 🛠️ Try again in a few minutes.");
               return "";
            }
         } else {
            console.log("I'm experiencing technical difficulties! 🛠️ Please try again in a moment.");
            return "";
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
      console.log("Sorry, I'm having technical difficulties right now! 🛠️ Try again in a few minutes.");
      return "";
   }
}
