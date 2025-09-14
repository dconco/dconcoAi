export declare const quotaFilePath: string;
export declare const unreadMessagesFilePath: string;
export declare const cachedMessagesFilePath: string;

export declare interface QuotaData {
   contacts: string[];
}

export declare interface UnreadMessage {
   contact: string;
   text: string;
   name: string;
}

export declare interface CachedMessageInterface {
   contact: string;
   text: string;
   name: string;
   reply: string;
}

export declare interface CachedMessageData {
   [contact: string]: {
      name: string;
      messages: { text: string; reply?: string; timestamp: string }[];
   };
}