import dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';
import WebhookController from '@/controllers/webhookController';
import MessagesController from '@/controllers/messagesController';
import sendMessagesController from '@/controllers/sendMessagesController';
import { getStats, getMessages, getAllUsers } from '@/controllers/adminController';
import { currentModel, getModels } from '@/controllers/modelsController';
import connectDB from '@/utils/database';
import { conversationScheduler } from '@/services/conversationScheduler';

dotenv.config();

// Connect to MongoDB
connectDB();

// Start conversation follow-up scheduler
conversationScheduler.start();

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

// --- Conversation Scheduler Admin Routes ---
app.get('/api/admin/scheduler/status', (_: Request, res: Response) => {
	res.json(conversationScheduler.getStatus());
});

app.get('/api/admin/scheduler/config', (_: Request, res: Response) => {
	res.json({
		window_hours: Number(process.env.FOLLOWUP_WINDOW_HOURS) || 24,
		delay_minutes: Number(process.env.FOLLOWUP_DELAY_MINUTES) || 30,
		max_followups: Number(process.env.MAX_FOLLOWUPS) || 3,
		check_interval_minutes: Number(process.env.FOLLOWUP_CHECK_INTERVAL_MINUTES) || 10,
		enabled: process.env.FOLLOWUP_ENABLED !== 'false'
	});
});

app.post('/api/admin/scheduler/trigger', async (_: Request, res: Response) => {
	try {
		await conversationScheduler.triggerCheck();
		res.json({ success: true, message: 'Follow-up check triggered successfully' });
	} catch (error) {
		res.status(500).json({ success: false, error: 'Failed to trigger follow-up check' });
	}
});

app.post('/api/admin/scheduler/start', (_: Request, res: Response) => {
	conversationScheduler.start();
	res.json({ success: true, message: 'Scheduler started' });
});

app.post('/api/admin/scheduler/stop', (_: Request, res: Response) => {
	conversationScheduler.stop();
	res.json({ success: true, message: 'Scheduler stopped' });
});

// --- Start Server ---
app.listen(PORT, () => {
	console.log(`🚀 Express server running on port ${PORT}`);
});
