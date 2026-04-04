import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export interface AuthPayload {
  username: string;
  iat: number;
  exp: number;
}

export async function generateToken(username: string): Promise<string> {
  return jwt.sign({ username }, JWT_SECRET, {
    expiresIn: '7d',
  });
}

export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function validateCredentials(username: string, password: string): Promise<boolean> {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_token');
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('admin_token')?.value || null;
}

export async function getAuthPayload(): Promise<AuthPayload | null> {
  const token = await getAuthToken();
  if (!token) return null;
  return verifyToken(token);
}
