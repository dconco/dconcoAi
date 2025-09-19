import {
	WhatsAppApiResponse,
	Button,
	ListSection
} from '@/types';

export default class WhatsAppService {
	private token: string;
	private phoneNumberId: string;
	private baseUrl: string;

	constructor() {
		this.token = process.env.WHATSAPP_TOKEN || '';
		this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
		this.baseUrl = `https://graph.facebook.com/v23.0/${this.phoneNumberId}/messages`;

		// Validate required environment variables
		if (!this.token || !this.phoneNumberId) {
			console.error('⚠️  Missing required WhatsApp environment variables:');
			if (!this.token) console.error('   - WHATSAPP_TOKEN is missing');
			if (!this.phoneNumberId) console.error('   - WHATSAPP_PHONE_NUMBER_ID is missing');
			console.error('   Please check your .env file');
		}
	}

	// Send a text message
	async sendTextMessage(to: string, message: string, messageId: string|null|undefined): Promise<WhatsAppApiResponse> {
		// saveQuota(to);

		const payload: any = {
			to,
			messaging_product: 'whatsapp',
			type: 'text',
			text: {
				body: message,
			},
		};
		if (messageId) payload.context = { message_id: messageId };

		try {
			const response = await fetch(this.baseUrl, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${this.token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					`HTTP ${response.status}: ${JSON.stringify(errorData)}`
				);
			}

			const data = await response.json() as WhatsAppApiResponse;

			return data;
		} catch (error) {
			console.error('Error sending message:', (error as Error).message);
			throw error;
		}
	}

	// Send image
	async sendImage(to: string, uri: string, caption: string = '', messageId?: string): Promise<WhatsAppApiResponse> {
		try {
			const payload: any = {
				to,
				messaging_product: 'whatsapp',
				type: 'image',
				image: {
					link: uri,
					caption: caption
				}
			};
			
			if (messageId) payload.context = { message_id: messageId };

			const response = await fetch(this.baseUrl, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${this.token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					`HTTP ${response.status}: ${JSON.stringify(errorData)}`
				);
			}

			const data = await response.json() as WhatsAppApiResponse;
			return data;
		} catch (error) {
			await this.sendTextMessage(to, "❌ Failed to send image. Please try again later.", messageId || undefined);
			console.error('Error sending base64 image:', (error as Error).message);
			throw error;
		}
	}

	// Send a message with buttons
	async sendButtonMessage(to: string, bodyText: string, buttons: Button[]): Promise<WhatsAppApiResponse> {
		// saveQuota(to);

		try {
			const response = await fetch(this.baseUrl, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${this.token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					to,
					messaging_product: 'whatsapp',
					type: 'interactive',
					interactive: {
						type: 'button',
						body: {
							text: bodyText,
						},
						action: {
							buttons: buttons.map((button, index) => ({
								type: 'reply',
								reply: {
									id: button.id || `btn_${index}`,
									title: button.title,
								},
							})),
						},
					},
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					`HTTP ${response.status}: ${JSON.stringify(errorData)}`
				);
			}

			const data = await response.json() as WhatsAppApiResponse;
			return data;
		} catch (error) {
			console.error('Error sending button message:', (error as Error).message);
			throw error;
		}
	}

	// Send a list message
	async sendListMessage(to: string, bodyText: string, buttonText: string, sections: ListSection[]): Promise<WhatsAppApiResponse> {
		// saveQuota(to);

		try {
			const response = await fetch(this.baseUrl, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${this.token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					to,
					messaging_product: 'whatsapp',
					type: 'interactive',
					interactive: {
						type: 'list',
						body: {
							text: bodyText,
						},
						action: {
							sections,
							button: buttonText,
						},
					},
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					`HTTP ${response.status}: ${JSON.stringify(errorData)}`
				);
			}

			const data = await response.json() as WhatsAppApiResponse;
			return data;
		} catch (error) {
			console.error('Error sending list message:', (error as Error).message);
			throw error;
		}
	}

	// Send media message (image, document, etc.)
	async sendMediaMessage(to: string, mediaType: string, mediaId: string, caption: string = ''): Promise<WhatsAppApiResponse> {
		// saveQuota(to);

		try {
			const mediaObject: Record<string, any> = {
				id: mediaId,
			};

			if (
				caption &&
				(mediaType === 'image' ||
					mediaType === 'video' ||
					mediaType === 'document')
			) {
				mediaObject.caption = caption;
			}

			const response = await fetch(this.baseUrl, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${this.token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					to,
					messaging_product: 'whatsapp',
					type: mediaType,
					[mediaType]: mediaObject,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					`HTTP ${response.status}: ${JSON.stringify(errorData)}`
				);
			}

			const data = await response.json() as WhatsAppApiResponse;
			return data;
		} catch (error) {
			console.error('Error sending media message:', (error as Error).message);
			throw error;
		}
	}

