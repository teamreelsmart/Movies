import { NextResponse } from 'next/server';
import { getAuthPayload } from '@/lib/auth';
import { getTelegramWebhookInfo, isTelegramConfigured, setTelegramWebhook } from '@/lib/telegram';

function getWebhookUrl() {
  if (process.env.TELEGRAM_WEBHOOK_URL) {
    return process.env.TELEGRAM_WEBHOOK_URL;
  }

  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return `${process.env.NEXT_PUBLIC_BASE_URL}/api/telegram/webhook`;
  }

  return null;
}

export async function POST() {
  try {
    const auth = await getAuthPayload();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isTelegramConfigured()) {
      return NextResponse.json({ error: 'BOT_TOKEN is not configured' }, { status: 500 });
    }

    const webhookUrl = getWebhookUrl();
    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'Please set TELEGRAM_WEBHOOK_URL or NEXT_PUBLIC_BASE_URL' },
        { status: 400 }
      );
    }

    const secret = process.env.TELEGRAM_WEBHOOK_SECRET || undefined;
    const result = await setTelegramWebhook(webhookUrl, secret);

    return NextResponse.json({
      message: 'Webhook registered successfully',
      webhookUrl,
      telegramResponse: result,
    });
  } catch (error) {
    console.error('Webhook register error:', error);
    return NextResponse.json({ error: 'Failed to register webhook' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const auth = await getAuthPayload();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isTelegramConfigured()) {
      return NextResponse.json({ error: 'BOT_TOKEN is not configured' }, { status: 500 });
    }

    const info = await getTelegramWebhookInfo();
    return NextResponse.json(info);
  } catch (error) {
    console.error('Webhook info error:', error);
    return NextResponse.json({ error: 'Failed to fetch webhook info' }, { status: 500 });
  }
}
