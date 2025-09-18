import Message, { IMessage } from '@/models/Message';

export async function saveMessage(data: {
    contact: string;
    name: string;
    text: string;
    reply: string;
    messageId: string;
}): Promise<IMessage> {
    const message = new Message(data);
    return await message.save();
}

export async function getMessages(contact: string, limit: number = 10): Promise<IMessage[]> {
    return await Message.find({ contact })
        .sort({ timestamp: -1 })
        .limit(limit)
        .exec();
}

export async function getMessageHistory(contact: string): Promise<{ text: string; reply: string }[]> {
    const messages = await getMessages(contact, 10);
    return messages.reverse().map(msg => ({
        text: msg.text,
        reply: msg.reply
    }));
}