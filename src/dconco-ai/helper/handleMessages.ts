import { ImageGenerationRequestResponse, isImageGenerationRequest } from "@/bot/utils/imageGenerationRequest";
import { isReactionRequest, ReactionRequestResponse } from "@/bot/utils/reactionRequest";
import { Client, Message, MessageMedia } from "whatsapp-web.js";
import { style } from "@/dconco-ai";

export const handleMessages = async (reply: string, message: Message, client: Client): Promise<string | null> => {
   const imageReq: ImageGenerationRequestResponse = isImageGenerationRequest(reply);
   const reaction: ReactionRequestResponse = isReactionRequest(reply);
   const myNumber = client.info.wid._serialized;
   const chat = await message.getContact();
   const from = chat.id.user;

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
         const media = await MessageMedia.fromUrl(imageUrl);
         const result = await message.reply(media, undefined, { caption: style(imageReq.caption || "Here's the image you requested! 📸") });
         if (result) return imageReq.caption || "Here's the image you requested! 📸";
      } catch (error) {
         await message.reply(style("❌ Failed to generate or send image. Please try again later."));
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