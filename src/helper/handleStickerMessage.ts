import WhatsAppService from "@/utils/whatsappService";
import chatWithUser from "@/bot";
import { handleMessages } from "./handleMessages";

export default async function handleStickerMessage(
	from: string,
	sticker: any,
	messageId: string,
	name?: string
): Promise<string | null> {
	try {
		const whatsapp = new WhatsAppService();
		
		// Download the sticker
		const stickerBuffer = await whatsapp.getMediaBuffer(sticker.id);
		
		if (!stickerBuffer) {
			console.error('Failed to download sticker');
			return "I see you sent a sticker! ✨ But I'm having trouble downloading it right now. 😅 Can you try sending it again?";
		}

		// Convert to base64
		const base64Sticker = stickerBuffer.toString('base64');
		
		// Create a context message for the bot
		const contextMessage = `[STICKER_RECEIVED] User sent a sticker. Analyze this sticker and respond appropriately. Sticker details: mime_type: ${sticker.mime_type}, animated: ${sticker.animated || false}`;
		
		// Send to bot with sticker
		const reply = await chatWithUser(name, from, contextMessage, {
			type: 'sticker',
			mimeType: sticker.mime_type,
			data: base64Sticker
		});

		const response = await handleMessages(from, reply || '', messageId, name);
		return response;
	} catch (error) {
		console.error('Error handling sticker:', error);
		return "I see you sent a sticker! ✨ But I don't currently have the ability to process it right now. Text is my thing for the moment! 🚀";
	}
}