import qrcode from "qrcode-terminal";
import messageController from "@/dconco-ai/controller/messageController";
import { Client, LocalAuth } from "whatsapp-web.js";
import { serif } from "weird-fonts";

export const style = (text: string) => serif(text, {
   fontStyle: 'bold-italic'
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


client.on('message_create', (message) => {
   // Check if it's night time
   const now = new Date();
   const hour = now.getHours();
   const isNightTime = hour >= 0 && hour < 6; // 12 AM (0) to 6 AM

   // if (isNightTime) {
   //    // Random delays during night: 10-40 seconds
   //    const delays: number[] = [
   //       Math.random() * 10000 + 10000, // 10-20 seconds
   //       Math.random() * 10000 + 20000, // 20-30 seconds  
   //       Math.random() * 10000 + 30000,  // 30-40 seconds
   //       0
   //    ];

   //    const randomDelay = delays[Math.floor(Math.random() * delays.length)];

   //    console.log(`Night mode: Delaying response by ${Math.round(randomDelay/1000)} seconds`);

   //    setTimeout(async () => {
   //       if (randomDelay === 0) return;
   //       messageController(message, client);
   //    }, randomDelay);
   // } else {
      messageController(message, client);
   // }
});

client.initialize();