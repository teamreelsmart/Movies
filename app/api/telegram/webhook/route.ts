import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Movie } from '@/lib/models/Movie';
import { isTelegramConfigured, sendTelegramText } from '@/lib/telegram';

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
}

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized telegram webhook request' }, { status: 401 });
}

function formatMovieLine(movie: { title: string; slug: string; type: string }) {
  return `• ${movie.title} (${movie.type})\n${getBaseUrl()}/movie/${movie.slug}`;
}

async function handleCommand(chatId: number, text: string) {
  const command = text.trim();

  if (command === '/start') {
    await sendTelegramText(
      chatId,
      'Welcome to Movies Entertainment bot!\n\nCommands:\n/latest - last 5 uploads\n/search <name> - search movie/series\n/help - list commands'
    );
    return;
  }

  if (command === '/help') {
    await sendTelegramText(
      chatId,
      'Available commands:\n/latest\n/search <keyword>\n/help\n\nBot works by reading your command and responding from the movie database.'
    );
    return;
  }

  if (command === '/latest') {
    await connectDB();
    const latest = await Movie.find({}, { title: 1, slug: 1, type: 1 })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    if (!latest.length) {
      await sendTelegramText(chatId, 'No movies/series found right now.');
      return;
    }

    const message = `Latest uploads:\n\n${latest.map(formatMovieLine).join('\n\n')}`;
    await sendTelegramText(chatId, message);
    return;
  }

  if (command.startsWith('/search ')) {
    const query = command.replace('/search ', '').trim();
    if (!query) {
      await sendTelegramText(chatId, 'Usage: /search <movie name>');
      return;
    }

    await connectDB();
    const results = await Movie.find(
      { title: { $regex: query, $options: 'i' } },
      { title: 1, slug: 1, type: 1 }
    )
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    if (!results.length) {
      await sendTelegramText(chatId, `No results for "${query}".`);
      return;
    }

    const message = `Search results for "${query}":\n\n${results.map(formatMovieLine).join('\n\n')}`;
    await sendTelegramText(chatId, message);
    return;
  }

  await sendTelegramText(chatId, 'Unknown command. Type /help to see available commands.');
}

export async function POST(request: NextRequest) {
  try {
    if (!isTelegramConfigured()) {
      return NextResponse.json({ error: 'Telegram BOT_TOKEN is not configured' }, { status: 500 });
    }

    const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET || '';
    if (expectedSecret) {
      const receivedSecret = request.headers.get('x-telegram-bot-api-secret-token') || '';
      if (receivedSecret !== expectedSecret) {
        return unauthorized();
      }
    }

    const body = await request.json();
    const chatId: number | undefined = body?.message?.chat?.id;
    const text: string | undefined = body?.message?.text;

    if (!chatId || !text) {
      return NextResponse.json({ ok: true });
    }

    await handleCommand(chatId, text);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ error: 'Failed to process telegram webhook' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: 'Telegram webhook is active. Use POST for telegram updates.',
    commands: ['/start', '/help', '/latest', '/search <keyword>'],
  });
}
