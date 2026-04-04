import mongoose, { Document, Schema } from 'mongoose';

export interface IRequest extends Document {
  title: string;
  year: number;
  screenshotUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const requestSchema = new Schema<IRequest>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
    },
    screenshotUrl: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export const Request = mongoose.models.Request || mongoose.model('Request', requestSchema);
