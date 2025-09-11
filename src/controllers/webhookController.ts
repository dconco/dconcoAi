import { Request, Response } from 'express';

const WebhookController = (req: Request, res: Response): void => {
	const mode: string = req.query['hub.mode'] as string;
	const token: string = req.query['hub.verify_token'] as string;
	const challenge: string = req.query['hub.challenge'] as string;
	const VERIFY_TOKEN: string = process.env.VERIFY_TOKEN as string;

	if (mode === 'subscribe' && token === VERIFY_TOKEN) {
		console.log('Webhook Connected Successfully');
		res.status(200).send(challenge);
	} else {
		console.log('Verification Failed');
		res.status(403).send('Verification Failed');
	}
};

export default WebhookController;
