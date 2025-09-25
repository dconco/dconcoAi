import handleTextMessage from "@/dconco-ai/helper/handleTextMessage";
import handleImageMessage from "@/dconco-ai/helper/handleImageMessage";
import handleStickerMessage from "@/dconco-ai/helper/handleStickerMessage";
import { Client, Message, MessageTypes } from "whatsapp-web.js";
import { style } from "@/dconco-ai";

export default async function messageController(message: Message, client: Client) {
   const isGroup = message.from.endsWith('@g.us');
   const isPrivate = message.from.endsWith('@c.us') || message.from.endsWith('@s.whatsapp.net');

   // Check if message is a reply to my message
   const isReplyToMe = message.hasQuotedMsg && 
                     (await message.getQuotedMessage()).fromMe;

   // Check if I am mentioned in the message
   const myNumber = client.info.wid.user;
   const mentions = await message.getMentions();
   const isMentioned = mentions.some(mention => mention.id.user === myNumber);

   if (message.fromMe && message.body.startsWith('!')) {
      const msgBody = message.body.slice(1).trim().toLowerCase();

      switch (msgBody) {
         case 'ping':
            const responses = ['pong', 'pong! 🏓', 'got it!', 'received ✓'];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];

            message.reply(style(randomResponse));
            break;

         case 'history':
            try {
               const chat = await message.getChat();
               const historyMessages = await chat.fetchMessages({ limit: 30 });

               // Process messages into oldMessages format
               const processedMsgs: {text: string; reply?: string}[] = [];
               for (let i = 0; i < historyMessages.length; i++) {
                  const msg = historyMessages[i];

                  if (msg.body || msg.hasMedia) {
                     const contact =  msg.author || await msg.getContact() as any;
                     const author = contact?.name || contact?.pushname || contact || 'User';
                     const msgAuthor = msg.fromMe ? 'Bot' : author;

                     // Check if this is a user message OR a bot message that starts with !
                     const isUserMessage = !msg.fromMe || (msg.fromMe && msg.body?.startsWith('!'));
                     
                     if (isUserMessage) {
                        const userMsg: {text: string; reply?: string} = { 
                           text: `[${msgAuthor}] ${msg.body || '[Media]'}` 
                        };
                        
                        // Look for the next message as a potential reply
                        if (i + 1 < historyMessages.length) {
                           const nextMsg = historyMessages[i + 1];
                           // If next message is from bot and doesn't start with !, treat it as reply
                           if (nextMsg.fromMe && nextMsg.body && !nextMsg.body.startsWith('!')) {
                              userMsg.reply = nextMsg.body;
                              i++; // Skip the next message since we've used it as a reply
                           }
                        }
                        processedMsgs.push(userMsg);
                     }
                  }
               }

               const historyText = JSON.stringify(processedMsgs, null, 3);
               message.reply(style(historyText));
            } catch (e) {
               message.reply(style('Error fetching history'));
            }

            break;

         default:
            if (message.type === MessageTypes.TEXT) handleTextMessage(message, client, isGroup ? 'group' : 'private');
            if (message.type === MessageTypes.IMAGE) handleImageMessage(message, client, isGroup ? 'group' : 'private');
            if (message.type === MessageTypes.STICKER) handleStickerMessage(message, client, isGroup ? 'group' : 'private');

            break;
      }

      return;
   }

   if (isGroup && (isMentioned || isReplyToMe) && !message.fromMe) {
      if (message.type === MessageTypes.TEXT) handleTextMessage(message, client, 'group');
      if (message.type === MessageTypes.IMAGE) handleImageMessage(message, client, 'group');
      if (message.type === MessageTypes.STICKER) handleStickerMessage(message, client, 'group');
   }

   else if (isPrivate && !message.fromMe) {
      if (message.type === MessageTypes.TEXT) handleTextMessage(message, client, 'private');
      if (message.type === MessageTypes.IMAGE) handleImageMessage(message, client, 'private');
      if (message.type === MessageTypes.STICKER) handleStickerMessage(message, client, 'private');
   }

   return;
}