import { Request, Response } from 'express';
import handleTextMessage from '@/helper/handleTextMessage';
import handleInteractiveMessage from '@/helper/handleInteractiveMessage';
import { WhatsAppMessage, WhatsAppWebhook } from '@/types';
import { checkQuota } from '@/utils/quotaChecker';

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
	await new Promise(resolve => setTimeout(resolve, 2000)); // wait 2s

	// Handle different message types
	if (message.type === 'text' && message.text) {
		await handleTextMessage(message.from, message.text.body, message.id, name);
	} else if (message.type === 'interactive' && message.interactive) {
		await handleInteractiveMessage(
			message.from,
			message.interactive,
			message.id,
			name
		);
	}
}