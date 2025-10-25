import chatWithUser from "@/bot";
import { handleMessages } from "@/dconco-ai/helper/handleMessages";
import { loadCachedGroupMessages } from "@/utils/loadCaches";
import { cacheGroupMessage } from "@/utils/quotaChecker";
import { Client, Message } from "whatsapp-web.js";

export default async function handleStickerMessage(message: Message, client: Client, context: 'group' | 'private' | 'status') {
   const time = new Date();
   const chat = await message.getChat();

   await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500)); // Wait 0.5-1.5 seconds
   chat.sendSeen();

   try {
      const contact =  message.author || await message.getContact() as any;
      const name = contact?.name || contact?.pushname || contact || 'User';
      const chatName = chat.name || contact?.name || contact?.pushname || contact || 'Chat';

      // --- New: If group/private, use cached group/private messages and check last 3 timestamps ---
      try {
         const cached = loadCachedGroupMessages();
         const group = cached[chat.id._serialized];
         
         if (group && group.messages && group.messages.length >= 2) {
            const lastThree = group.messages.slice(-3).map(m => m.timestamp).filter(Boolean) as string[];

            if (lastThree.length === 2) {
               const allWithinTwoMinutes = lastThree.every(ts => (time.getTime() - new Date(ts).getTime()) <= 2 * 60 * 1000);
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

      const media = await message.downloadMedia();
      if (!media) {
         message.reply("Failed to download sticker");
         return;
      }

      const contextMessage = "What's in this sticker?";

      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 1000)); // Mark as seen after 1-2 seconds
      chat.sendStateTyping();

      const reply = await chatWithUser(
         message.from, 
         contextMessage, 
         {
            type: 'sticker',
            mimeType: media.mimetype,
            data: media.data
         },
         context,
         chatName,
         name,
         message
      );

      const response = await handleMessages(reply || '', message, client);

      if (response) {
         if (context === 'group' || context === 'private')
            cacheGroupMessage({ groupId: chat.id._serialized, user: name || '', name: chatName, text: contextMessage, reply: response, time });
      }
   } catch (error) {
      message.reply("Error processing sticker");
   } finally {
      chat.clearState();
   }
}