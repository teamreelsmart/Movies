# OrvixMovies - Full-Stack Movie Platform

A production-ready, full-featured movie and web series platform built with Next.js 14, TypeScript, MongoDB, and Tailwind CSS. Includes public frontend, admin panel, and Telegram bot integration.

## Features

- **Public Frontend**
  - Homepage with trending and newly added content
  - Browse movies and series by genre
  - Advanced search functionality
  - Detailed movie/series pages with downloads and episodes
  - User request system for content suggestions
  - Responsive mobile-first design

- **Admin Panel**
  - Secure JWT-based authentication
  - Add/edit/delete movies and series
  - Dynamic season and episode management
  - User requests management
  - Footer links configuration
  - Dashboard with statistics

- **Telegram Integration**
  - Auto-post new releases to Telegram channel
  - Includes poster image, title, and description
  - Direct link to content

- **Technical Features**
  - Server-side rendering with Next.js App Router
  - MongoDB with Mongoose ODM
  - RESTful API routes
  - Type-safe with TypeScript
  - Beautiful dark theme with blue/purple accents
  - Image optimization with Next.js Image component
  - Reusable component architecture

## Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **UI Components**: shadcn/ui
- **Icons**: lucide-react
- **Integration**: Telegram Bot API

## Project Structure

```
/app
  /api                 # REST API routes
    /auth             # Authentication endpoints
    /movies           # Movie CRUD operations
    /requests         # User requests
    /settings         # Settings management
  /admin              # Admin panel pages
    /login
    /movies
    /requests
    /settings
  /movie              # Public movie detail pages
  /movies             # Movies listing page
  /request            # Request submission page
  /series             # Series listing page
  
/components
  /admin              # Admin components
  # Public components
  Header.tsx
  Footer.tsx
  MovieCard.tsx
  SearchBox.tsx
  DownloadSection.tsx
  SeasonsSection.tsx
  ScreenshotsGallery.tsx
  RecommendedMovies.tsx

/lib
  /models            # Mongoose schemas
  db.ts              # Database connection
  auth.ts            # JWT utilities
  telegram.ts        # Telegram bot integration
  utils-server.ts    # Server utilities
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- MongoDB Atlas account (or self-hosted MongoDB)
- Telegram Bot Token and Channel ID

### Installation

1. **Clone and Install**
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Configure Environment Variables**
   
   Copy `.env.example` to `.env.local` and fill in your values:
   
   ```bash
   cp .env.example .env.local
   ```

   Required variables:
   - `MONGODB_URL`: Your MongoDB connection string
   - `JWT_SECRET`: Secret key for JWT tokens
   - `ADMIN_USERNAME`: Admin login username
   - `ADMIN_PASSWORD`: Admin login password
   - `BOT_TOKEN`: Telegram bot token
   - `CHANNEL_ID`: Telegram channel ID for notifications
   - `NEXT_PUBLIC_BASE_URL`: Your application URL
   - `TELEGRAM_WEBHOOK_SECRET` (optional but recommended): Secret token to validate Telegram webhook calls
   - `TELEGRAM_WEBHOOK_URL` (optional): Full webhook URL (fallback: `${NEXT_PUBLIC_BASE_URL}/api/telegram/webhook`)

3. **Run Development Server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin
   - Admin Credentials: Use the credentials from `.env.local`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout

### Movies
- `GET /api/movies` - List all movies/series
- `GET /api/movies/[slug]` - Get movie details
- `GET /api/movies/search` - Search movies
- `GET /api/movies/trending` - Get trending movies
- `POST /api/movies/create` - Create new movie (admin only)
- `PUT /api/movies/[slug]/edit` - Update movie (admin only)
- `DELETE /api/movies/[slug]/edit` - Delete movie (admin only)

### Requests
- `GET /api/requests` - Get all user requests (admin only)
- `POST /api/requests` - Submit new request

### Settings
- `GET /api/settings` - Get platform settings
- `PUT /api/settings` - Update settings (admin only)

### Telegram Webhook
- `GET /api/telegram/webhook` - Webhook health + supported commands
- `POST /api/telegram/webhook` - Telegram updates receiver (webhook endpoint)
- `POST /api/telegram/webhook/register` - Register webhook in Telegram (admin only)
- `GET /api/telegram/webhook/register` - Get current webhook info from Telegram (admin only)

## Database Schema

### Movies Collection
```typescript
{
  title: string;
  slug: string;          // Unique, auto-generated from title
  storyline: string;
  imdbRating: number;
  releaseDate: Date;
  genres: string[];
  language: string;
  runtime: string;
  qualityType: string;
  availableQualities: string[];
  type: "movie" | "series";
  posterUrl: string;
  screenshots: string[];
  downloadLinks: [{
    title: string;
    size: string;
    url: string;
  }];
  seasons: [{
    seasonNumber: number;
    episodes: [{
      episodeNumber: number;
      title: string;
      downloadLinks: [{...}];
    }];
  }];
  views: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Requests Collection
```typescript
{
  title: string;
  year: number;
  screenshotUrl: string;
  createdAt: Date;
}
```

### Settings Collection
```typescript
{
  footerLinks: [{
    name: string;
    url: string;
    icon: string;
  }];
}
```

## Admin Panel Features

### Dashboard
- View total movies, series, and requests
- Quick links to manage content

### Add Movie/Series
- Dynamic form with all required fields
- Add multiple download links
- For series: dynamically add seasons and episodes
- Preview before submission

### Manage Content
- List all movies with search and filters
- Edit existing content
- Delete movies/series
- Quick statistics

### Requests
- View all user-submitted requests
- Track user interest in specific content

### Settings
- Manage footer social links
- Add/remove Telegram and other social links
- Customize footer content

## Telegram Bot Integration

The platform automatically sends a notification to your configured Telegram channel when new content is added:

- **Message Format**:
  ```
  🎬 NEW RELEASE!
  
  Title: [Movie/Series Name]
  
  [Short Description]
  
  Watch now: [URL]
  ```

- Includes poster image
- Auto-generated short description from storyline

## Customization

### Theme Colors
Edit color tokens in `/app/globals.css`:
- Primary: Blue (`--primary: oklch(0.488 0.243 264.376)`)
- Accent: Orange (`--accent: oklch(0.645 0.246 16.439)`)
- Background: Dark (`--background: oklch(0.145 0 0)`)

### Typography
Currently using system fonts. To add custom fonts:
1. Update `/app/layout.tsx` with font imports
2. Update `/app/globals.css` with font variable definitions

## Performance Optimizations

- Server-side rendering for SEO
- Image optimization with Next.js Image component
- API route caching strategies
- Lazy loading for images and components
- Efficient database indexing

## Security Considerations

- JWT tokens for admin authentication
- HTTP-only cookies for session management
- Input validation on all API endpoints
- Protected admin routes with middleware
- Environment variables for sensitive data
- No sensitive data exposed to frontend

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## Troubleshooting

### MongoDB Connection Error
- Verify `MONGODB_URL` is correct
- Check IP whitelist in MongoDB Atlas
- Ensure network connectivity

### Admin Login Issues
- Verify `ADMIN_USERNAME` and `ADMIN_PASSWORD`
- Check `JWT_SECRET` is set
- Clear browser cookies and try again

### Telegram Notifications Not Working
- Verify `BOT_TOKEN` is valid
- Check `CHANNEL_ID` format (should start with -100)
- Ensure bot is added to channel with admin rights

## Future Enhancements

- User accounts and watchlist
- Rating and review system
- Episode streaming (if hosting video)
- Advanced analytics
- Social sharing integration
- Multi-language support
- Payment integration for premium content

## License

This project is provided as-is for commercial use.

## Support

For issues or questions, refer to the SETUP.md file for detailed configuration instructions.

---

Built with ❤️ using Next.js, MongoDB, and Tailwind CSS
