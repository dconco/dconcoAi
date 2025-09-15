import { Request, Response } from 'express';
import handleTextMessage from '@/helper/handleTextMessage';
import handleInteractiveMessage from '@/helper/handleInteractiveMessage';
import { WhatsAppMessage, WhatsAppWebhook } from '@/types';
import { cacheMessage, checkQuota, saveUsers } from '@/utils/quotaChecker';

export default async function MessagesController(req: Request, res: Response): Promise<void> {
	const body: WhatsAppWebhook = req.body;

	try {
		if (body.object === 'whatsapp_business_account') {
			body.entry?.forEach(entry => {
				entry.changes?.forEach(change => {
					if (change.field === 'messages') {
						const messages = change.value.messages;
						const contacts = change.value.contacts;

						messages?.forEach(async (message: WhatsAppMessage) => {
							const contact = contacts?.find(c => c.wa_id === message.from);
							const name = contact?.profile?.name;

							await sendMessage(name, message);
						});
					}
				});
			});
		}

		res.status(200).send('OK');
	} catch (error) {
		console.error('Webhook error:', error);
		res.status(500).send('Internal Server Error');
	}
}

export const sendMessage = async (name: string | undefined, message: WhatsAppMessage): Promise<any> => {
	console.log(
		`Message from ${name} (${message.from}): ${
			message.text?.body || 'Non-text message'
		}`
	);

	if (!checkQuota(message, name)) return;
	await new Promise(resolve => setTimeout(resolve, 3000)); // wait 3s

	// Handle different message types
	if (message.type === 'text' && message.text) {
		const reply = await handleTextMessage(message.from, message.text.body, message.id, name);

		if (reply) {
			cacheMessage({ contact: message.from, text: message.text.body, name: name || '', reply, messageId: message.id });
			saveUsers({ contact: message.from, name });
		}
	} else if (message.type === 'interactive' && message.interactive) {
		const reply: any = await handleInteractiveMessage(
			message.from,
			message.interactive,
			message.id,
			name
		);

		if (reply) {
			const text = 'Replied to option/id: ' + (reply.option || '') + ' on title: ' + (reply.title || '')
			cacheMessage({ contact: message.from, text, reply: reply.message, name: name || '', messageId: message.id });
			saveUsers({ contact: message.from, name });
		}
	}
}