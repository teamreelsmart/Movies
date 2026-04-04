const BOT_TOKEN = process.env.BOT_TOKEN || '';
const CHANNEL_ID = process.env.CHANNEL_ID || '';

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

export async function sendTelegramNotification(
  title: string,
  storyline: string,
  posterUrl: string,
  movieUrl: string,
  type: 'movie' | 'series'
) {
  if (!BOT_TOKEN || !CHANNEL_ID) {
    console.warn('Telegram bot credentials not configured');
    return false;
  }

  try {
    const message = `
🎬 New ${type === 'movie' ? 'Movie' : 'Series'} Added!

📌 <b>${title}</b>

📝 ${storyline.substring(0, 200)}...

🔗 <a href="${movieUrl}">Watch / Download</a>
`.trim();

    const formData = new FormData();
    formData.append('chat_id', CHANNEL_ID);
    formData.append('photo', posterUrl);
    formData.append('caption', message);
    formData.append('parse_mode', 'HTML');

    const response = await fetch(getTelegramApiUrl('sendPhoto'), {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      console.error('Failed to send Telegram message:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Telegram notification error:', error);
    return false;
  }
}
