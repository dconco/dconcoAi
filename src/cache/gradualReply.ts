import { config } from 'dotenv';
import { sendMessage } from "../controllers/messagesController";
import { loadUnreadMessages } from "../utils/loadCaches";
import { UnreadMessageData } from "../types/cache";
import { writeFileSync } from "fs";
import { join } from "path";

// Load environment variables
config();

const messages: UnreadMessageData = loadUnreadMessages();

// Function to process all messages from the first contact with timeout
const processFirstContactMessages = async () => {
   const contacts = Object.entries(messages);
   
   if (contacts.length === 0) {
      console.log('No unread messages to process');
      return;
   }

   // Get the first contact with messages
   const [contact, { name, messages: contactMessages }] = contacts[0];
   
   if (contactMessages.length === 0) {
      console.log(`No messages for contact ${contact}`);
      return;
   }

   console.log(`Processing ${contactMessages.length} messages from ${name} (${contact})`);

   // Process all messages for this contact with 5s delay
   for (let i = 0; i < contactMessages.length; i++) {
      const message = contactMessages[i];
      
      try {
         console.log(`Processing message ${i + 1}/${contactMessages.length} from ${name}`);
         await sendMessage(name, message);
         
         console.log(`Message ${i + 1} processed successfully`);
         
         // Wait 5 seconds before processing next message (except for the last one)
         if (i < contactMessages.length - 1) {
            console.log('Waiting 5 seconds before next message...');
            await new Promise(resolve => setTimeout(resolve, 5000));
         }
         
      } catch (error) {
         console.error(`Error processing message ${i + 1}:`, error);
         break; // Stop processing if there's an error
      }
   }

   // Remove this contact from unread messages after processing all their messages
   delete messages[contact];
   
   // Update the file
   writeFileSync(join(__dirname, './db/unreadMessages.json'), JSON.stringify(messages, null, 2), 'utf8');
   
   console.log(`All messages from ${name} (${contact}) processed and removed from queue`);
};

// Process all messages from the first contact
processFirstContactMessages();