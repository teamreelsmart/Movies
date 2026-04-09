# OrvixMovies - Full-Stack Movie Platform

A complete, production-ready movie and series platform built with Next.js 14, TypeScript, MongoDB, and Telegram bot integration.

## Features

### Frontend
- Responsive dark-themed UI with blue/purple accents
- Homepage with Telegram banner, new releases, trending, and genre browsing
- Movie/Series listing pages with filtering and pagination
- Detailed movie pages with downloads, episodes, and related content
- User request system for content suggestions
- Live search functionality

### Admin Panel
- Secure JWT-based authentication
- Dashboard with statistics
- Add/Edit/Delete movies and series
- Dynamic season and episode management
- Request management
- Footer settings editor

### Backend
- RESTful API with Node.js/Next.js
- MongoDB with Mongoose ODM
- JWT authentication for admin
- Trending system based on view count
- Search functionality

### Telegram Integration
- Automatic notifications when new content is added
- Posts poster image, title, and description to channel
- Direct link to website

## Installation

### 1. Clone and Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_secret_key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_password
BOT_TOKEN=your_telegram_bot_token
CHANNEL_ID=your_telegram_channel_id
NEXT_PUBLIC_BASE_URL=https://your-domain.com
TELEGRAM_WEBHOOK_SECRET=any_long_random_secret
TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/telegram/webhook
TMDB_API_KEY=your_tmdb_v3_api_key
TMDB_ACCESS_TOKEN=optional_tmdb_v4_read_access_token
```

### 3. MongoDB Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a cluster and database
3. Get your connection string
4. Add it to `.env.local` as `MONGODB_URL`

### 4. Telegram Bot Setup

1. Create a bot with @BotFather on Telegram
2. Get your bot token
3. Create a channel and make the bot an admin
4. Get your channel ID (use @userinfobot to find it)
5. Add bot env values to `.env.local`
6. Set `NEXT_PUBLIC_BASE_URL` or explicit `TELEGRAM_WEBHOOK_URL`
7. (Recommended) set `TELEGRAM_WEBHOOK_SECRET` for secure webhook verification
8. Login as admin and call `POST /api/telegram/webhook/register` once to register webhook

Bot webhook command behavior:
- `/start`: welcome + command menu
- `/help`: command usage help
- `/latest`: sends latest 5 uploaded movies/series from MongoDB
- `/search <keyword>`: searches title and returns top matches with links

## Running the Project

### Development

```bash
npm run dev
# Server runs on http://localhost:3000
```

### Production Build

```bash
npm run build
npm run start
```

## Project Structure

```
/app
  /api
    /auth          # Authentication endpoints
    /movies        # Movie CRUD operations
    /requests      # User requests
    /settings      # Site settings
  /admin           # Admin panel pages
  /movie           # Movie detail pages
  /movies          # Movies listing
  /series          # Series listing
  /request         # Request submission
  page.tsx         # Homepage

/components
  /admin           # Admin components
  Header.tsx       # Navigation header
  Footer.tsx       # Footer with settings
  MovieCard.tsx    # Movie card component

/lib
  auth.ts          # JWT authentication
  db.ts            # MongoDB connection
  telegram.ts      # Telegram bot integration
  models/          # Mongoose schemas
    Movie.ts
    Request.ts
    Settings.ts

