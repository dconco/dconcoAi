import chatWithUser from "@/bot";
import { handleMessages } from "@/helper/handleMessages";

export default async function handleReactionMessage(
	from: string,
	reaction: any,
	messageId: string
): Promise<string | null> {
	try {
		const emoji = reaction.emoji;
		const reactedToMessageId = reaction.message_id;
		
		// Create a context message for the bot
		const contextMessage = `[REACTION_RECEIVED] User reacted with ${emoji} emoji to message ID: ${reactedToMessageId}. Respond to this reaction appropriately and acknowledge the emoji they used.`;
		
		// Send to bot
		const reply = await chatWithUser(from, contextMessage);
		
		const response = await handleMessages(from, reply || '', messageId);
		return response;
	} catch (error) {
		console.error('Error handling reaction:', error);
		return `Thanks for the reaction! ${reaction.emoji || '😊'} I appreciate the feedback! 🚀`;
	}
}