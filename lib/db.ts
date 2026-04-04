import mongoose from 'mongoose';

let cached = global.mongoose as any;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  const mongoUrl = process.env.MONGODB_URL;
  if (!mongoUrl) {
    throw new Error('Please define the MONGODB_URL environment variable');
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(mongoUrl, opts).then((mongoose) => mongoose);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
