import WhatsappService from '../utils/whatsappService.js'

export default async function handleTextMessage(from, text, name) {
	const whatsapp = new WhatsappService()
	const lowerText = text.toLowerCase()

	if (lowerText.includes('hello') || lowerText.includes('hi')) {
		await whatsapp.sendTextMessage(
			from,
			`Whatsup ${name}! 👋 How can I help you today?`
		)
	} else if (lowerText.includes('menu') || lowerText.includes('options')) {
		await whatsapp.sendButtonMessage(from, 'Here are some options:', [
			{ id: 'option1', title: 'Get Info' },
			{ id: 'option2', title: 'Contact Us' },
			{ id: 'option3', title: 'Help' },
		])
	} else if (lowerText.includes('list') || lowerText.includes('services')) {
		await whatsapp.sendListMessage(
			from,
			'Choose from our services:',
			'Select Service',
			[
				{
					title: 'Main Services',
					rows: [
						{
							id: 'service1',
							title: 'Web Development',
							description: 'Custom websites and apps',
						},
						{
							id: 'service2',
							title: 'Mobile Apps',
							description: 'iOS and Android apps',
						},
						{
							id: 'service3',
							title: 'Consulting',
							description: 'Technical consulting',
						},
					],
				},
			]
		)
	} else {
		await whatsapp.sendTextMessage(
			from,
			`Thanks for your message: "${text}". How can I help you?`
		)
	}
}
