import { config } from 'dotenv';
import { sendMessage } from "../controllers/messagesController";
import { loadUnreadMessages } from "../utils/loadCaches";
import { UnreadMessageData } from "../types/cache";
import { writeFileSync } from "fs";
import { join } from "path";

// Load environment variables
config();

const messages: UnreadMessageData = loadUnreadMessages();

// Function to process only the first unread message
const processFirstUnreadMessage = async () => {
   const contacts = Object.entries(messages);
   
   if (contacts.length === 0) {
      console.log('No unread messages to process');
      return;
   }

   // Get first contact with messages
   for (const [contact, { name, messages: contactMessages }] of contacts) {
      if (contactMessages.length > 0) {
         const firstMessage = contactMessages[0];
         
         try {
            console.log(`Processing message from ${name} (${contact})`);
            await sendMessage(name, firstMessage);
            
            // Remove the processed message
            contactMessages.shift(); // Remove first element
            
            // Update the file
            writeFileSync(
               join(__dirname, './unreadMessages.json'), 
               JSON.stringify(messages, null, 2), 
               'utf8'
            );
            
            console.log(`Message processed successfully. Remaining for ${contact}: ${contactMessages.length}`);
            return; // Exit after processing one message
            
         } catch (error) {
            console.error('Error processing message:', error);
            return;
         }
      }
   }
   
   console.log('No messages to process');
};

// Process the first unread message
processFirstUnreadMessage();