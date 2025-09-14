import { cacheMessage } from '@/utils/quotaChecker';
import WhatsappService from '../utils/whatsappService';

export default async function handleTextMessage(from: string, text: string, name: string|undefined): Promise<void> {
	const whatsapp = new WhatsappService();
	const lowerText = text.toLowerCase();

	if (lowerText.includes('hello') || lowerText.includes('hi')) {
		const response = handleGreeting(text, name);
		cacheMessage({ contact: from, text, name: name || '', reply: response });

		await whatsapp.sendTextMessage(from, response);
	}
	
	/**
	 * Menu and Options
	 */
	else if (lowerText.includes('menu') || lowerText.includes('options')) {
		cacheMessage({ contact: from, text, name: name || '', reply: 'Menu Options: { option1: Get Info,\noption2: Contact Us,\noption3: Help }' });

		await whatsapp.sendButtonMessage(from, 'Here are some options:', [
			{ id: 'option1', title: 'Get Info' },
			{ id: 'option2', title: 'Contact Us' },
			{ id: 'option3', title: 'Help' },
		]);
	}
	
	/**
	 * Services List
	 */
	else if (lowerText.includes('list') || lowerText.includes('services')) {
		cacheMessage({ contact: from, text, name: name || '', reply: 'Main Services: { service1: Web Development,\nservice2: Mobile Apps,\nservice3: Consulting }' });

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
		);
	}
	
	/**
	 * Default response
	 */
	else {
		const response = `Thanks for your message! I will get back to you soon.`;
		cacheMessage({ contact: from, text: text, name: name || '', reply: response });

		await whatsapp.sendTextMessage(from, response);
	}
}


function handleGreeting(_originalText: string, name: string|undefined): string {
	
	if (name) {
		const greetings: Array<string> = [
			`Hello ${name}! 👋 How can I assist you today?`,
			`Hi ${name}! 👋 What can I do for you?`,
			`Hey ${name}! 👋 How may I help you?`,
		];

		return greetings[Math.floor(Math.random() * greetings.length)];
	} else {
		const greetings: Array<string> = [
			`Hello! 👋 How can I assist you today?`,
			`Hi! 👋 What can I do for you?`,
			`Hey! 👋 How may I help you?`,
		];

		return greetings[Math.floor(Math.random() * greetings.length)];
	}
}