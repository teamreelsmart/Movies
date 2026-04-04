import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Request } from '@/lib/models/Request';
import { getAuthPayload } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthPayload();
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    const requests = await Request.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Request.countDocuments();

    return NextResponse.json(
      {
        requests,
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
    console.error('Requests fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const data = await req.json();

    const request = new Request(data);
    await request.save();

    return NextResponse.json(request, { status: 201 });
  } catch (error) {
    console.error('Request creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create request' },
      { status: 500 }
    );
  }
}
