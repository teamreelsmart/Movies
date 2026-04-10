import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Movie } from '@/lib/models/Movie';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const limit = Number(request.nextUrl.searchParams.get('limit')) || 10;

    const movies = await Movie.find({ isTrending: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      movies,
      total: await Movie.countDocuments({ isTrending: true }),
    });
  } catch (error) {
    console.error('Trending movies error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending movies' },
      { status: 500 }
    );
  }
}
