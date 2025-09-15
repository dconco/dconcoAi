import WhatsAppService from "@/utils/whatsappService";
import { WhatsAppMessage } from "@/types";
import { writeFileSync } from "fs";
import { CachedAPIMessageData, CachedAPIMessageInterface, CachedMessageData, CachedMessageInterface, QuotaData, UnreadMessageData, UnreadMessageInterface } from "../types/cache";
import { loadQuota, loadUnreadMessages, loadCachedMessages, quotaFilePath, unreadMessagesFilePath, cachedMessagesFilePath, loadCachedAPIMessages } from "./loadCaches";

/**
 * ========================================
 * Check the quota for sending messages.
 * ========================================
 */
export const checkQuota = (message: WhatsAppMessage|null|string, name: string | undefined) => {
   const whatsapp: WhatsAppService = new WhatsAppService();

   const quotaLimit = 8;
   const quota: QuotaData = loadQuota();

   if (quota.contacts && quota.contacts.length >= quotaLimit) {
      if (!message || typeof message === "string") return false;

      saveUnreadMessage({ message, name: name || '' });
      console.log(`Quota exceeded. Message from ${name || message.from} ignored.`);
      return false;
   }

   if (!message || typeof message === "string") return true;
   whatsapp.markAsRead(message?.id || '');
   return true;
}

/**
 * ========================================
 * Save the contact to the quota list.
 * ========================================
 */
export const saveQuota = (contact: string) => {
   try {
      const quota: QuotaData = loadQuota();

      if (!quota.contacts.includes(contact)) {
        quota.contacts.push(contact);
        
        // Use synchronous write to prevent race conditions
        writeFileSync(quotaFilePath, JSON.stringify(quota, null, 2), 'utf8');
        console.log(`Contact ${contact} added to quota. Total: ${quota.contacts.length}`);
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
export const saveUnreadMessage = ({ message, name }: UnreadMessageInterface) => {
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
export const cacheMessage = ({contact, text, name, reply}: CachedMessageInterface) => {
   try {
      const cachedMessages: CachedMessageData = loadCachedMessages();

      if (!cachedMessages[contact]) {
         cachedMessages[contact] = { name, messages: [] };
      }

      cachedMessages[contact].messages.push({ text, reply, timestamp: new Date().toISOString() });

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
export const cacheAPIMessage = ({contact, message, name}: CachedAPIMessageInterface) => {
   try {
      const cachedMessages: CachedAPIMessageData = loadCachedAPIMessages();

      if (!cachedMessages[contact]) {
         cachedMessages[contact] = { name, messages: [] };
      }

      cachedMessages[contact].messages.push({ message, timestamp: new Date().toISOString() });

      // Use synchronous write to prevent race conditions
      writeFileSync(cachedMessagesFilePath, JSON.stringify(cachedMessages, null, 2), 'utf8');
   } catch (error) {
      console.error('Error writing cached messages file:', error);
   }
}