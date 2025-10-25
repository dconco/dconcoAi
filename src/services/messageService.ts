import Message, { IMessage } from '@/models/Message';
import GroupMessage, { IGroupMessage } from '@/models/GroupMessage';
import mongoose from 'mongoose';

export async function saveMessage(data: {
    contact: string;
    name: string;
    text: string;
    reply: string;
    messageId: string;
}): Promise<IMessage | null> {
    try {
        if (mongoose.connection.readyState !== 1) {
            console.log('⚠️ MongoDB not connected, skipping message save');
            return null;
        }
        const message = new Message(data);
        return await message.save();
    } catch (error) {
        console.error('Error saving message:', error);
        return null;
    }
}

export async function saveGroupMessage(data: {
    groupId: string;
    groupName: string;
    text: string;
    reply: string;
    user: string;
    userName?: string;
    messageId: string;
}): Promise<IGroupMessage | null> {
    try {
        if (mongoose.connection.readyState !== 1) {
            console.log('⚠️ MongoDB not connected, skipping group message save');
            return null;
        }
        const message = new GroupMessage(data);
        return await message.save();
    } catch (error) {
        console.error('Error saving group message:', error);
        return null;
    }
}

export async function getMessages(contact: string, limit: number = 20): Promise<IMessage[]> {
    try {
        if (mongoose.connection.readyState !== 1) {
            return [];
        }
        return await Message.find({ contact })
            .sort({ timestamp: -1 })
            .limit(limit)
            .exec();
    } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
}

export async function getGroupMessages(groupId: string, limit: number = 20): Promise<IGroupMessage[]> {
    try {
        if (mongoose.connection.readyState !== 1) {
            return [];
        }
        return await GroupMessage.find({ groupId })
            .sort({ timestamp: -1 })
            .limit(limit)
            .exec();
    } catch (error) {
        console.error('Error fetching group messages:', error);
        return [];
    }
}

export async function getMessageHistory(contact: string): Promise<{ text: string; reply: string }[]> {
    try {
        const messages = await getMessages(contact, 20);
        return messages.reverse().map(msg => ({
            text: msg.text,
            reply: msg.reply
        }));
    } catch (error) {
        return [];
    }
}

export async function getGroupMessageHistory(groupId: string): Promise<{ text: string; reply: string; user: string }[]> {
    try {
        const messages = await getGroupMessages(groupId, 20);
        return messages.reverse().map(msg => ({
            text: msg.text,
            reply: msg.reply,
            user: msg.userName || msg.user
        }));
    } catch (error) {
        return [];
    }
}