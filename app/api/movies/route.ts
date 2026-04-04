import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Movie } from '@/lib/models/Movie';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');
    const genre = searchParams.get('genre');
    const language = searchParams.get('language');
    const sort = searchParams.get('sort') || 'createdAt';

    const skip = (page - 1) * limit;
    const filter: any = {};

    if (type) filter.type = type;
    if (genre) filter.genres = genre;
    if (language) filter.language = language;

    const movies = await Movie.find(filter)
      .sort({ [sort]: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Movie.countDocuments(filter);

    return NextResponse.json(
      {
        movies,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Movies fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movies' },
      { status: 500 }
    );
  }
}
