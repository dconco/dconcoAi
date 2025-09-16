import { CachedAPIMessageData, CachedMessageData, QuotaData, UnreadMessageData } from "@/types/cache";
import { readFileSync } from "fs";
import { join } from "path";

export const quotaFilePath = join(__dirname, '../cache/db/quota.json');
export const unreadMessagesFilePath = join(__dirname, '../cache/db/unreadMessages.json');
export const cachedMessagesFilePath = join(__dirname, '../cache/db/cachedMessages.json');
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
       return JSON.parse(data) as CachedMessageData;
   } catch (error) {
       console.log('Error reading cached messages file, initializing with empty data:', error);
       return {} as CachedMessageData;
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
