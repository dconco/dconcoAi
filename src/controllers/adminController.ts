import { Request, Response } from 'express';
import Message from '@/models/Message';
import Users from '@/models/Users';

export const getStats = async (_: Request, res: Response) => {
    try {
        const messageCount = await Message.countDocuments();
        const userCount = await Users.countDocuments();
        const recentMessages = await Message.find().sort({ timestamp: -1 }).limit(10);
        
        res.json({
            success: true,
            data: {
                messageCount,
                userCount,
                recentMessages
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
};

export const getMessages = async (req: Request, res: Response) => {
    try {
        const { contact } = req.params;
        const messages = await Message.find({ contact }).sort({ timestamp: -1 }).limit(50);
        res.json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
};

export const getAllUsers = async (_: Request, res: Response) => {
    try {
        const users = await Users.find().sort({ updatedAt: -1 });
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
};