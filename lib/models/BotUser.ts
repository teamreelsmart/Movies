import mongoose, { Document, Schema } from 'mongoose';

export interface IBotUser extends Document {
  chatId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const botUserSchema = new Schema<IBotUser>(
  {
    chatId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    username: String,
    firstName: String,
    lastName: String,
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const BotUser = mongoose.models.BotUser || mongoose.model('BotUser', botUserSchema);
