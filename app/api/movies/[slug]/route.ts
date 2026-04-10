import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Movie } from '@/lib/models/Movie';
import { generateSlug } from '@/lib/utils-server';

async function findMovieBySlug(rawSlug: string) {
  const decodedSlug = decodeURIComponent(rawSlug || '').trim();
  const normalizedSlug = generateSlug(decodedSlug);

  const movie = await Movie.findOne({
    $or: [
      { slug: decodedSlug },
      { slug: normalizedSlug },
      { slug: { $regex: `^${decodedSlug}$`, $options: 'i' } },
      { slug: { $regex: `^${normalizedSlug}$`, $options: 'i' } },
    ],
  }).lean();

  return movie;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const { slug } = await Promise.resolve(params);

    const movie = await findMovieBySlug(slug);

    if (!movie) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      );
    }

    // Increment views by _id to avoid slug format mismatch issues
    await Movie.updateOne({ _id: movie._id }, { $inc: { views: 1 } });

    return NextResponse.json(movie, { status: 200 });
  } catch (error) {
    console.error('Movies fetch error:', error);
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

    const existing = await findMovieBySlug(slug);
    if (!existing) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      );
    }

    const movie = await Movie.findByIdAndUpdate(existing._id, data, {
      new: true,
    }).lean();

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

    const existing = await findMovieBySlug(slug);
    if (!existing) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      );
    }

    await Movie.findByIdAndDelete(existing._id).lean();

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
