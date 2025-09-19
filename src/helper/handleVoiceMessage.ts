import WhatsAppService from "@/utils/whatsappService";
import chatWithUser from "@/bot";
import { handleMessages } from "./handleMessages";

export default async function handleVoiceMessage(
	from: string,
	audio: any,
	messageId: string
): Promise<string | null> {
	try {
		const whatsapp = new WhatsAppService();
		
		// Download the voice note
		const audioBuffer = await whatsapp.getMediaBuffer(audio.id);
		
		if (!audioBuffer) {
			console.error('Failed to download voice note');
			return "I heard you sent a voice note! 🎤 But I'm having trouble downloading it right now. 😅 Can you try sending it again or just type your message?";
		}

		// Convert to base64
		const base64Audio = audioBuffer.toString('base64');
		
		// Create a context message for the bot
		const contextMessage = `[VOICE_NOTE_RECEIVED] User sent a voice note. I cannot process audio yet, so respond that you received their voice note but ask them to type their message instead. Audio details: mime_type: ${audio.mime_type}`;
		
		// Send to bot (Gemini doesn't support audio yet, so we'll just acknowledge it)
		const reply = await chatWithUser(from, contextMessage);

		const response = await handleMessages(from, reply || '', messageId);
		return response;
	} catch (error) {
		console.error('Error handling voice note:', error);
		return "I see you sent a voice note! 🎤 But I can't process audio messages yet. Can you type your message instead? 😉";
	}
}