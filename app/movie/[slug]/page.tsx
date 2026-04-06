'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { DownloadSection } from '@/components/DownloadSection';
import { ScreenshotsGallery } from '@/components/ScreenshotsGallery';
import { RecommendedMovies } from '@/components/RecommendedMovies';
import { MovieDetailSkeleton } from '@/components/MovieCardSkeleton';
import { Star, Calendar, Clock, Globe } from 'lucide-react';

interface DownloadLink {
  title: string;
  size: string;
  url: string;
}

interface Episode {
  episodeNumber: number;
  title: string;
  downloadLinks: DownloadLink[];
}

interface Season {
  seasonNumber: number;
  episodes: Episode[];
}

interface Movie {
  _id: string;
  title: string;
  slug: string;
  storyline: string;
  imdbRating: number;
  releaseDate: string;
  genres: string[];
  language: string;
  runtime: string;
  qualityType: string;
  availableQualities: string[];
  type: 'movie' | 'series';
  posterUrl: string;
  screenshots: string[];
  downloadLinks: DownloadLink[];
  seasons: Season[];
  views: number;
}

export default function MovieDetailPage() {
  const params = useParams<{ slug?: string }>();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([]);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const fetchMovie = async () => {
      try {
        const safeSlug = encodeURIComponent(slug);
        const res = await fetch(`/api/movies/${safeSlug}`);
        if (!res.ok) {
          throw new Error('Movie not found');
        }
        const data = await res.json();
        setMovie(data);

        // Fetch related movies by genre
        if (data.genres && data.genres.length > 0) {
          const genreParam = data.genres[0];
          const relRes = await fetch(
            `/api/movies?genre=${encodeURIComponent(genreParam)}&limit=6`
          );
          const relData = await relRes.json();
          setRelatedMovies(
            (relData.movies || []).filter((m: Movie) => m.slug !== data.slug).slice(0, 5)
          );
        }
      } catch (error) {
        console.error('Failed to fetch movie:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 container max-w-7xl mx-auto px-4 py-12">
          <MovieDetailSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-foreground/60">Movie or Series not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent z-10"></div>
          <div className="relative h-72 sm:h-[28rem] w-full bg-muted overflow-hidden">
            {movie.screenshots && movie.screenshots.length > 0 ? (
              <Image
                src={movie.screenshots[0]}
                alt={movie.title}
                fill
                className="object-cover"
              />
            ) : (
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                fill
                className="object-cover"
              />
            )}
          </div>

          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-4 pb-10 pt-16">
            <div className="relative h-56 w-40 overflow-hidden rounded-2xl border border-white/35 bg-white/10 shadow-2xl backdrop-blur-xl sm:h-72 sm:w-52">
              <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-white/5 to-transparent" />
              <Image
                src={movie.posterUrl}
                alt={`${movie.title} poster`}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="container max-w-7xl mx-auto">
            <div className="grid gap-8 md:grid-cols-4">
              {/* Poster */}
              <div className="hidden md:block">
                <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={movie.posterUrl}
                    alt={movie.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Details */}
              <div className="md:col-span-3">
                <h1 className="mb-4 text-4xl font-bold text-foreground">{movie.title}</h1>

                {/* Meta Info */}
                <div className="mb-6 flex flex-wrap gap-4">
                  {movie.imdbRating > 0 && (
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{movie.imdbRating.toFixed(1)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span>{new Date(movie.releaseDate).getFullYear()}</span>
                  </div>
                  {movie.runtime && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <span>{movie.runtime}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <span>{movie.language}</span>
                  </div>
                </div>

                {/* Genres */}
                {movie.genres.length > 0 && (
                  <div className="mb-6 flex flex-wrap gap-2">
                    {movie.genres.map((genre) => (
                      <Link
                        key={genre}
                        href={`/movies?genre=${encodeURIComponent(genre)}`}
                        className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
                      >
                        {genre}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Storyline */}
                <div className="mb-8">
                  <h2 className="mb-3 text-lg font-semibold text-foreground">Storyline</h2>
                  <p className="text-foreground/80 leading-relaxed">{movie.storyline}</p>
                </div>

                {/* Quality Info */}
                {movie.availableQualities.length > 0 && (
                  <div className="mb-8">
                    <h2 className="mb-3 text-lg font-semibold text-foreground">Available Qualities</h2>
                    <div className="flex flex-wrap gap-2">
                      {movie.availableQualities.map((quality) => (
                        <span
                          key={quality}
                          className="rounded-lg border border-primary bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                        >
                          {quality}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Download Section */}
            <div className="mt-8 space-y-4 border-t border-border pt-8">
              <h3 className="text-lg font-semibold text-foreground">Download</h3>
              <DownloadSection links={movie.downloadLinks} />
            </div>

            {/* Screenshots */}
            {movie.screenshots && movie.screenshots.length > 0 && (
              <div className="mt-8 border-t border-border pt-8">
                <ScreenshotsGallery screenshots={movie.screenshots} title={movie.title} />
              </div>
            )}
          </div>
        </div>

        {/* Recommended Movies */}
        <div className="border-t border-border px-4 py-12 sm:px-6 lg:px-8">
          <div className="container max-w-7xl mx-auto">
            <RecommendedMovies genres={movie.genres} currentMovieSlug={movie.slug} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
