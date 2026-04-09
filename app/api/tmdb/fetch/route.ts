import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload } from '@/lib/auth';

type TmdbMediaType = 'movie' | 'tv';

interface TmdbApiResponse {
  title?: string;
  name?: string;
  overview?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  genres?: Array<{ id: number; name: string }>;
  original_language?: string;
  runtime?: number;
  episode_run_time?: number[];
  poster_path?: string;
}

function parseTmdbLink(link: string): { type: TmdbMediaType; id: number } | null {
  const pattern = /themoviedb\.org\/(movie|tv)\/(\d+)/i;
  const match = link.match(pattern);
  if (!match) return null;

  return {
    type: match[1].toLowerCase() as TmdbMediaType,
    id: Number(match[2]),
  };
}

function normalizeLanguage(code?: string) {
  if (!code) return '';
  return code.length === 2 ? code.toUpperCase() : code;
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthPayload();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await req.json();
    const parsed = parseTmdbLink(String(url || '').trim());

    if (!parsed || !parsed.id) {
      return NextResponse.json(
        { error: 'Invalid TMDB link. Use a link like https://www.themoviedb.org/movie/12345 or /tv/12345' },
        { status: 400 }
      );
    }

    if (!process.env.TMDB_API_KEY) {
      return NextResponse.json(
        { error: 'TMDB_API_KEY is not configured on server' },
        { status: 500 }
      );
    }

    const tmdbUrl = `https://api.themoviedb.org/3/${parsed.type}/${parsed.id}?api_key=${process.env.TMDB_API_KEY}&language=en-US`;
    const response = await fetch(tmdbUrl, { cache: 'no-store' });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'TMDB lookup failed' },
        { status: response.status }
      );
    }

    const data = (await response.json()) as TmdbApiResponse;
    const runtime = parsed.type === 'movie'
      ? data.runtime
      : Array.isArray(data.episode_run_time) ? data.episode_run_time[0] : undefined;

    const mapped = {
      tmdbId: parsed.id,
      tmdbType: parsed.type === 'tv' ? 'series' : 'movie',
      title: data.title || data.name || '',
      storyline: data.overview || '',
      imdbRating: typeof data.vote_average === 'number' ? Number(data.vote_average.toFixed(1)) : 0,
      releaseDate: data.release_date || data.first_air_date || '',
      genres: (data.genres || []).map((g) => g.name).filter(Boolean),
      language: normalizeLanguage(data.original_language),
      runtime: runtime ? `${runtime} min` : '',
      qualityType: '1080p',
      availableQualities: ['1080p'],
      posterUrl: data.poster_path ? `https://image.tmdb.org/t/p/w780${data.poster_path}` : '',
    };

    return NextResponse.json(mapped, { status: 200 });
  } catch (error) {
    console.error('TMDB fetch failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch TMDB details' },
      { status: 500 }
    );
  }
}
