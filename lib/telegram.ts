const BOT_TOKEN = process.env.BOT_TOKEN || '';
const CHANNEL_ID = process.env.CHANNEL_ID || '';

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

    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,
      {
        method: 'POST',
        body: formData,
      }
    );

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
