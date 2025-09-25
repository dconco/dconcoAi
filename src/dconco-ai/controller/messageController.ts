import handleTextMessage from "@/dconco-ai/helper/handleTextMessage";
import { handleMessages } from "@/dconco-ai/helper/handleMessages";
import { Client, Message, MessageTypes } from "whatsapp-web.js";
import { style } from "@/dconco-ai";
import chatWithUser from "@/bot";
import { cacheGroupMessage } from "@/utils/quotaChecker";

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
            message.reply(style('pong! 🏓'));
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
            handleTextMessage(message, client, isGroup ? 'group' : 'private');
            
            // const chat = await message.getChat();
            // const contact =  message.author || await message.getContact() as any;
            // const author = contact?.name || contact?.pushname || contact || 'User';
            // const time = new Date();

            // try {
            //    setTimeout(async () => {
            //       // Pass the message object as the last parameter for accessing chat history in private chats
            //       const reply = await chatWithUser(chat.id._serialized, message.body, undefined, isGroup ? 'group' : 'private', author, author, message);
            //       const response = await handleMessages(reply || '', message, client);
            //       console.log(response)
            
            //       if (response) {
            //          cacheGroupMessage({ groupId: chat.id._serialized, user: author, name: author, text: message.body, reply: response, time });
            //       }
            //    }, Math.random() * 2000 + 1000); // Simulate typing delay of 1-3 seconds
            // } catch (error) {
            //    console.error('Error replying to message:', error);
            // }

            break;
      }

      return;
   }

   if (isGroup && (isMentioned || isReplyToMe) && !message.fromMe) {
      if (message.type === MessageTypes.TEXT) handleTextMessage(message, client, 'group');
   }

   else if (isPrivate && !message.fromMe) {
      if (message.type === MessageTypes.TEXT)
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