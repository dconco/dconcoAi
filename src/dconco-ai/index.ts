import qrcode from "qrcode-terminal";
import messageController from "@/dconco-ai/controller/messageController";
import { Client, LocalAuth } from "whatsapp-web.js";
import Font from "weird-fonts";

export const style = (text: string) => Font.sansSerif(text, {
   fontStyle: 'normal'
});

// Create a new client instance with local authentication
const client = new Client({
   authStrategy: new LocalAuth(),
   puppeteer: {
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true
   }
});

// Display QR code in terminal
client.on('qr', (qr) => {
   console.log('Scan this QR code with your WhatsApp:');
   qrcode.generate(qr, { small: true });
});

// When client is ready
client.on('ready', () => {
   console.log('WhatsApp Bot is ready! 🚀');
});


client.on('message_create', async (message) => {
   // Check if it's night time
   const now = new Date();
   const hour = now.getHours();
   const isNightTime = hour >= 0 && hour < 6; // 12 AM (0) to 6 AM

   // Get message timestamp (in seconds)
   const messageTime = message.timestamp;
   const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
   const timeDifference = currentTime - messageTime;

   // Ignore messages older than 5 minutes
   if (timeDifference > 300) {
      console.log(`Message is ${timeDifference} seconds old. Ignoring...`);
      return; // Skip processing this message
   }

   if (isNightTime) {
      // Shorter random delays during night: 3-7 seconds
      const randomDelay = Math.random() * 4000 + 3000; // 3-7 seconds

      console.log(`Night mode: Delaying response by ${Math.round(randomDelay/1000)} seconds`);

      setTimeout(async () => {
         messageController(message, client);
      }, randomDelay);
   } else {
      // Immediate response during day
      messageController(message, client);
   }
});

client.initialize();