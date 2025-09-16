import chatWithUser from '@/bot';
import WhatsappService from '@/utils/whatsappService';

export default async function handleTextMessage(from: string, text: string, messageId: string, name: string|undefined): Promise<string|void> {
	const whatsapp = new WhatsappService();

	/**
	 * Menu and Options
	 */
	// else if (lowerText.includes('menu') || lowerText.includes('options')) {
	// 	const result = await whatsapp.sendButtonMessage(from, 'Here are some options:', [
	// 		{ id: 'option1', title: 'Get Info' },
	// 		{ id: 'option2', title: 'Contact Us' },
	// 		{ id: 'option3', title: 'Help' },
	// 	]);

	// 	if (result) return 'Menu Options: { option1: Get Info,\noption2: Contact Us,\noption3: Help }';
	// }
	
	/**
	 * Services List
	 */
	// else if (lowerText.includes('list') || lowerText.includes('services')) {
	// 	const result = await whatsapp.sendListMessage(
	// 		from,
	// 		'Choose from our services:',
	// 		'Select Service',
	// 		[
	// 			{
	// 				title: 'Main Services',
	// 				rows: [
	// 					{
	// 						id: 'service1',
	// 						title: 'Web Development',
	// 						description: 'Custom websites and apps',
	// 					},
	// 					{
	// 						id: 'service2',
	// 						title: 'Mobile Apps',
	// 						description: 'iOS and Android apps',
	// 					},
	// 					{
	// 						id: 'service3',
	// 						title: 'Consulting',
	// 						description: 'Technical consulting',
	// 					},
	// 				],
	// 			},
	// 		]
	// 	);
	// 	if (result) return 'Main Services: { service1: Web Development,\nservice2: Mobile Apps,\nservice3: Consulting }';
	// }
	
	/**
	 * Default response
	 */
	const response = await chatWithUser(name, from, text);

	const result = await whatsapp.sendTextMessage(from, response, messageId);
	if (result) return response;
}