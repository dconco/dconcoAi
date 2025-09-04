import WhatsappService from '../utils/whatsappService.js'

// Handle interactive messages (buttons, lists)
export default async function handleInteractiveMessage(
	from,
	interactive,
	name
) {
	if (interactive.type === 'button_reply') {
		const buttonId = interactive.button_reply.id

		switch (buttonId) {
			case 'option1':
				await whatsapp.sendTextMessage(
					from,
					'Here is some information about me...'
				)
				break
			case 'option2':
				await whatsapp.sendTextMessage(
					from,
					'You can contact me at: concodave@gmail.com or call +2349064772574'
				)
				break
			case 'option3':
				await whatsapp.sendTextMessage(
					from,
					'Type "menu" to see options or "list" to see our services.'
				)
				break
			default:
				await whatsapp.sendTextMessage(
					from,
					'Thanks for clicking the button!'
				)
		}
	} else if (interactive.type === 'list_reply') {
		const listId = interactive.list_reply.id
		const title = interactive.list_reply.title

		await whatsapp.sendTextMessage(
			from,
			`You selected: ${title}. We'll get back to you about ${title} soon!`
		)
	}
}
