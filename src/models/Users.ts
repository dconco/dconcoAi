import mongoose, { Document, Schema } from "mongoose";

export interface IUsers extends Document {
   contact: string;
   name?: string;
   timestamp: Date;
}

const UsersSchema: Schema = new Schema({
   contact: { type: String, required: true, unique: true, index: true },
   name: { type: String, required: false },
   timestamp: { type: Date, default: Date.now }
})

export default mongoose.model<IUsers>('Users', UsersSchema);