import { Request, Response } from 'express';
import WhatsappService from '../utils/whatsappService';
import handleTextMessage from '../helper/handleTextMessage';
import handleInteractiveMessage from '../helper/handleInteractiveMessage';
import { WhatsAppMessage, WhatsAppWebhook } from '../types/index';
import { cacheMessage, checkQuota } from '@/utils/quotaChecker';

export default async function MessagesController(req: Request, res: Response): Promise<void> {
	const whatsapp: WhatsappService = new WhatsappService();
	const body: WhatsAppWebhook = req.body;

	try {
		if (body.object === 'whatsapp_business_account') {
			body.entry?.forEach(entry => {
				entry.changes?.forEach(change => {
					if (change.field === 'messages') {
						const messages = change.value.messages;
						const contacts = change.value.contacts;

						messages?.forEach(async (message: WhatsAppMessage) => {
							const from = message.from;
							const messageId = message.id;
							const contact = contacts?.find(c => c.wa_id === from);
							const name = contact?.profile?.name;

							console.log(
								`Message from ${name} (${from}): ${
									message.text?.body || 'Non-text message'
								}`
							);

							checkQuota(message, name);

							// Handle different message types
							if (message.type === 'text' && message.text) {
								await handleTextMessage(from, message.text.body, name);
							} else if (message.type === 'interactive' && message.interactive) {
								await handleInteractiveMessage(
									from,
									message.interactive,
									name
								);
							}
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
