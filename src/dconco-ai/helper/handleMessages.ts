import { ImageGenerationRequestResponse, isImageGenerationRequest } from "@/bot/utils/imageGenerationRequest";
import { isReactionRequest, ReactionRequestResponse } from "@/bot/utils/reactionRequest";
import { Client, Message, MessageMedia } from "whatsapp-web.js";
import { style } from "@/dconco-ai";

export const handleMessages = async (reply: string, message: Message, client: Client): Promise<string | null> => {
   const imageReq: ImageGenerationRequestResponse = isImageGenerationRequest(reply);
   const reaction: ReactionRequestResponse = isReactionRequest(reply);
   let myNumber: string;
   let from: string | undefined;

   if (reply === '') return null;

   // Check if this message has already been replied to
   const messages = await client.getChats();

   messages.forEach(async (chat) => {
      const chatMessages = await chat.fetchMessages({ limit: 5 });

      chatMessages.forEach(async (msg) => {
         const quotedMsg = await msg.getQuotedMessage();
   
         if (quotedMsg && quotedMsg.fromMe) {
            // Message has already been replied to by the bot
            from = undefined;
         }
      });
   });

   if (from === undefined) return null;

   try {
      const chat = await message.getContact() || await message.getChat();
      myNumber = client.info.wid._serialized;
      from = chat.id.user || chat.id._serialized;
   } catch (error) {
      from = message.from;
      myNumber = '120363401596625361@g.us';
   }

   if (imageReq.isImageRequest && imageReq.prompt) {
      let imageUrl;
      // Sanitize the prompt to remove problematic characters before encoding
      const sanitizedPrompt = imageReq.prompt.replace(/[\"\\]/g, '');
      const encodedPrompt = encodeURIComponent(sanitizedPrompt);

      if (imageReq.prompt === "my_picture") {
         const myPics = [
            'https://raw.githubusercontent.com/dconco/dconco/main/profile1.png',
            'https://raw.githubusercontent.com/dconco/dconco/main/profile2.png',
            'https://raw.githubusercontent.com/dconco/dconco/main/profile3.png',
            'https://raw.githubusercontent.com/dconco/dconco/main/profile4.png',
         ];
         imageUrl = myPics[Math.floor(Math.random() * myPics.length)];
      } else {
         imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;
      }

      if (imageReq.message_owner) {
         const text = `Contact From: ${from}\n\n${imageReq.message_owner}`;
         client.sendMessage(myNumber, style(text));
      }

      try {
         // Test the URL first
         const response = await fetch(imageUrl);
         if (!response.ok) {
            throw new Error(`Image URL returned ${response.status}: ${response.statusText}`);
         }
         
         const media = await MessageMedia.fromUrl(imageUrl, { unsafeMime: true });
         const result = await message.reply(media, undefined, { caption: style(imageReq.caption || "Here's the image you requested! 📸") });
         if (result) return imageReq.caption || "Here's the image you requested! 📸";
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Unknown error';
         await message.reply(style(`❌ Failed to generate image. Error: ${errorMessage}`));
         return null;
      }
   }
   
   else if (reaction.isReactionRequest && reaction.emoji) {
      await message.react(reaction.emoji);

      if (reaction.message_owner) {
         const text = `Contact From: ${from}\n\n${reaction.message_owner}`;
         client.sendMessage(myNumber, style(text));
      }

      if (reaction.message && reaction.message.trim().length > 0) {
         const result = await message.reply(style(reaction.message));
         if (result) return reaction.message;
      }
   } else {
      const result = await message.reply(style(reply));
      if (result) return reply;
   }

   return null;
}