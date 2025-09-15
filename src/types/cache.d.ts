import { WhatsAppMessage } from "@/types";

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

export declare interface CachedAPIMessageData {
   [contact: string]: {
      name: string | undefined;
      messages: { message: string; timestamp: string }[];
   };
}

export declare interface UnreadMessageData {
   [contact: string]: {
      name: string;
      messages: WhatsAppMessage[];
   };
}

export declare interface UnreadMessageInterface {
   message: WhatsAppMessage;
   name: string;
}

export declare interface CachedAPIMessageInterface {
   contact: string;
   message: string;
   name: string | undefined;
}