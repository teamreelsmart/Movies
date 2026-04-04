import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Movie } from '@/lib/models/Movie';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';

    if (q.length < 2) {
      return NextResponse.json(
        { results: [] },
        { status: 200 }
      );
    }

    const movies = await Movie.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { genres: { $regex: q, $options: 'i' } },
      ],
    })
      .select('title slug posterUrl')
      .limit(10)
      .lean();

    return NextResponse.json(
      { results: movies },
      { status: 200 }
    );
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
