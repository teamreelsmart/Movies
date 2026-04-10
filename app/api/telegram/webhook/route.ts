import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Movie } from '@/lib/models/Movie';
import { BotUser } from '@/lib/models/BotUser';
import { copyTelegramMessage, isTelegramConfigured, sendTelegramText } from '@/lib/telegram';

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
}

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized telegram webhook request' }, { status: 401 });
}

function formatMovieLine(movie: { title: string; slug: string; type: string }) {
  return `• ${movie.title} (${movie.type})\n${getBaseUrl()}/movie/${movie.slug}`;
}

function getOwnerIds() {
  return (process.env.BOT_OWNER_IDS || process.env.BOT_OWNER_ID || '')
    .split(',')
    .map((id) => Number(id.trim()))
    .filter((id) => !Number.isNaN(id));
}

async function saveBotUser(message: any) {
  const chatId = message?.chat?.id;
  if (!chatId) return;

  await BotUser.findOneAndUpdate(
    { chatId },
    {
      chatId,
      username: message?.from?.username || '',
      firstName: message?.from?.first_name || '',
      lastName: message?.from?.last_name || '',
    },
    { upsert: true, new: true }
  );
}

async function handleBroadcast(message: any) {
  const ownerIds = getOwnerIds();
  const fromId = Number(message?.from?.id);
  const chatId = Number(message?.chat?.id);

  if (!ownerIds.includes(fromId)) {
    await sendTelegramText(chatId, 'Only bot owner can use /broadcast.');
    return;
  }

  const repliedMessage = message?.reply_to_message;
  if (!repliedMessage?.message_id) {
    await sendTelegramText(
      chatId,
      'Usage: reply to any message and type /broadcast to send that message to all bot users.'
    );
    return;
  }

  const users = await BotUser.find({ isBlocked: false }, { chatId: 1 }).lean();
  let success = 0;
  let failed = 0;

  for (const user of users) {
    try {
      await copyTelegramMessage(user.chatId, chatId, repliedMessage.message_id);
      success += 1;
    } catch (error) {
      failed += 1;
    }
  }

  await sendTelegramText(
    chatId,
    `Broadcast completed.\nDelivered: ${success}\nFailed: ${failed}\nTotal users: ${users.length}`
  );
}

async function handleCommand(message: any) {
  const chatId = Number(message?.chat?.id);
  const text: string = (message?.text || '').trim();
  if (!chatId || !text) return;

  if (text.startsWith('/broadcast')) {
    await handleBroadcast(message);
    return;
  }

  if (text === '/start') {
    await sendTelegramText(
      chatId,
      'Welcome to Movies Entertainment bot!\n\nCommands:\n/latest - last 5 uploads\n/search <name> - search movie/series\n/help - list commands\n\nOwner command:\nreply a message with /broadcast'
    );
    return;
  }

  if (text === '/help') {
    await sendTelegramText(
      chatId,
      'Available commands:\n/latest\n/search <keyword>\n/help\n\nOwner only:\nReply any message and type /broadcast to send it to all bot users.'
    );
    return;
  }

  if (text === '/latest') {
    const latest = await Movie.find({}, { title: 1, slug: 1, type: 1 })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    if (!latest.length) {
      await sendTelegramText(chatId, 'No movies/series found right now.');
      return;
    }

    const messageText = `Latest uploads:\n\n${latest.map(formatMovieLine).join('\n\n')}`;
    await sendTelegramText(chatId, messageText);
    return;
  }

  if (text.startsWith('/search ')) {
    const query = text.replace('/search ', '').trim();
    if (!query) {
      await sendTelegramText(chatId, 'Usage: /search <movie name>');
      return;
    }

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

    const messageText = `Search results for "${query}":\n\n${results.map(formatMovieLine).join('\n\n')}`;
    await sendTelegramText(chatId, messageText);
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

    await connectDB();

    const body = await request.json();
    const message = body?.message;

    if (!message) {
      return NextResponse.json({ ok: true });
    }

    await saveBotUser(message);
    await handleCommand(message);

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
    ownerCommand: 'Reply to a message with /broadcast',
  });
}
