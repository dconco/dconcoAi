import handleTextMessage from "@/dconco-ai/helper/handleTextMessage";
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

   if (isGroup && (isMentioned || isReplyToMe)) {
      if (message.type === MessageTypes.TEXT) handleTextMessage(message, client, 'group');
   }

   else if (isPrivate) {
      if ((message.type === MessageTypes.TEXT && !message.fromMe) || (message.fromMe && message.body.startsWith('!')))
         handleTextMessage(message, client, 'private');
   }

   // Outgoing message created by this client
   // console.log(`Outgoing message captured: "${message.body}" to ${toNumber} from ${fromNumber}`);
   // console.log(`Message type: ${message.type}`);

   if (message.body === '!𝒑𝒊𝒏𝒈' || message.body === '!ping') {
      const responses = ['pong', 'pong! 🏓', 'got it!', 'received ✓'];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      message.reply(style(randomResponse));
   }

   return;
}