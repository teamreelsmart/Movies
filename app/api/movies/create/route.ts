import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Movie } from '@/lib/models/Movie';
import { generateSlug } from '@/lib/utils-server';
import { getAuthPayload } from '@/lib/auth';
import { sendTelegramNotification } from '@/lib/telegram';

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthPayload();
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const data = await req.json();

    // Generate slug from title
    const slug = generateSlug(data.title);

    // Check if slug already exists
    const existingMovie = await Movie.findOne({ slug });
    if (existingMovie) {
      return NextResponse.json(
        { error: 'Movie with this title already exists' },
        { status: 400 }
      );
    }

    const movie = new Movie({
      ...data,
      slug,
      views: 0,
    });

    await movie.save();

    // Send Telegram notification
    const movieUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/movie/${slug}`;
    const telegramSent = await sendTelegramNotification({
      title: data.title,
      imdbRating: data.imdbRating,
      releaseDate: data.releaseDate,
      genres: data.genres,
      language: data.language,
      runtime: data.runtime,
      qualityType: data.qualityType,
      posterUrl: data.posterUrl,
      movieUrl,
      type: data.type,
    });

    return NextResponse.json({
      ...movie.toObject(),
      telegramNotificationSent: telegramSent,
    }, { status: 201 });
  } catch (error) {
    console.error('Movie creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create movie' },
      { status: 500 }
    );
  }
}
