import WhatsAppService from "@/utils/whatsappService";
import chatWithUser from "@/bot";
import { handleMessages } from "./handleMessages";

export default async function handleImageMessage(
	from: string,
	image: any,
	messageId: string,
	name?: string
): Promise<string | null> {
	try {
		const whatsapp = new WhatsAppService();
		
		// Download the image
		const imageBuffer = await whatsapp.getMediaBuffer(image.id);
		
		if (!imageBuffer) {
			console.error('Failed to download image');
			return "I see you sent an image! 📸 But I'm having trouble downloading it right now. 😅 Can you try sending it again?";
		}

		// Convert to base64
		const base64Image = imageBuffer.toString('base64');
		
		// Create a context message for the bot
		const contextMessage = `[IMAGE_RECEIVED] User sent an image. Analyze this image and respond appropriately. Image details: mime_type: ${image.mime_type}, caption: "${image.caption || 'No caption'}"`;
		
		// Send to bot with image
		const reply = await chatWithUser(name, from, contextMessage, {
			type: 'image',
			mimeType: image.mime_type,
			data: base64Image
		});

		const response = await handleMessages(from, reply || '', messageId, name);
		return response;
	} catch (error) {
		console.error('Error handling image:', error);
		return "I see you sent an image! 📸 But I'm having trouble processing it right now. Feel free to describe it to me instead! 😉";
	}
}