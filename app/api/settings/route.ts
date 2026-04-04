import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Settings } from '@/lib/models/Settings';
import { getAuthPayload } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    let settings = await Settings.findOne().lean();

    if (!settings) {
      const newSettings = new Settings();
      settings = await newSettings.save();
    }

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
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

    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings(data);
    } else {
      Object.assign(settings, data);
    }

    await settings.save();

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
