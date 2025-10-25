// Rate limiting based on message timestamps stored in memory
const messageTimestamps: Map<string, number[]> = new Map();
const MESSAGE_LIMIT = 5; // max messages per minute
const TIME_WINDOW = 120000; // 2 minutes in milliseconds

export default async function MessagesLimitation(chatId: string): Promise<boolean> {
   const now = Date.now();
   const timestamps = messageTimestamps.get(chatId) || [];
   
   // Remove timestamps older than 2 minutes
   const recentTimestamps = timestamps.filter(ts => now - ts < TIME_WINDOW);
   
   // Check if limit exceeded
   if (recentTimestamps.length >= MESSAGE_LIMIT) {
      console.log(`⚠️ Message limit exceeded in chat ${chatId}. User sent ${recentTimestamps.length} messages in the last 2 minutes.`);
      return true; // Limit exceeded
   }
   
   // Add current timestamp
   recentTimestamps.push(now);
   messageTimestamps.set(chatId, recentTimestamps);
   
   return false; // Limit not exceeded
}