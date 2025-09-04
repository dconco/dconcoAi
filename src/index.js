import dotenv from 'dotenv'
import express from 'express'
import WhatsappService from './utils/whatsappService.js'
import WebhookController from './controllers/webhookController.js'
import MessagesController from './controllers/messagesController.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT
const whatsapp = new WhatsappService()

// Parse JSON automatically
app.use(express.json())

// --- 1) Verification Endpoint (GET) ---
app.get('/webhook', WebhookController)

// --- 2) Message Receiver Endpoint (POST) ---
app.post('/webhook', MessagesController)

// API Routes for sending messages
app.post('/api/send-message', async (req, res) => {
	try {
		const { to, message } = req.body

		if (!to || !message) {
			return res
				.status(400)
				.json({ error: 'Phone number and message are required' })
		}

		const result = await whatsapp.sendTextMessage(to, message)
		res.json({ success: true, data: result })
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
})

app.get('/', (req, res) => {
	res.json({
		message: 'WhatsApp Bot is running!',
		environment: process.env.NODE_ENV,
		port: PORT,
	})
})

app.get('/api/status', (req, res) => {
	res.json({
		status: 'running',
		environment: process.env.NODE_ENV,
		timestamp: new Date().toISOString(),
		whatsapp_configured: !!(
			process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID
		),
	})
})

// --- Start Server ---
app.listen(PORT, () => {
	console.log(`🚀 Express server running on port ${PORT}`)
})
