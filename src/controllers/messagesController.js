import WhatsappService from '../utils/whatsappService.js'
import handleTextMessage from '../helper/handleTextMessage.js'
import handleInteractiveMessage from '../helper/handleInteractiveMessage.js'

export default async function MessagesController(req, res) {
	const whatsapp = new WhatsappService()
	const body = req.body

	try {
		if (body.object === 'whatsapp_business_account') {
			body.entry?.forEach(entry => {
				entry.changes?.forEach(change => {
					if (change.field === 'messages') {
						const messages = change.value.messages
						const contacts = change.value.contacts

						messages?.forEach(async message => {
							const from = message.from
							const messageId = message.id
							const contact = contacts?.find(c => c.wa_id === from)
							const name = contact?.profile?.name || 'Unknown'

							console.log(
								`Message from ${name} (${from}): ${
									message.text?.body || 'Non-text message'
								}`
							)

							// Mark message as read
							await whatsapp.markAsRead(messageId)

							// Handle different message types
							if (message.type === 'text') {
								await handleTextMessage(from, message.text.body, name)
							} else if (message.type === 'interactive') {
								await handleInteractiveMessage(
									from,
									message.interactive,
									name
								)
							}
						})
					}
				})
			})
		}

		res.status(200).send('OK')
	} catch (error) {
		console.error('Webhook error:', error)
		res.status(500).send('Error')
	}
}
