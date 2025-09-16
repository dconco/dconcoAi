import WhatsAppService from "@/utils/whatsappService";
import { join } from "path";
import { WhatsAppMessage } from "@/types";
import { readFileSync, writeFileSync } from "fs";
import { CachedAPIMessageData, CachedAPIMessageInterface, CachedMessageData, CachedMessageInterface, QuotaData, UnreadMessageData, UnreadMessageInterface, UsersInterface } from "../types/cache";
import { loadQuota, loadUnreadMessages, loadCachedMessages, quotaFilePath, unreadMessagesFilePath, cachedMessagesFilePath, loadCachedAPIMessages, cachedAPIMessagesFilePath } from "./loadCaches";
import ReplyUnreadMessages from "./gradualReply";

/**
 * ========================================
 * Remove expired quota entries (24+ hours old)
 * ========================================
 */
export const cleanExpiredQuota = (): void => {
   try {
      const quota: QuotaData[] = loadQuota();
      const now = Date.now();
      const filtered = quota.filter(({ timestamp }) => 
         now - new Date(timestamp).getTime() < 24 * 60 * 60 * 1000
      );
      
      if (filtered.length !== quota.length) {
         writeFileSync(quotaFilePath, JSON.stringify(filtered, null, 2), 'utf8');
         console.log(`Removed ${quota.length - filtered.length} expired quota entries`);
         ReplyUnreadMessages();
      }
   } catch (error) {
      console.error('Error cleaning quota:', error);
   }
}

/**
 * ========================================
 * Check the quota for sending messages.
 * ========================================
 */
export const checkQuota = async (message: WhatsAppMessage|null|string, name: string | undefined): Promise<boolean> => {
   const whatsapp: WhatsAppService = new WhatsAppService();

   cleanExpiredQuota();
   
   const quotaLimit = 8;
   const quota: QuotaData[] = loadQuota();

   if (quota && quota.length >= quotaLimit) {
      if (!message || typeof message === "string") return false;

      saveUnreadMessage({ message, name: name || '' });
      console.log(`Quota exceeded. Message from ${name || message.from} ignored.`);
      return false;
   }

   if (!message || typeof message === "string") return true;
   await whatsapp.markAsRead(message?.id || '');
   return true;
}

/**
 * ========================================
 * Save the contact to the quota list.
 * ========================================
 */
export const saveQuota = (contact: string): void => {
   try {
      const quota: QuotaData[] = loadQuota();
      const existingContact = quota.find(({ contact: c }) => c === contact);

      if (!existingContact) {
        quota.push({ contact, timestamp: new Date().toISOString() });
        
        // Use synchronous write to prevent race conditions
        writeFileSync(quotaFilePath, JSON.stringify(quota, null, 2), 'utf8');
        console.log(`Contact ${contact} added to quota. Total: ${quota.length}`);
      }
   } catch (error) {
      console.error('Error writing quota file:', error);
   }
}

/**
 * ========================================
 * Save unread message to the unread messages list.
 * ========================================
 */
export const saveUnreadMessage = ({ message, name }: UnreadMessageInterface): void => {
   try {
      const unreadMessages: UnreadMessageData = loadUnreadMessages();

      if (!unreadMessages[message.from]) {
         unreadMessages[message.from] = { name, messages: [] };
      }

      unreadMessages[message.from].messages.push(message);

      // Use synchronous write to prevent race conditions
      writeFileSync(unreadMessagesFilePath, JSON.stringify(unreadMessages, null, 2), 'utf8');
   } catch (error) {
      console.error('Error writing unread messages file:', error);
   }
}

/**
 * ========================================
 * Cache message to local file.
 * ========================================
 */
export const cacheMessage = ({contact, text, name, reply, messageId}: CachedMessageInterface): void => {
   try {
      const cachedMessages: CachedMessageData = loadCachedMessages();

      if (!cachedMessages[contact]) {
         cachedMessages[contact] = { name, messages: [] };
      }

      cachedMessages[contact].messages.push({ text, reply, messageId, timestamp: new Date().toISOString() });

      // Use synchronous write to prevent race conditions
      writeFileSync(cachedMessagesFilePath, JSON.stringify(cachedMessages, null, 2), 'utf8');
   } catch (error) {
      console.error('Error writing cached messages file:', error);
   }
}

/**
 * ========================================
 * Cache message coming from API to local file.
 * ========================================
 */
export const cacheAPIMessage = ({contact, message, name}: CachedAPIMessageInterface): void => {
   try {
      const cachedMessages: CachedAPIMessageData = loadCachedAPIMessages();

      if (!cachedMessages[contact]) {
         cachedMessages[contact] = { name, messages: [] };
      }

      cachedMessages[contact].messages.push({ message, timestamp: new Date().toISOString() });

      // Use synchronous write to prevent race conditions
      writeFileSync(cachedAPIMessagesFilePath, JSON.stringify(cachedMessages, null, 2), 'utf8');
   } catch (error) {
      console.error('Error writing cached messages file:', error);
   }
}

export const saveUsers = ({contact, name}: UsersInterface): void => {
   try {
      const users = JSON.parse(readFileSync(join(__dirname, '../cache/db/users.json'), 'utf8')) as UsersInterface[];
      const existingUser = users.find(user => user.contact === contact);

      if (existingUser) {
         if (existingUser.name === name) {
            return; // No update needed
         }
         existingUser.name = name;
      } else {
         users.push({ contact, name });
      }
      writeFileSync(join(__dirname, '../cache/db/users.json'), JSON.stringify(users, null, 2), 'utf8');
   } catch (error) {
      console.error('Error writing users file:', error);
   }
}
