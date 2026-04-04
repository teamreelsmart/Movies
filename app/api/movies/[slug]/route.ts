import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Movie } from '@/lib/models/Movie';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const { slug } = await Promise.resolve(params);

    const movie = await Movie.findOne({ slug }).lean();

    if (!movie) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      );
    }

    // Increment views
    await Movie.updateOne({ slug }, { $inc: { views: 1 } });

    return NextResponse.json(movie, { status: 200 });
  } catch (error) {
    console.error('Movie fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movie' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const { slug } = await Promise.resolve(params);
    const data = await req.json();

    const movie = await Movie.findOneAndUpdate(
      { slug },
      data,
      { new: true }
    ).lean();

    if (!movie) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(movie, { status: 200 });
  } catch (error) {
    console.error('Movie update error:', error);
    return NextResponse.json(
      { error: 'Failed to update movie' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const { slug } = await Promise.resolve(params);

    const movie = await Movie.findOneAndDelete({ slug }).lean();

    if (!movie) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Movie deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Movie delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete movie' },
      { status: 500 }
    );
  }
}
