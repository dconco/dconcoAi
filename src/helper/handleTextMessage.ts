import chatWithUser from '@/bot';
import { handleMessages } from './handleMessages';

export default async function handleTextMessage(from: string, text: string, messageId: string): Promise<string|null> {
	const response = await chatWithUser(from, text);
	const result = await handleMessages(from, response || '', messageId);
	return result;
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
}