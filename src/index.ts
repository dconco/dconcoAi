import dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';
import WhatsappService from '@/utils/whatsappService';
import WebhookController from '@/controllers/webhookController';
import MessagesController from '@/controllers/messagesController';
import { cacheAPIMessage, saveUsers } from '@/utils/quotaChecker';
import { SendMessageRequest } from '@/types';
import { getModelStatus, getCurrentModel } from '@/utils/modelFallback';

dotenv.config();

const app: Express = express();
const PORT: number = Number(process.env.PORT) || 3000;
const whatsapp: WhatsappService = new WhatsappService();

// Parse JSON automatically
app.use(express.json());

// --- 1) Verification Endpoint (GET) ---
app.get('/webhook', WebhookController);

// --- 2) Message Receiver Endpoint (POST) ---
app.post('/webhook', MessagesController);

// API Routes for sending messages
app.post('/api/send-message', async (req: Request<{}, {}, SendMessageRequest>, res: Response) => {
	try {
		const { to, message } = req.body;

		if (!to || !message) {
			return res
				.status(400)
				.json({ error: 'Phone number and message are required' });
		}

		// if (!(await checkQuota(to, ''))) {
		// 	return res
		// 		.status(403)
		// 		.json({ error: 'Quota exceeded for this user.' });
		// }

		if (req.body?.messageId) {
			await whatsapp.markAsRead(req.body.messageId);
		}

		const result = await whatsapp.sendTextMessage(to, message, req.body?.messageId);

		if (result) {
			cacheAPIMessage({message, contact: to, name: req.body?.name});
			saveUsers({contact: to, name: req.body?.name});
		}

		return res.json({ success: true, data: result });
	} catch (error) {
		return res.status(500).json({ error: (error as Error).message });
	}
});

app.get('/', (_: Request, res: Response) => {
	res.json({
		message: 'WhatsApp Bot is running!',
		environment: process.env.NODE_ENV,
		port: PORT,
	});
});

app.get('/api/status', (_: Request, res: Response) => {
	res.json({
		status: 'running',
		environment: process.env.NODE_ENV,
		timestamp: new Date().toISOString(),
		whatsapp_configured: !!(
			process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID
		),
	});
});

app.get('/api/models', (_: Request, res: Response) => {
	try {
		const modelStatus = getModelStatus();
		res.json({
			success: true,
			data: modelStatus
		});
	} catch (error) {
		res.status(500).json({ 
			success: false, 
			error: (error as Error).message 
		});
	}
});

app.get('/api/current-model', (_: Request, res: Response) => {
	try {
		const currentModel = getCurrentModel();
		const modelStatus = getModelStatus();
		
		// Find the current model details
		const currentModelData = modelStatus.usage.find(m => m.name === currentModel);
		
		res.json({
			success: true,
			data: {
				currentModel: currentModel,
				version: currentModelData?.version || 'unknown',
				dailyUsage: currentModelData?.dailyUsage || 0,
				dailyLimit: currentModelData?.dailyLimit || 0,
				usagePercentage: currentModelData?.usagePercentage || 0,
				isBlocked: currentModelData?.isBlocked || false,
				isUnlimited: currentModelData?.dailyLimit >= 999999,
				timestamp: new Date().toISOString()
			}
		});
	} catch (error) {
		res.status(500).json({ 
			success: false, 
			error: (error as Error).message 
		});
	}
});

// --- Start Server ---
app.listen(PORT, () => {
	console.log(`🚀 Express server running on port ${PORT}`);
});
