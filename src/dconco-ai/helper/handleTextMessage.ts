import chatWithUser from "@/bot";
import { handleMessages } from "@/dconco-ai/helper/handleMessages";
import { loadCachedGroupMessages } from '@/utils/loadCaches';
import { cacheGroupMessage } from "@/utils/quotaChecker";
import { Client, Message } from "whatsapp-web.js";

export default async function handleTextMessage(message: Message, client: Client, context: 'group' | 'private' | 'status') {
   const time = new Date();
   const chat = await message.getChat();
   const contact =  message.author || await message.getContact() as any;

   const textMessage = message.body;
   const chatId = chat.id._serialized;
   const name = contact?.name || contact?.pushname || contact || 'User';
   const chatName = chat.name || contact?.name || contact?.pushname || contact || 'Chat';

   // --- New: If group/private, use cached group/private messages and check last 3 timestamps ---
   if (context === 'group' || context === 'private') {
      try {
         const cached = loadCachedGroupMessages();
         const group = cached[chatId];
         
         if (group && group.messages && group.messages.length >= 2) {
            const lastThree = group.messages.slice(-3).map(m => m.timestamp).filter(Boolean) as string[];
            
            if (lastThree.length === 2) {
               const now = Date.now();
               const allWithinTwoMinutes = lastThree.every(ts => (now - new Date(ts).getTime()) <= 2 * 60 * 1000);
               if (allWithinTwoMinutes) {
                  // don't reply when last 3 messages are within 2 minutes
                  return;
               }
            }
         }
      } catch (err) {
         console.error('Error checking cached group messages:', err);
         // If error reading cache, continue to process normally
      }
   }

   await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000)); // Mark as seen after 1-3 seconds
   chat.sendSeen();
   await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500)); // Wait 0.5-1.5 seconds
   chat.sendStateTyping();

   try {
      setTimeout(async () => {
         // Pass the message object as the last parameter for accessing chat history in private chats
         const reply = await chatWithUser(chatId, textMessage, undefined, context, chatName, name, message);
         const response = await handleMessages(reply || '', message, client);

         if (response) {
            if (context === 'group' || context === 'private')
               cacheGroupMessage({ groupId: chatId, user: name || '', name: chatName, text: textMessage, reply: response, time });
         }
      }, Math.random() * 1000 + 4000); // Simulate typing delay of  seconds
   } catch (error) {
      console.error('Error replying to message:', error);
   } finally {
      chat.clearState();
   }
};