	// Send template message
	async sendTemplateMessage(
		to: string,
		templateName: string,
		languageCode: string = 'en_US',
		parameters: string[] = []
	): Promise<WhatsAppApiResponse> {
		// saveQuota(to);

		try {
			const response = await fetch(this.baseUrl, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${this.token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					to,
					messaging_product: 'whatsapp',
					type: 'template',
					template: {
						name: templateName,
						language: {
							code: languageCode,
						},
						components:
							parameters.length > 0
								? [
										{
											type: 'body',
											parameters: parameters.map(param => ({
												type: 'text',
												text: param,
											})),
										},
								  ]
								: undefined,
					},
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					`HTTP ${response.status}: ${JSON.stringify(errorData)}`
				);
			}

			const data = await response.json() as WhatsAppApiResponse;
			return data;
		} catch (error) {
			console.error('Error sending template message:', (error as Error).message);
			throw error;
		}
	}

	// Mark message as read
	async markAsRead(messageId: string): Promise<WhatsAppApiResponse | null> {
		try {
			const response = await fetch(this.baseUrl, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${this.token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					messaging_product: 'whatsapp',
					status: 'read',
					message_id: messageId
				}),
			});

			if (!response.ok) {
				// Read receipts might not be supported - make it non-critical
				console.log('Read receipt not supported or failed (non-critical)');
				return null;
			}

			const data = await response.json() as WhatsAppApiResponse;
			return data;
		} catch (error) {
			// Make read receipts non-critical - don't throw errors
			console.log('Read receipt failed (non-critical):', (error as Error).message);
			return null;
		}
	}

	// Start typing indicator
	async startTyping(messageId: string): Promise<WhatsAppApiResponse | null> {
		try {
			const response = await fetch(this.baseUrl, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${this.token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					messaging_product: 'whatsapp',
					message_id: messageId,
					typing_indicator: {
						type: "text"
					}
				}),
			});

			if (!response.ok) {
				// Typing indicator might not be supported - make it non-critical
				console.log('Typing indicator not supported or failed (non-critical)');
				return null;
			}

			const data = await response.json() as WhatsAppApiResponse;
			return data;
		} catch (error) {
			// Make read receipts non-critical - don't throw errors
			console.log('Read receipt failed (non-critical):', (error as Error).message);
			return null;
		}
	}

	// Start typing indicator
	async markAsReadAndStartTyping(messageId: string): Promise<WhatsAppApiResponse | null> {
		try {
			const response = await fetch(this.baseUrl, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${this.token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					messaging_product: 'whatsapp',
					message_id: messageId,
					status: 'read',
					typing_indicator: {
						type: "text"
					}
				}),
			});

			if (!response.ok) {
				// Mark as read or Typing indicator might not be supported - make it non-critical
				console.log('Mark as read or Typing indicator not supported or failed (non-critical)');
				return null;
			}

			const data = await response.json() as WhatsAppApiResponse;
			return data;
		} catch (error) {
			// Make read receipts non-critical - don't throw errors
			console.log('Read receipt failed (non-critical):', (error as Error).message);
			return null;
		}
	}

	// Get media URL from media ID
	async getMediaUrl(mediaId: string): Promise<string | null> {
		try {
			const response = await fetch(`https://graph.facebook.com/v23.0/${mediaId}`, {
				headers: {
					Authorization: `Bearer ${this.token}`,
				},
			});

			if (!response.ok) {
				throw new Error(`Failed to get media URL: ${response.statusText}`);
			}

			const data = await response.json() as { url: string };
			return data.url;
		} catch (error) {
			console.error('Error getting media URL:', error);
			return null;
		}
	}

	// Download media file
	async downloadMedia(mediaUrl: string): Promise<Buffer | null> {
		try {
			const response = await fetch(mediaUrl, {
				headers: {
					Authorization: `Bearer ${this.token}`,
				},
			});

			if (!response.ok) {
				throw new Error(`Failed to download media: ${response.statusText}`);
			}

			const buffer = await response.arrayBuffer();
			return Buffer.from(buffer);
		} catch (error) {
			console.error('Error downloading media:', error);
			return null;
		}
	}

	// Complete media download process
	async getMediaBuffer(mediaId: string): Promise<Buffer | null> {
		const mediaUrl = await this.getMediaUrl(mediaId);
		if (!mediaUrl) return null;
		
		return await this.downloadMedia(mediaUrl);
	}

	// React to a message with emoji
	async reactToMessage(to: string, messageId: string, emoji: string): Promise<WhatsAppApiResponse> {
		try {
			const response = await fetch(this.baseUrl, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${this.token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					to,
					messaging_product: 'whatsapp',
					type: 'reaction',
					reaction: {
						message_id: messageId,
						emoji: emoji
					}
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					`HTTP ${response.status}: ${JSON.stringify(errorData)}`
				);
			}

			const data = await response.json() as WhatsAppApiResponse;
			return data;
		} catch (error) {
			console.error('Error reacting to message:', (error as Error).message);
			throw error;
		}
	}
}