/middleware.ts     # Route protection
```

## API Documentation

### Authentication

**POST /api/auth/login**
- Request: `{ username: string, password: string }`
- Response: `{ token: string, message: string }`

**POST /api/auth/logout**
- Response: `{ message: string }`

### Movies

**GET /api/movies**
- Query params: `page`, `limit`, `type`, `genre`, `language`, `sort`
- Returns paginated movies with metadata

**POST /api/movies/create**
- Requires: Authentication header
- Body: Complete movie object with all fields
- Triggers: Telegram notification

**GET /api/movies/[slug]**
- Returns single movie details
- Side effect: Increments view count

**PUT /api/movies/[slug]**
- Updates movie (requires auth)

**DELETE /api/movies/[slug]**
- Deletes movie (requires auth)

**GET /api/movies/search**
- Query: `q` (search string)
- Returns: Top 10 matching movies

### Requests

**GET /api/requests**
- Requires: Authentication
- Returns: Paginated user requests

**POST /api/requests**
- Body: `{ title: string, year: number, screenshotUrl?: string }`

### Settings

**GET /api/settings**
- Returns: Current site settings

**PUT /api/settings**
- Requires: Authentication
- Body: `{ footerLinks: [...] }`

### Telegram Webhook

**GET /api/telegram/webhook**
- Returns: Webhook status + supported commands

**POST /api/telegram/webhook**
- Telegram webhook endpoint for incoming bot updates
- Validates `x-telegram-bot-api-secret-token` when `TELEGRAM_WEBHOOK_SECRET` is set

**POST /api/telegram/webhook/register**
- Requires: Admin authentication
- Registers webhook URL at Telegram Bot API using `TELEGRAM_WEBHOOK_URL` or `NEXT_PUBLIC_BASE_URL`

**GET /api/telegram/webhook/register**
- Requires: Admin authentication
- Returns current Telegram webhook info

#### Supported Bot Commands
- `/start`
- `/help`
- `/latest`
- `/search <keyword>`


## Admin Panel

### Access
- **URL**: `/admin/login`
- **Default Credentials**:
  - Username: `admin`
  - Password: `admin123`
  - ⚠️ Change these in production!

### Features
- **Dashboard**: View statistics
- **Manage Movies**: Add, edit, delete movies
- **Manage Series**: Add seasons and episodes
- **View Requests**: See user content requests
- **Settings**: Manage footer links and site config

## Database Schema

### Movies Collection
```javascript
{
  title: String,
  slug: String (unique),
  storyline: String,
  imdbRating: Number,
  releaseDate: Date,
  genres: [String],
  language: String,
  runtime: String,
  qualityType: String,
  availableQualities: [String],
  type: 'movie' | 'series',
  posterUrl: String,
  screenshots: [String],
  downloadLinks: [{
    title: String,
    size: String,
    url: String
  }],
  seasons: [{
    seasonNumber: Number,
    episodes: [{
      episodeNumber: Number,
      title: String,
      downloadLinks: [...]
    }]
  }],
  views: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Requests Collection
```javascript
{
  title: String,
  year: Number,
  screenshotUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Settings Collection
```javascript
{
  footerLinks: [{
    name: String,
    url: String,
    icon: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## Customization

### Colors
Edit `app/globals.css` to change the theme:
- `--background`: Dark background (#0B0F1A)
- `--primary`: Blue accent
- `--accent`: Purple/orange accent

### Telegram Channel
Update the channel link in `/components/Footer.tsx`

### Admin Credentials
Change in `.env.local`:
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy with one click

### Other Platforms

Ensure Node.js 18+ and add environment variables to your hosting platform.

## Security Notes

1. Change default admin credentials immediately
2. Use strong JWT_SECRET in production
3. Keep MongoDB connection string private
4. Use HTTPS in production
5. Implement rate limiting for API endpoints
6. Validate and sanitize all user inputs
7. Keep dependencies updated

## Troubleshooting

### "MongoDB connection failed"
- Check MONGODB_URL format
- Ensure IP whitelist in MongoDB Atlas includes your server
- Verify database exists

### "Telegram notification not sent"
- Verify BOT_TOKEN and CHANNEL_ID
- Ensure bot is admin in channel
- Check bot has permission to post
- For webhook mode, verify TELEGRAM_WEBHOOK_SECRET + TELEGRAM_WEBHOOK_URL
- Hit `GET /api/telegram/webhook/register` to inspect webhook status

### "Admin login not working"
- Clear browser cookies
- Check admin credentials in `.env.local`
- Verify JWT_SECRET is set

### "Movie not found on detail page"
- Check movie slug exists in database
- Verify MongoDB is connected
- Check browser console for errors

## Performance Tips

1. Use image CDN for poster/screenshot URLs
2. Enable API caching with revalidateTag
3. Implement Redis for session storage
4. Use ISR for static pages
5. Compress images before upload

## Future Enhancements

- User accounts and favorites
- Comment/rating system
- Email notifications
- Advanced search filters
- Video streaming integration
- Social sharing
- Mobile app (React Native)
- Multi-language support

## Support

For issues or questions, refer to:
- Next.js Docs: https://nextjs.org/docs
- MongoDB Docs: https://docs.mongodb.com
- Telegram Bot Docs: https://core.telegram.org/bots

## License

MIT License - Feel free to use for personal or commercial projects.
