class WhatsAppService {
	constructor() {
		this.token = process.env.WHATSAPP_TOKEN
		this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
		this.baseUrl = `https://graph.facebook.com/v23.0/${this.phoneNumberId}/messages`
	}

	// Send a text message
	async sendTextMessage(to, message) {
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
					type: 'text',
					text: {
						body: message,
					},
				}),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(
					`HTTP ${response.status}: ${JSON.stringify(errorData)}`
				)
			}

			const data = await response.json()
			console.log('Message sent successfully:', data)
			return data
		} catch (error) {
			console.error('Error sending message:', error.message)
			throw error
		}
	}

	// Send a message with buttons
	async sendButtonMessage(to, bodyText, buttons) {
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
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(
					`HTTP ${response.status}: ${JSON.stringify(errorData)}`
				)
			}

			const data = await response.json()
			console.log('Button message sent successfully:', data)
			return data
		} catch (error) {
			console.error('Error sending button message:', error.message)
			throw error
		}
	}

	// Send a list message
	async sendListMessage(to, bodyText, buttonText, sections) {
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
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(
					`HTTP ${response.status}: ${JSON.stringify(errorData)}`
				)
			}

			const data = await response.json()
			console.log('List message sent successfully:', data)
			return data
		} catch (error) {
			console.error('Error sending list message:', error.message)
			throw error
		}
	}

	// Send media message (image, document, etc.)
	async sendMediaMessage(to, mediaType, mediaId, caption = '') {
		try {
			const mediaObject = {
				id: mediaId,
			}

			if (
				caption &&
				(mediaType === 'image' ||
					mediaType === 'video' ||
					mediaType === 'document')
			) {
				mediaObject.caption = caption
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
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(
					`HTTP ${response.status}: ${JSON.stringify(errorData)}`
				)
			}

			const data = await response.json()
			console.log('Media message sent successfully:', data)
			return data
		} catch (error) {
			console.error('Error sending media message:', error.message)
			throw error
		}
	}

	// Send template message
	async sendTemplateMessage(
		to,
		templateName,
		languageCode = 'en_US',
		parameters = []
	) {
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
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(
					`HTTP ${response.status}: ${JSON.stringify(errorData)}`
				)
			}

			const data = await response.json()
			console.log('Template message sent successfully:', data)
			return data
		} catch (error) {
			console.error('Error sending template message:', error.message)
			throw error
		}
	}

	// Mark message as read
	async markAsRead(messageId) {
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
					message_id: messageId,
				}),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(
					`HTTP ${response.status}: ${JSON.stringify(errorData)}`
				)
			}

			const data = await response.json()
			console.log('Message marked as read:', data)
			return data
		} catch (error) {
			console.error('Error marking message as read:', error.message)
			throw error
		}
	}
}

export default WhatsAppService
