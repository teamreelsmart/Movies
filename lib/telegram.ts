const BOT_TOKEN = process.env.BOT_TOKEN || '';
const CHANNEL_ID = process.env.CHANNEL_ID || '';
const BOT_DOWNLOAD_LINK =
  process.env.BOT_DOWNLOAD_LINK || 'https://telegram.me/MoviesProOBot?start=Neon-7614593734';

function getTelegramApiUrl(method: string) {
  return `https://api.telegram.org/bot${BOT_TOKEN}/${method}`;
}

export function isTelegramConfigured() {
  return Boolean(BOT_TOKEN);
}

async function callTelegramApi(method: string, payload: Record<string, any>) {
  if (!BOT_TOKEN) {
    throw new Error('Telegram BOT_TOKEN is not configured');
  }

  const response = await fetch(getTelegramApiUrl(method), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telegram API ${method} failed: ${body}`);
  }

  return response.json();
}

export async function sendTelegramText(chatId: string | number, text: string) {
  return callTelegramApi('sendMessage', {
    chat_id: chatId,
    text,
    disable_web_page_preview: false,
  });
}

export async function copyTelegramMessage(targetChatId: string | number, fromChatId: string | number, messageId: number) {
  return callTelegramApi('copyMessage', {
    chat_id: targetChatId,
    from_chat_id: fromChatId,
    message_id: messageId,
  });
}

export async function setTelegramWebhook(url: string, secretToken?: string) {
  return callTelegramApi('setWebhook', {
    url,
    ...(secretToken ? { secret_token: secretToken } : {}),
    drop_pending_updates: false,
    allowed_updates: ['message'],
  });
}

export async function getTelegramWebhookInfo() {
  return callTelegramApi('getWebhookInfo', {});
}

interface TelegramNotificationPayload {
  title: string;
  imdbRating?: number;
  releaseDate?: string | Date;
  genres?: string[];
  language?: string;
  runtime?: string;
  qualityType?: string;
  posterUrl: string;
  movieUrl: string;
  type: 'movie' | 'series';
}

function formatReleaseDate(value?: string | Date) {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function buildTelegramCaption(payload: TelegramNotificationPayload) {
  return [
    `<b>🎬 Title:</b> <b>${payload.title}</b>`,
    `<b>⭐ IMDb Rating:</b> <b>${payload.imdbRating ?? 'N/A'}</b>`,
    `<b>📅 Release Date:</b> <b>${formatReleaseDate(payload.releaseDate)}</b>`,
    `<b>🎭 Genre:</b> <b>${payload.genres?.length ? payload.genres.join(', ') : 'N/A'}</b>`,
    `<b>🌐 Language:</b> <b>${payload.language || 'N/A'}</b>`,
    `<b>⏳ Run Time:</b> <b>${payload.runtime || 'N/A'}</b>`,
    `<b>🍿 Quality Type:</b> <b>${payload.qualityType || 'N/A'}</b>`,
    '',
    `<blockquote><b>Powered By: @TheOrviX & @OrvixMovies</b></blockquote>`,
  ].join('\n');
}

function buildInlineKeyboard(movieUrl: string) {
  return {
    inline_keyboard: [
      [
        { text: '🎬 Watch on Website', url: movieUrl },
        { text: '⬇️ Download via Bot', url: BOT_DOWNLOAD_LINK },
      ],
    ],
  };
}

export async function sendTelegramNotification(payload: TelegramNotificationPayload) {
  if (!BOT_TOKEN || !CHANNEL_ID) {
    console.warn('Telegram bot credentials not configured');
    return false;
  }

  try {
    const caption = buildTelegramCaption(payload);
    const keyboard = buildInlineKeyboard(payload.movieUrl);

    const formData = new FormData();
    formData.append('chat_id', CHANNEL_ID);
    formData.append('photo', payload.posterUrl);
    formData.append('caption', caption);
    formData.append('parse_mode', 'HTML');
    formData.append('reply_markup', JSON.stringify(keyboard));

    const response = await fetch(getTelegramApiUrl('sendPhoto'), {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Failed to send Telegram photo, falling back to text message:', errorBody);

      await callTelegramApi('sendMessage', {
        chat_id: CHANNEL_ID,
        text: caption,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
        reply_markup: keyboard,
      });

      return true;
    }

    return true;
  } catch (error) {
    console.error('Telegram notification error:', error);
    return false;
  }
}
