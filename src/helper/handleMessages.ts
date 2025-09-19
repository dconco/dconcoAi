import { ImageGenerationRequestResponse, isImageGenerationRequest } from "@/bot/utils/imageGenerationRequest";
import { isReactionRequest, ReactionRequestResponse } from "@/bot/utils/reactionRequest";
import WhatsAppService from "@/utils/whatsappService";

export const handleMessages = async (from: string, reply: string, messageId: string): Promise<string | null> => {
   const imageReq: ImageGenerationRequestResponse = isImageGenerationRequest(reply);
   const reaction: ReactionRequestResponse = isReactionRequest(reply);
   const whatsapp: WhatsAppService = new WhatsAppService();
   const ownerNumber = process.env.OWNER_WHATSAPP_NUMBER;

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
      console.log("Generated Image URL:", imageUrl);

      if (imageReq.message_owner) {
         const message = `Contact From: ${from}\n\n${imageReq.message_owner}`;

         if (ownerNumber) {
            whatsapp.sendTextMessage(ownerNumber, message, null);
         }
      }

      try {
         const result = await whatsapp.sendImage(from, imageUrl, imageReq.caption, messageId);
         if (result) return imageReq.caption || "Here's the image you requested! 📸";
      } catch (error) {
         console.error("Error sending image:", error);
         await whatsapp.sendTextMessage(from, "❌ Failed to generate or send image. Please try again later.", messageId);
         return null;
      }
      
   } else if (reaction.isReactionRequest && reaction.emoji) {
      await whatsapp.reactToMessage(from, messageId, reaction.emoji);

      if (reaction.message_owner) {
         const message = `Contact From: ${from}\n\n${reaction.message_owner}`;

         if (ownerNumber) {
            await whatsapp.sendTextMessage(ownerNumber, message, null);
         }
      }

      if (reaction.message && reaction.message.trim().length > 0) {
         const result = await whatsapp.sendTextMessage(from, reaction.message, messageId);
         if (result) return reaction.message;
      }
   } else {
		const result = await whatsapp.sendTextMessage(from, reply, messageId);
		if (result) return reply;
   }

   return null;
}