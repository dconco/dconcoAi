import mongoose from 'mongoose';
import { config } from 'dotenv';

config();

const connectDB = async (): Promise<void> => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        
        if (!mongoURI) {
            console.log('⚠️ MONGODB_URI not found in .env file');
            console.log('⚠️ Running without database - messages will not be saved');
            console.log('💡 Add MONGODB_URI to your .env file to enable database features');
            return;
        }

        console.log('🔄 Connecting to MongoDB...');
        const conn = await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        console.log(`📊 MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
        console.error('❌ MongoDB connection error:', error.message);
        console.log('⚠️ Running without database - messages will not be saved');
        // Don't exit, let app run without database
    }
};

export default connectDB;