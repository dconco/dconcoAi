import WhatsappService from '@/utils/whatsappService';
import { InteractiveMessage } from '@/types/index';

// Handle interactive messages (buttons, lists)
export default async function handleInteractiveMessage(
	from: string,
	interactive: InteractiveMessage,
	messageId: string,
	_name: string | undefined
): Promise<object|void> {
	const whatsapp = new WhatsappService();

	if (interactive.type === 'button_reply' && interactive.button_reply) {
		const buttonId = interactive.button_reply.id;
		let reply;
		let option;

		switch (buttonId) {
			case 'option1':
				option = 'option1';
				reply = 'Here is some information about me...';
				await whatsapp.sendTextMessage(from, reply, messageId);
				break;
			case 'option2':
				option = 'option2';
				reply = 'You can contact me at: concodave@gmail.com or call +2349064772574';
				await whatsapp.sendTextMessage(from, reply, messageId);
				break;
			case 'option3':
				option = 'option3';
				reply = 'Type "menu" to see options or "list" to see our services.';
				await whatsapp.sendTextMessage(from, reply, messageId);
				break;
		}

		if (reply) return { title: interactive.button_reply.title, option: option, message: reply }
	}
	
	
	else if (interactive.type === 'list_reply' && interactive.list_reply) {
		const listId = interactive.list_reply.id;
		const title = interactive.list_reply.title;

		const response = `You selected: ${title}. We'll get back to you about ${title} soon!`;

		const result = await whatsapp.sendTextMessage(from, response, messageId);
		if (result) return { title: interactive.list_reply.title, option: listId, message: response }
	}
}
