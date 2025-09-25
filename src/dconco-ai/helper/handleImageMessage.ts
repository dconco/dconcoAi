import chatWithUser from "@/bot";
import { handleMessages } from "@/dconco-ai/helper/handleMessages";
import { cacheGroupMessage } from "@/utils/quotaChecker";
import { Client, Message } from "whatsapp-web.js";

export default async function handleImageMessage(message: Message, client: Client, context: 'group' | 'private' | 'status') {
   const time = new Date();
   const chat = await message.getChat();

   await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500)); // Wait 0.5-1.5 seconds
   chat.sendSeen();
   
   try {
      const contact =  message.author || await message.getContact() as any;
      const name = contact?.name || contact?.pushname || contact || 'User';
      const chatName = chat.name || contact?.name || contact?.pushname || contact || 'Chat';
      
      const media = await message.downloadMedia();
      if (!media) {
         message.reply("Failed to download image");
         return;
      }
      
      
      const contextMessage = message.body || "What's in this image?";

      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000)); // Mark as seen after 1-3 seconds
      chat.sendStateTyping();

      const reply = await chatWithUser(
         message.from, 
         contextMessage, 
         {
            type: 'image',
            mimeType: media.mimetype,
            data: media.data
         },
         context,
         chatName,
         name,
         message
      );

      setTimeout(async () => {
         const response = await handleMessages(reply || '', message, client);

         if (response) {
            if (context === 'group' || context === 'private')
               cacheGroupMessage({ groupId: chat.id._serialized, user: name || '', name: chatName, text: contextMessage, reply: response, time });
         }
      }, Math.random() * 1000 + 4000); // Simulate typing delay of 4-5 seconds
   } catch (error) {
      message.reply("Error processing image");
   } finally {
      chat.clearState();
   }
}