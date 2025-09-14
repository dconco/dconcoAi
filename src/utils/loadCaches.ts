import { CachedMessageData, QuotaData, UnreadMessageData } from "@/types/cache";
import { readFileSync } from "fs";
import { join } from "path";

export const quotaFilePath = join(__dirname, '../cache/quota.json');
export const unreadMessagesFilePath = join(__dirname, '../cache/unreadMessages.json');
export const cachedMessagesFilePath = join(__dirname, '../cache/cachedMessages.json');

export const loadQuota = (): QuotaData => {
   try {
     const data = readFileSync(quotaFilePath, 'utf8');
     return JSON.parse(data) as QuotaData;
   } catch (error) {
     console.log('Error reading quota file, initializing with empty data:', error);
     return { contacts: [] } as QuotaData;
   }
};

export const loadUnreadMessages = () => {
   try {
      const data = readFileSync(unreadMessagesFilePath, 'utf8');
      return JSON.parse(data) as UnreadMessageData;
   } catch (error) {
      console.log('Error reading unread messages file, initializing with empty data:', error);
      return {} as UnreadMessageData;
   }
};

export const loadCachedMessages = () => {
   try {
       const data = readFileSync(cachedMessagesFilePath, 'utf8');
       return JSON.parse(data) as CachedMessageData;
   } catch (error) {
       console.log('Error reading cached messages file, initializing with empty data:', error);
       return {} as CachedMessageData;
   }
};
