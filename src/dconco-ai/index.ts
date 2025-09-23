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
      executablePath: process.env.NODE_ENV !== 'production' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : undefined,
      headless: true,
      args: [
         '--no-sandbox',
         '--disable-setuid-sandbox',
         '--disable-dev-shm-usage',
         '--disable-accelerated-2d-canvas',
         '--no-first-run',
         '--no-zygote',
         '--disable-gpu',
         '--disable-web-security',
         '--disable-features=VizDisplayCompositor'
      ]
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


client.on('message_create', (message) => {
   // Check if it's night time
   const now = new Date();
   const hour = now.getHours();
   const isNightTime = hour >= 0 && hour < 6; // 12 AM (0) to 6 AM

   // Get message timestamp (in seconds)
   const messageTime = message.timestamp;
   const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
   const timeDifference = currentTime - messageTime;

   // Ignore messages older than 60 seconds
   if (timeDifference > 60) {
      console.log(`Message is ${timeDifference} seconds old. Ignoring...`);
      return; // Skip processing this message
   }

   if (isNightTime) {
      // Random delays during night: 10-40 seconds
      const delays: number[] = [
         Math.random() * 10000 + 10000, // 10-20 seconds
         Math.random() * 10000 + 20000, // 20-30 seconds  
         Math.random() * 10000 + 30000,  // 30-40 seconds
         0
      ];

      const randomDelay = delays[Math.floor(Math.random() * delays.length)];

      console.log(`Night mode: Delaying response by ${Math.round(randomDelay/1000)} seconds`);

      setTimeout(async () => {
         if (randomDelay === 0) return;
         messageController(message, client);
      }, randomDelay);
   } else {
      messageController(message, client);
   }
});

client.initialize();