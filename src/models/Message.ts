import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
    contact: string;
    name: string;
    text: string;
    reply: string;
    messageId: string;
    timestamp: Date;
}

const MessageSchema: Schema = new Schema({
    contact: { type: String, required: true, index: true },
    name: { type: String, required: true },
    text: { type: String, required: true },
    reply: { type: String, required: true },
    messageId: { type: String, required: true, unique: true },
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model<IMessage>('Message', MessageSchema);