# 🤖 WhatsApp Bot - Business API

A powerful and feature-rich WhatsApp Bot built with Node.js and Express, utilizing the official WhatsApp Business API for seamless messaging automation.

## ✨ Features

-  🚀 **Official WhatsApp Business API Integration**
-  💬 **Smart Message Handling** - Text, Interactive, and Media messages
-  🎯 **Interactive Elements** - Buttons and List messages support
-  📡 **Webhook Integration** - Real-time message processing
-  🔄 **Auto-Response System** - Intelligent conversation flow
-  📊 **Message Status Tracking** - Read receipts and delivery status
-  🛡️ **Error Handling** - Robust error management and logging
-  🎨 **Modular Architecture** - Clean, maintainable code structure

## 🏗️ Architecture

```
├── index.js                     # Main server entry point
├── utils/
│   └── whatsappService.js      # WhatsApp API service layer
├── controllers/
│   ├── webhookController.js    # Webhook verification handler
│   └── messagesController.js   # Message processing controller
└── helper/
    ├── handleTextMessage.js    # Text message logic
    └── handleInteractiveMessage.js # Interactive message logic
```

## 🚀 Quick Start

### Prerequisites

-  Node.js 18+ (for native fetch support)
-  WhatsApp Business API Account
-  Meta Developer Account

### Installation

1. **Clone and Setup**

   ```bash
   git clone https://github.com/dconco/whatsapp-bot YourBot
   cd YourBot
   npm install
   ```

2. **Environment Configuration**

   ```bash
   touch .env
   ```

   Add your WhatsApp credentials:

   ```env
   PORT=3000
   NODE_ENV=development
   WHATSAPP_TOKEN=your_whatsapp_access_token
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
   VERIFY_TOKEN=your_webhook_verify_token
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📱 Bot Capabilities

### 🎯 Interactive Features

-  **Smart Greetings** - Responds to "hello", "hi" with personalized welcome
-  **Menu System** - Type "menu" or "options" for interactive buttons
-  **Services List** - Type "list" or "services" for service selection
-  **Auto Responses** - Intelligent replies to user messages

### 💬 Message Types Supported

| Type      | Description                    | Example                          |
| --------- | ------------------------------ | -------------------------------- |
| Text      | Simple text messages           | `Hello! How are you?`            |
| Buttons   | Interactive button choices     | `Choose: [Option 1] [Option 2]`  |
| Lists     | Dropdown menu selections       | `Services: Web Dev, Mobile Apps` |
| Media     | Images, documents, videos      | `📎 document.pdf`                |
| Templates | Pre-approved message templates | `Welcome {{name}}!`              |

## 🔧 API Endpoints

### Webhook Endpoints

```
GET  /webhook     - Webhook verification
POST /webhook     - Message receiver
```

### Message API

```
POST /api/send-message    - Send text message
GET  /api/status         - Bot health check
GET  /                   - Service info
```

### Example API Usage

**Send a message:**

```bash
curl -X POST http://localhost:3000/api/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "to": "1234567890",
    "message": "Hello from your bot!"
  }'
```

## 🛠️ Configuration

### Webhook Setup

1. **Tunnel Setup** (for local development)

   ```bash
   # Using ngrok
   ngrok http 3000

   # Using cloudflare tunnel
   cloudflared tunnel --url http://localhost:3000
   ```

2. **Meta Developer Console**
   -  Add webhook URL: `https://your-domain.com/webhook`
   -  Set verify token from your `.env` file
   -  Subscribe to `messages` events

### Environment Variables

| Variable                   | Description                          | Required |
| -------------------------- | ------------------------------------ | -------- |
| `WHATSAPP_TOKEN`           | Access token from Meta               | ✅       |
| `WHATSAPP_PHONE_NUMBER_ID` | Your bot's phone number ID           | ✅       |
| `VERIFY_TOKEN`             | Webhook verification token           | ✅       |
| `PORT`                     | Server port (default: 3000)          | ❌       |
| `NODE_ENV`                 | Environment (development/production) | ❌       |

## 🎨 Customization

### Adding New Commands

1. **Edit `handleTextMessage.js`:**

   ```javascript
   if (lowerText.includes('your-command')) {
   	await whatsapp.sendTextMessage(from, 'Your response here')
   }
   ```

2. **Add Interactive Elements:**
   ```javascript
   await whatsapp.sendButtonMessage(from, 'Choose:', [
   	{ id: 'btn1', title: 'Option 1' },
   	{ id: 'btn2', title: 'Option 2' },
   ])
   ```

### Message Templates

Create templates in Meta Business Manager and use:

```javascript
await whatsapp.sendTemplateMessage(phoneNumber, 'template_name', 'en_US', [
	'parameter1',
	'parameter2',
])
```

## 📊 Monitoring & Logging

The bot includes comprehensive logging for:

-  ✅ Message sent confirmations
-  📥 Incoming message details
-  ❌ Error tracking and debugging
-  🔍 Webhook verification events

## 🚦 Status & Health Checks

Monitor your bot health:

```
GET /api/status
```

Response:

```json
{
	"status": "running",
	"environment": "development",
	"timestamp": "2025-01-09T10:30:00.000Z",
	"whatsapp_configured": true
}
```

## 🔐 Security Features

-  ✅ Webhook signature verification
-  🛡️ Environment variable protection
-  🔒 Token-based authentication
-  📝 Request validation and sanitization

## 🐛 Troubleshooting

### Common Issues

**Webhook not receiving messages:**

-  Check webhook URL is accessible
-  Verify VERIFY_TOKEN matches Meta console
-  Ensure HTTPS for production

**Messages not sending:**

-  Validate WHATSAPP_TOKEN is active
-  Check phone number format (international)
-  Verify recipient is in test users (during approval)

**Bot not responding:**

-  Check server logs for errors
-  Verify message processing logic
-  Test with different message types

## 📜 License

MIT License - feel free to use this for personal or commercial projects!

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

-  📧 **Email**: concodave@gmail.com
-  📱 **Phone**: +2349064772574
-  🐛 **Issues**: [GitHub Issues](https://github.com/dconco/whatsapp-bot/issues)

---

**⚠️ Important Notice**: This bot uses the official WhatsApp Business API and requires proper approval from Meta for production use. During development, it only works with test numbers added to your developer account.

---

_Built with ❤️ By Dave Conco using Node.js, Express, and WhatsApp Business API_
