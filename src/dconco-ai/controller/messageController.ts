import { getGroupMessageHistory, getMessageHistory } from "@/services/messageService"
import { Client, GroupChat, Message, MessageTypes } from "whatsapp-web.js"
import handleStickerMessage from "@/dconco-ai/helper/handleStickerMessage"
import handleImageMessage from "@/dconco-ai/helper/handleImageMessage"
import handleTextMessage from "@/dconco-ai/helper/handleTextMessage"
import MessagesLimitation from "../utils/MessagesLimitation"
import { style } from "@/dconco-ai"

export default async function messageController(message: Message, client: Client) {
   const isGroup = message.from.endsWith('@g.us')
   const isPrivate = message.from.endsWith('@c.us') || message.from.endsWith('@s.whatsapp.net')

   // Check if message is a reply to my message
   const isReplyToMe = message.hasQuotedMsg && 
                     (await message.getQuotedMessage()).fromMe

   // Check if I am mentioned in the message
   const myNumber = client.info.wid.user
   const mentions = await message.getMentions()
   const isMentioned = mentions.some(mention => mention.id.user === myNumber)

   if (isPrivate) {
      // Get chat ID for rate limiting
      const chatId = message.from;
      if (await MessagesLimitation(chatId)) return; // Skip if message limit exceeded
   }

   if (message.fromMe && (message.body.startsWith('!') || message.body.startsWith('ai'))) {
      let msgBody = message.body.slice(1).trim().toLowerCase()
      if (message.body.startsWith('ai')) msgBody = msgBody.slice(1).trim();

      switch (msgBody) {
         case 'ping':
            const responses = ['pong', 'pong! 🏓', 'got it!', 'received ✓']
            const randomResponse = responses[Math.floor(Math.random() * responses.length)]

            message.reply(style(randomResponse))
            break

         case /^tag\b/i.test(msgBody) ? msgBody : '':
            const raw = msgBody.trim()
            if (!/^tag\b/i.test(raw)) return

            let helloMessage = [
               "Hello everyone! 👋",
               "Hey folks! Just wanted to say hi to all of you! 😊",
               "Greetings to all! Hope you're having a great day! 🌟",
               "Hi all! Just dropping by to say hello! 🙌",
               "Salutations! Wishing you all a fantastic day ahead! 🎉"
            ]

            // Extract optional message and flags
            let args = raw.replace(/^tag\b\s*/i, "").trim()
            const onlyAdmins = /(^|\s)--admin(\s|$)/i.test(args)
            const silentTag = /(^|\s)--silent(\s|$)/i.test(args)
            
            if (onlyAdmins) {
               args = args.replace(/(^|\s)--admin(\s|$)/i, " ").trim()

               helloMessage = [
                  "Hello admins! 👋",
                  "Hey admin folks! Just wanted to say hi to all of you! 😊",
                  "Greetings to all admins! Hope you're having a great day! 🌟",
                  "Hi admin all! Just dropping by to say hello! 🙌",
                  "Salutations admins! Wishing you all a fantastic day ahead! 🎉"
               ]
            }
            
            if (silentTag) {
               args = args.replace(/(^|\s)--silent(\s|$)/i, " ").trim()
            }

            const chat = await message.getChat()
            if (!chat.isGroup) {
               await message.reply("This only works in group chats.")
               return
            }

            const groupChat = chat as GroupChat
            const participants = groupChat.participants

            const self = (client.info.wid._serialized)
            const filteredParticipants = participants.filter((p) => {
               if (p.id._serialized === self) return false
               if (onlyAdmins && !p.isAdmin && !p.isSuperAdmin) return false
               return true
            })

            if (filteredParticipants.length === 0) {
               await message.reply(
                  onlyAdmins
                  ? "No other admins found to mention (except me, myself and i)."
                  : "No other participants found to mention (except me, myself and i).",
               )
               return
            }

            const mentions = filteredParticipants.map((p) => p.id._serialized)
            const total = mentions.length
            const baseText =
               helloMessage[Math.floor(Math.random() * helloMessage.length)]
            const prefixMessage = args.length > 0 ? args : baseText

            if (silentTag) {
               // Silent tag: mention everyone at once with invisible text
               // Using empty string or zero-width characters to make it nearly invisible
               const messageText = args.length > 0 ? args : baseText // "\u200E\u200B" // Zero-width chars or custom message
               await message.reply(messageText, undefined, { mentions })
            } else {
               // Normal visible tag: batch to prevent rate limiting
               const batchSize = 30

               for (let i = 0; i < total; i += batchSize) {
                  const batchMentions = mentions.slice(i, i + batchSize)
                  const mentionText = batchMentions
                     .map((jid) => `@${jid.split("@")[0]}`)
                     .join(" ")

                  const messageText = i === 0 ? `${prefixMessage}\n\n${mentionText}` : mentionText

                  await message.reply(messageText, undefined, { mentions: batchMentions })

                  const min = 2000
                  const max = 6000
                  const randomMs = Math.floor(Math.random() * (max - min + 1)) + min
                  await new Promise(resolve => setTimeout(resolve, randomMs))
               }
            }
            break

         case 'history':
            try {
               const chatId = message.from
               const isGroup = chatId.endsWith('@g.us')
               
               // Get history from database
               const history = isGroup 
                  ? await getGroupMessageHistory(chatId)
                  : await getMessageHistory(chatId)

               if (history.length === 0) {
                  message.reply(style('No message history found in database.'))
                  return
               }

               // Format the history
               const formattedHistory = history.map((msg: any) => ({
                  text: msg.text,
                  reply: msg.reply
               }))

               const historyText = JSON.stringify(formattedHistory, null, 3)
               message.reply(style(historyText))
            } catch (e) {
               console.error('Error fetching history from database:', e)
               message.reply(style('Error fetching history from database'))
            }

            break

         default:
            if (message.type === MessageTypes.TEXT) handleTextMessage(message, client, isGroup ? 'group' : 'private')
            if (message.type === MessageTypes.IMAGE) handleImageMessage(message, client, isGroup ? 'group' : 'private')
            if (message.type === MessageTypes.STICKER) handleStickerMessage(message, client, isGroup ? 'group' : 'private')

            break
      }

      return
   }

   if (isGroup && (isMentioned || isReplyToMe || message.body.startsWith('!') || message.body.startsWith('ai')) && !message.fromMe) {
      if (message.type === MessageTypes.TEXT) handleTextMessage(message, client, 'group')
      if (message.type === MessageTypes.IMAGE) handleImageMessage(message, client, 'group')
      if (message.type === MessageTypes.STICKER) handleStickerMessage(message, client, 'group')
   }

   else if (isPrivate && !message.fromMe) {
      if (message.type === MessageTypes.TEXT) handleTextMessage(message, client, 'private')
      if (message.type === MessageTypes.IMAGE) handleImageMessage(message, client, 'private')
      if (message.type === MessageTypes.STICKER) handleStickerMessage(message, client, 'private')
   }

   return
}