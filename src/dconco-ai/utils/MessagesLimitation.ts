import { Client } from "whatsapp-web.js"

export default async function MessagesLimitation(client: Client) {
   const eachMinuteLimit = 5 // max messages per minute

   const chats = await client.getChats()

   for (const chat of chats) {
      if (chat.isGroup) continue // Only limit private chats

      const messages = await chat.fetchMessages({ limit: eachMinuteLimit })
      
      messages.forEach(msg => {
         const timeDifference = Date.now() - msg.timestamp * 1000

         if (timeDifference < 0 && !msg.fromMe) {
            // Message is older than 1 minute, remove it from the array
            const index = messages.indexOf(msg)
            if (index > -1) {
               messages.splice(index, 1)
            }
         }
      })

      if (messages.length > eachMinuteLimit) {
         console.log(`Message limit exceeded in chat ${chat.id._serialized}. Skipping further processing.`)
         return true // Indicate that limit is exceeded
      }
   }
   return false // Indicate that limit is not exceeded
}