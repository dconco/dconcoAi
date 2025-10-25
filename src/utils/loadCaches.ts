import {
   CachedAPIMessageData,
   CachedGroupMessageData,
   CachedMessageData,
   UnreadMessageData,
   QuotaData,
} from "@/types/cache";
import { readFileSync } from "fs";
import { writeFile } from "fs/promises";
import { join } from "path";

export const quotaFilePath = join(__dirname, '../cache/db/quota.json');
export const unreadMessagesFilePath = join(__dirname, '../cache/db/unreadMessages.json');
export const cachedMessagesFilePath = join(__dirname, '../cache/db/cachedMessages.json');
export const cachedGroupMessagesFilePath = join(__dirname, '../cache/db/cachedGroupMessages.json');
export const cachedAPIMessagesFilePath = join(__dirname, '../cache/db/cachedAPIMessages.json');

export const loadQuota = (): QuotaData[] => {
   try {
      const data = readFileSync(quotaFilePath, 'utf8');
      return JSON.parse(data) as QuotaData[];
   } catch (error) {
      console.log('Error reading quota file, initializing with empty data:', error);
      return [] as QuotaData[];
   }
};

export const loadUnreadMessages = (): UnreadMessageData => {
   try {
      const data = readFileSync(unreadMessagesFilePath, 'utf8');
      return JSON.parse(data) as UnreadMessageData;
   } catch (error) {
      console.log('Error reading unread messages file, initializing with empty data:', error);
      return {} as UnreadMessageData;
   }
};

export const loadCachedMessages = (): CachedMessageData => {
   try {
      const data = readFileSync(cachedMessagesFilePath, 'utf8');
      const parsedData = JSON.parse(data) as CachedMessageData;

      // Cleans up old messages if they exceed 10 and does not block the return
      for (const number in parsedData) {
         if (parsedData[number]?.messages.length > 10) {
         parsedData[number].messages = parsedData[number].messages.slice(-10);

         writeFile(cachedMessagesFilePath, JSON.stringify(parsedData, null, 3))
            .catch(err => console.error('Failed to update cached messages file:', err));
         }
      }

      return parsedData;
   } catch (error) {
      console.log('Error reading cached messages file, initializing with empty data:', error);
      return {} as CachedMessageData;
   }
};

export const loadCachedGroupMessages = (): CachedGroupMessageData => {
   try {
      const data = readFileSync(cachedGroupMessagesFilePath, 'utf8');
      const parsedData = JSON.parse(data) as CachedGroupMessageData;

      // Cleans up old messages asynchronously if they exceed 10 and does not block the return
      for (const groupId in parsedData) {
         if (parsedData[groupId]?.messages.length > 10) {
            parsedData[groupId].messages = parsedData[groupId].messages.slice(-10);

            writeFile(cachedGroupMessagesFilePath, JSON.stringify(parsedData, null, 3))
               .catch(err => console.error('Failed to update cached group messages file:', err));
         }
      }

      return parsedData;
   } catch (error) {
      console.log('Error reading cached group messages file, initializing with empty data:', error);
      return {} as CachedGroupMessageData;
   }
};

export const loadCachedAPIMessages = (): CachedAPIMessageData => {
   try {
      const data = readFileSync(cachedAPIMessagesFilePath, 'utf8');
      return JSON.parse(data) as CachedAPIMessageData;
   } catch (error) {
      console.log('Error reading cached API messages file, initializing with empty data:', error);
      return {} as CachedAPIMessageData;
   }
};
