import dotenv from 'dotenv';

// Load environment variables as early as possible
dotenv.config();

import express, { Express, Request, Response } from 'express';
import { getStats, getMessages, getAllUsers } from '@/controllers/adminController';
import { currentModel, getModels } from '@/controllers/modelsController';
import sendMessagesController from '@/controllers/sendMessagesController';
import MessagesController from '@/controllers/messagesController';
import WebhookController from '@/controllers/webhookController';
import connectDB from '@/utils/database';

// Connect to MongoDB
connectDB();

const app: Express = express();
const PORT: number = Number(process.env.PORT) || 3000;

// Parse JSON automatically
app.use(express.json());

// --- 1) Verification Endpoint (GET) ---
app.get('/webhook', WebhookController);

// --- 2) Message Receiver Endpoint (POST) ---
app.post('/webhook', MessagesController);

// --- Index Page (GET) ---
app.get('/', (_: Request, res: Response) => {
	res.json({
		message: 'WhatsApp Bot is running!',
		environment: process.env.NODE_ENV,
		port: PORT,
	});
});

// --- Health Check Endpoint (GET) ---
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


// --- API Routes for sending messages (POST) ---
app.post('/api/send-message', sendMessagesController);

// --- API Routes for AI models (GET) ---
app.get('/api/models', getModels);
app.get('/api/current-model', currentModel);

// --- Admin Routes (GET) ---
app.get('/api/admin/stats', getStats);
app.get('/api/admin/users', getAllUsers);
app.get('/api/admin/messages/:contact', getMessages);

// --- Start Server ---
app.listen(PORT, () => {
	console.log(`🚀 Express server running on port ${PORT}`);
});
