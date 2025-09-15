import WhatsappService from '../utils/whatsappService';
import { cacheMessage } from '../utils/quotaChecker';
import { InteractiveMessage } from '../types/index';

// Handle interactive messages (buttons, lists)
export default async function handleInteractiveMessage(
	from: string,
	interactive: InteractiveMessage,
	messageId: string,
	name: string|undefined
): Promise<void> {
	const whatsapp = new WhatsappService();

	if (interactive.type === 'button_reply' && interactive.button_reply) {
		const buttonId = interactive.button_reply.id;

		switch (buttonId) {
			case 'option1':
				await whatsapp.sendTextMessage(
					from,
					'Here is some information about me...',
					messageId
				);
				break;
			case 'option2':
				await whatsapp.sendTextMessage(
					from,
					'You can contact me at: concodave@gmail.com or call +2349064772574',
					messageId
				);
				break;
			case 'option3':
				await whatsapp.sendTextMessage(
					from,
					'Type "menu" to see options or "list" to see our services.',
					messageId
				);
				break;
			default:
				await whatsapp.sendTextMessage(
					from,
					'Thanks for clicking the button!',
					messageId
				);
		}
	} else if (interactive.type === 'list_reply' && interactive.list_reply) {
		const listId = interactive.list_reply.id;
		const title = interactive.list_reply.title;

		const response = `You selected: ${title}. We'll get back to you about ${title} soon!`;

		const result = await whatsapp.sendTextMessage(from, response, messageId);
		if (result) cacheMessage({ contact: from, text: title, name: name || '', reply: response });
	}
}
