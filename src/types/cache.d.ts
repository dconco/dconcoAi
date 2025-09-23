import { WhatsAppMessage } from "@/types";

export declare const quotaFilePath: string;
export declare const unreadMessagesFilePath: string;
export declare const cachedMessagesFilePath: string;

export declare interface QuotaData {
   contact: string;
   timestamp: string;
}

export declare interface UnreadMessage {
   contact: string;
   text: string;
   name: string;
}

export declare interface CachedMessageInterface {
   contact: string;
   name: string;
   text: string;
   reply: string;
   messageId: string;
}

export declare interface CachedGroupMessageInterface {
   groupId: string;
   user: string;
   name: string;
   text: string;
   reply: string;
   time?: Date;
}

export declare interface CachedMessageData {
   [contact: string]: {
      name: string;
      messages: {
         text: string;
         reply?: string;
         timestamp?: string;
         messageId?: string;
      }[];
   };
}

export declare interface CachedGroupMessageData {
   [groupId: string]: {
      name: string;
      messages: {
         user: string;
         text: string;
         reply?: string;
         timestamp?: string;
      }[];
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

export declare interface UsersInterface {
   contact: string;
   name: string | undefined;
}
