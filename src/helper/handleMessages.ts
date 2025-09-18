import { ImageGenerationRequestResponse, isImageGenerationRequest } from "@/bot/utils/imageGenerationRequest";
import { isReactionRequest, ReactionRequestResponse } from "@/bot/utils/reactionRequest";
import WhatsAppService from "@/utils/whatsappService";

export const handleMessages = async (from: string, reply: string, messageId: string, _name?: string): Promise<string | null> => {
   const whatsapp: WhatsAppService = new WhatsAppService();
   const imageReq: ImageGenerationRequestResponse = isImageGenerationRequest(reply);
   const reaction: ReactionRequestResponse = isReactionRequest(reply);
   const ownerNumber = process.env.OWNER_WHATSAPP_NUMBER;

   if (imageReq.isImageRequest && imageReq.prompt) {
      let imageUrl;
      const encodedPrompt = encodeURIComponent(imageReq.prompt);

      if (imageReq.prompt === "my_picture") {
         const myPics = [
            'https://raw.githubusercontent.com/dconco/dconco/main/profile1.png',
            'https://raw.githubusercontent.com/dconco/dconco/main/profile2.png',
            'https://raw.githubusercontent.com/dconco/dconco/main/profile3.png',
            'https://raw.githubusercontent.com/dconco/dconco/main/profile4.png',
         ];
         imageUrl = myPics[Math.floor(Math.random() * myPics.length)];
      } else {
         imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=-1&enhance=true`;
      }

      if (imageReq.message_owner) {
         const message = `Contact From: ${from}\n\n${imageReq.message_owner}`;

         if (ownerNumber) {
            whatsapp.sendTextMessage(ownerNumber, message, null);
         }
      }

      const result = await whatsapp.sendImage(from, imageUrl, imageReq.caption, messageId);
      if (result) return imageReq.caption || "Here's the image you requested! 📸";
   }
      
   else if (reaction.isReactionRequest && reaction.emoji) {
      await whatsapp.reactToMessage(from, messageId, reaction.emoji);

      if (reaction.message_owner) {
         const message = `Contact From: ${from}\n\n${reaction.message_owner}`;

         if (ownerNumber) {
            whatsapp.sendTextMessage(ownerNumber, message, null);
         }
      }

      if (reaction.message && reaction.message.trim().length > 0) {
         const result = await whatsapp.sendTextMessage(from, reaction.message, messageId);
         if (result) return reaction.message;
      }
   }

   else {
		const result = await whatsapp.sendTextMessage(from, reply, messageId);
		if (result) return reply;
   }

   return null;
}