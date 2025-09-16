import { Request, Response } from 'express';
import handleTextMessage from '@/helper/handleTextMessage';
import handleInteractiveMessage from '@/helper/handleInteractiveMessage';
import handleStickerMessage from '@/helper/handleStickerMessage';
import handleImageMessage from '@/helper/handleImageMessage';
import handleVoiceMessage from '@/helper/handleVoiceMessage';
import { WhatsAppMessage, WhatsAppWebhook } from '@/types';
import { cacheMessage, saveUsers } from '@/utils/quotaChecker';
import WhatsAppService from '@/utils/whatsappService';
import chatWithUser from '@/bot';

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
	const whatsapp: WhatsAppService = new WhatsAppService();

	// if (!(await checkQuota(message, name))) return;
	// await new Promise(resolve => setTimeout(resolve, 3000)); // wait 3s
   await whatsapp.markAsRead(message.id);

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
	} else if (message.type === 'sticker' && message.sticker) {
		const reply = await handleStickerMessage(message.from, message.sticker, message.id, name);

		if (reply) {
			await whatsapp.sendTextMessage(message.from, reply, message.id);
			cacheMessage({ contact: message.from, text: JSON.stringify(message), reply, name: name || '', messageId: message.id });
			saveUsers({ contact: message.from, name });
		}
	} else if (message.type === 'image' && message.image) {
		const reply = await handleImageMessage(message.from, message.image, message.id, name);

		if (reply) {
			await whatsapp.sendTextMessage(message.from, reply, message.id);
			cacheMessage({ contact: message.from, text: JSON.stringify(message), reply, name: name || '', messageId: message.id });
			saveUsers({ contact: message.from, name });
		}
	} else if (message.type === 'audio' && message.audio) {
		const reply = await handleVoiceMessage(message.from, message.audio, message.id, name);

		if (reply) {
			await whatsapp.sendTextMessage(message.from, reply, message.id);
			cacheMessage({ contact: message.from, text: JSON.stringify(message), reply, name: name || '', messageId: message.id });
			saveUsers({ contact: message.from, name });
		}
	} else {
		const reply = await chatWithUser(name, message.from, JSON.stringify(message));
		const response = await whatsapp.sendTextMessage(message.from, reply, message.id);

		if (response) {
			cacheMessage({ contact: message.from, text: JSON.stringify(message), reply, name: name || '', messageId: message.id });
			saveUsers({ contact: message.from, name });
		}
	}
}