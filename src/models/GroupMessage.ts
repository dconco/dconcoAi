import mongoose, { Schema, Document } from 'mongoose';

export interface IGroupMessage extends Document {
    groupId: string;
    groupName: string;
    text: string;
    reply: string;
    user: string;
    userName?: string;
    messageId: string;
    timestamp: Date;
}

const GroupMessageSchema: Schema = new Schema({
    groupId: { type: String, required: true, index: true },
    groupName: { type: String, required: true },
    text: { type: String, required: true },
    reply: { type: String, required: true },
    user: { type: String, required: true },
    userName: { type: String },
    messageId: { type: String, required: true, unique: true },
    timestamp: { type: Date, default: Date.now, index: true }
});

// Index for faster queries
GroupMessageSchema.index({ groupId: 1, timestamp: -1 });

export default mongoose.model<IGroupMessage>('GroupMessage', GroupMessageSchema);
