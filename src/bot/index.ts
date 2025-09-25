import { getCurrentModel, recordModelUsage, handleQuotaExhausted } from "@/utils/modelFallback";
import { loadCachedGroupMessages, loadCachedMessages } from "@/utils/loadCaches";
import { CachedGroupMessageData, CachedMessageData } from "@/types/cache";
import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import { getMessageHistory } from "@/services/messageService";
import instructions from "@/bot/training";
import { config } from "dotenv";
import { Message } from "whatsapp-web.js";

config();

function loadMessages(number: string): CachedMessageData[string]["messages"] {
   const data: CachedMessageData = loadCachedMessages();
   
   if (data[number]?.messages.length > 30) {
      // Keep only the last 30 messages
      data[number].messages = data[number].messages.slice(-30);
   }
   return data[number]?.messages || [];
}

function loadGroupMessages(groupId: string): CachedGroupMessageData[string]["messages"] {
   const data: CachedGroupMessageData = loadCachedGroupMessages();

   if (data[groupId]?.messages.length > 30) {
      // Keep only the last 30 messages
      data[groupId].messages = data[groupId].messages.slice(-30);
   }
   return data[groupId]?.messages || [];
}

export default async function chatWithUser(
   number: string, 
   userMessage: string, 
   media?: { type: 'image' | 'sticker', mimeType: string, data: string },
   context?: 'group' | 'private' | 'status',
   chatName?: string,
   author?: string,
   message?: Message, // WhatsApp Message object for accessing chat history
): Promise<string> {
   let API_KEY: string | undefined;
   
   // Try to get messages from MongoDB first, fallback to JSON
   let oldMessages: CachedMessageData[string]["messages"] | CachedGroupMessageData[string]["messages"] = [];

   if (context === 'group') {
      API_KEY = process.env.GEMINI_API_KEY_GROUP;
      instructions.push("YOU ARE IN GROUP CHAT, so keep your responses straight to the point accoring to the previous messages.\nAVOID ASKING QUESTIONS LIKE 'How can I help you'?\nYou are in a group chat, not to help anybody!");

      // If message object is provided, fetch history from WhatsApp Web
      if (message) {
         try {
            const chat = await message.getChat();
            const historyMessages = await chat.fetchMessages({ limit: 30 });

            // Process messages into oldMessages format
            const processedMsgs: {text: string; reply?: string}[] = [];
            for (let i = 0; i < historyMessages.length; i++) {
               const msg = historyMessages[i];
               
               if (msg.body || msg.hasMedia) {
                  const contact = msg.author || msg.from;
                  const msgAuthor = msg.fromMe ? 'Bot' : contact;
                  
                  // Check if this is a user message OR a bot message that starts with !
                  const isUserMessage = !msg.fromMe || (msg.fromMe && msg.body?.startsWith('!'));
                  
                  if (isUserMessage) {
                     let messageText = `[${chatName}] ${msgAuthor}: `;
                     
                     if (msg.hasMedia) {
                        messageText += msg.body ? `[Image: ${msg.body}]` : '[Image]';
                     } else {
                        messageText += msg.body || '[Media]';
                     }
                     
                     const userMsg: {text: string; reply?: string} = { 
                        text: messageText
                     };
                     
                     // Look for the next message as a potential reply
                     if (i + 1 < historyMessages.length) {
                        const nextMsg = historyMessages[i + 1];
                        // If next message is from bot and doesn't start with !, treat it as reply
                        if (nextMsg.fromMe && nextMsg.body && !nextMsg.body.startsWith('!')) {
                           userMsg.reply = nextMsg.body;
                           i++; // Skip the next message since we've used it as a reply
                        }
                     }
                     processedMsgs.push(userMsg);
                  }
               }
            }
            oldMessages = processedMsgs;
         } catch (err) {
            console.log('Failed to get WhatsApp Web history, falling back to cache');
            oldMessages = loadGroupMessages(number);
         }
      } else {
         // Fallback to cached messages if no message object
         oldMessages = loadGroupMessages(number);
      }

      oldMessages.map(groupMsg => {
         groupMsg.text = `[${chatName}] ${author ? author + ': ' : ''}${groupMsg.text}`;
         return groupMsg;
      });
   }

   else if (context === 'private') {
      API_KEY = process.env.GEMINI_API_KEY_PRIVATE;
      instructions.push("YOU ARE IN PRIVATE CHAT.");
      
      // If message object is provided, fetch history from WhatsApp Web
      if (message) {
         try {
            const chat = await message.getChat();
            const historyMessages = await chat.fetchMessages({ limit: 30 });
            
            // Process messages into oldMessages format
            const processedMsgs: {text: string; reply?: string}[] = [];
            for (let i = 0; i < historyMessages.length; i++) {
               const msg = historyMessages[i];
               
               if (msg.body || msg.hasMedia) {
                  const contact = await msg.getContact();
                  const msgAuthor = msg.fromMe ? 'Bot' : (contact.name || contact.pushname || 'User');
                  
                  // Check if this is a user message OR a bot message that starts with !
                  const isUserMessage = !msg.fromMe || (msg.fromMe && msg.body?.startsWith('!'));
                  
                  if (isUserMessage) {
                     let messageText = `[${msgAuthor}] `;
                     
                     if (msg.hasMedia) {
                        messageText += msg.body ? `[Image: ${msg.body}]` : '[Image]';
                     } else {
                        messageText += msg.body || '[Media]';
                     }
                     
                     const userMsg: {text: string; reply?: string} = { 
                        text: messageText
                     };
                     
                     // Look for the next message as a potential reply
                     if (i + 1 < historyMessages.length) {
                        const nextMsg = historyMessages[i + 1];
                        // If next message is from bot and doesn't start with !, treat it as reply
                        if (nextMsg.fromMe && nextMsg.body && !nextMsg.body.startsWith('!')) {
                           userMsg.reply = nextMsg.body;
                           i++; // Skip the next message since we've used it as a reply
                        }
                     }
                     processedMsgs.push(userMsg);
                  }
               }
            }
            oldMessages = processedMsgs;
         } catch (err) {
            console.log('Failed to get WhatsApp Web history, falling back to cache');
            oldMessages = loadGroupMessages(number); // Use private message cache as fallback
         }
      } else {
         // Fallback to cached messages if no message object
         oldMessages = loadGroupMessages(number);
      }

      oldMessages.map(groupMsg => {
         groupMsg.text = `[${author ? author + ':' : ''}] ${groupMsg.text}`;
         return groupMsg;
      });
   }

   else if (context === 'status') {
      API_KEY = process.env.GEMINI_API_KEY_STATUS;
      instructions.push("You are responding to a status update, so keep your message short and relevant to the status.");
   }
   
   else {
      API_KEY = process.env.GEMINI_API_KEY;
      instructions.push("YOU ARE IN PRIVATE CHAT");

      try {
         const dbMessages = await getMessageHistory(number);
         oldMessages = dbMessages;
      } catch (error) {
         console.log('Using JSON fallback for messages');
         oldMessages = loadMessages(number);
      }
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
