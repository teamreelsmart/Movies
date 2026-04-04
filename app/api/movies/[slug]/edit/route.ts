import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Movie } from '@/lib/models/Movie';
import { getAuthPayload } from '@/lib/auth';
import { generateSlug } from '@/lib/utils-server';

async function findMovieBySlug(rawSlug: string) {
  const decodedSlug = decodeURIComponent(rawSlug || '').trim();
  const normalizedSlug = generateSlug(decodedSlug);

  return Movie.findOne({
    $or: [
      { slug: decodedSlug },
      { slug: normalizedSlug },
      { slug: { $regex: `^${decodedSlug}$`, $options: 'i' } },
      { slug: { $regex: `^${normalizedSlug}$`, $options: 'i' } },
    ],
  });
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const auth = await getAuthPayload();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();
    const existing = await findMovieBySlug(slug);

    if (!existing) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }

    const movie = await Movie.findByIdAndUpdate(
      existing._id,
      {
        ...data,
        updatedAt: new Date(),
      },
      { new: true }
    );

    return NextResponse.json(movie);
  } catch (error) {
    console.error('Edit movie error:', error);
    return NextResponse.json(
      { error: 'Failed to update movie' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const auth = await getAuthPayload();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const existing = await findMovieBySlug(slug);

    if (!existing) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }

    await Movie.findByIdAndDelete(existing._id);

    return NextResponse.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    console.error('Delete movie error:', error);
    return NextResponse.json(
      { error: 'Failed to delete movie' },
      { status: 500 }
    );
  }
}
