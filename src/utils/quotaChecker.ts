import { WhatsAppMessage } from "@/types";
import { writeFile } from "fs";
import WhatsAppService from "./whatsappService";
import { CachedMessageData, CachedMessageInterface, QuotaData, UnreadMessage } from "../types/cache";
import { loadQuota, loadUnreadMessages, loadCachedMessages, quotaFilePath, unreadMessagesFilePath, cachedMessagesFilePath } from "./loadCaches";

/**
 * ========================================
 * Check the quota for sending messages.
 * =======================================
 */
export const checkQuota = (message: WhatsAppMessage, name: string | undefined) => {
   const whatsapp: WhatsAppService = new WhatsAppService();

   const quotaLimit = 8;
   const quota: QuotaData = loadQuota();

   if (quota.contacts && quota.contacts.length >= quotaLimit) {
      saveUnreadMessage({ contact: message.from, text: message.text?.body || '', name: name || '' });
      throw new Error('Quota exceeded. Please try again later.');
   }

   whatsapp.markAsRead(message.id);
   console.log('Current quota:', quota.contacts ? quota.contacts.length : 0, 'Limit:', quotaLimit);
}

/**
 * ========================================
 * Save the contact to the quota list.
 * ========================================
 */
export const saveQuota = (contact: string) => {
   const quota: QuotaData = loadQuota();

   if (!quota.contacts.includes(contact)) {
     quota.contacts.push(contact);
   }

   writeFile(quotaFilePath, JSON.stringify(quota, null, 2), (err) => {
     if (err) {
       console.error('Error writing quota file:', err);
     }
   });
}

/**
 * ========================================
 * Save unread message to the unread messages list.
 * ========================================
 */
export const saveUnreadMessage = ({contact, text, name}: UnreadMessage) => {
   const unreadMessages: CachedMessageData = loadUnreadMessages();

   if (!unreadMessages[contact]) {
      unreadMessages[contact] = { name, messages: [] };
   }

   unreadMessages[contact].messages.push({ text, timestamp: new Date().toISOString() });

   writeFile(unreadMessagesFilePath, JSON.stringify(unreadMessages, null, 2), (err) => {
      if (err) {
        console.error('Error writing unread messages file:', err);
      }
   });
}

/**
 * ========================================
 * Cache message to local file.
 * ========================================
 */
export const cacheMessage = ({contact, text, name, reply}: CachedMessageInterface) => {
   const cachedMessages: CachedMessageData = loadCachedMessages();

   if (!cachedMessages[contact]) {
      cachedMessages[contact] = { name, messages: [] };
   }

   cachedMessages[contact].messages.push({ text, reply, timestamp: new Date().toISOString() });

   writeFile(cachedMessagesFilePath, JSON.stringify(cachedMessages, null, 2), (err) => {
      if (err) {
        console.error('Error writing cached messages file:', err);
      }
   });
}