import WhatsAppService from "@/utils/whatsappService";
import chatWithUser from "@/bot";

export default async function handleReactionMessage(
	from: string,
	reaction: any,
	_messageId: string,
	name?: string
): Promise<string | null> {
	try {
		const emoji = reaction.emoji;
		const reactedToMessageId = reaction.message_id;
		
		// Create a context message for the bot
		const contextMessage = `[REACTION_RECEIVED] User reacted with ${emoji} emoji to message ID: ${reactedToMessageId}. Respond to this reaction appropriately and acknowledge the emoji they used.`;
		
		// Send to bot
		const reply = await chatWithUser(name, from, contextMessage);

		return reply;
	} catch (error) {
		console.error('Error handling reaction:', error);
		return `Thanks for the reaction! ${reaction.emoji || '😊'} I appreciate the feedback! 🚀`;
	}
}