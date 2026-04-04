import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  footerLinks: Array<{
    name: string;
    url: string;
    icon: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    footerLinks: {
      type: [
        {
          name: String,
          url: String,
          icon: String,
        },
      ],
      default: [
        {
          name: 'Telegram',
          url: 'https://t.me/orvixmovies',
          icon: 'send',
        },
      ],
    },
  },
  { timestamps: true }
);

export const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
