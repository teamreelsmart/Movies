'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MovieCard } from '@/components/MovieCard';
import { Button } from '@/components/ui/button';
import { Download, Star, Calendar, Clock, Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

export default function MovieDetailPage({ params }: { params: { slug: string } }) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([]);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await fetch(`/api/movies/${params.slug}`);
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
            (relData.movies || []).filter((m: Movie) => m.slug !== params.slug).slice(0, 5)
          );
        }
      } catch (error) {
        console.error('Failed to fetch movie:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-foreground/60">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-foreground/60">Movie not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  const currentSeason = movie.seasons?.find((s) => s.seasonNumber === selectedSeason);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10"></div>
          <div className="relative h-64 sm:h-96 w-full bg-muted overflow-hidden">
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
          </div>
        </div>

        {/* Download Section */}
        <div className="border-t border-border bg-card/50 px-4 py-12 sm:px-6 lg:px-8">
          <div className="container max-w-7xl mx-auto">
            <h2 className="mb-8 text-2xl font-bold text-foreground">Download</h2>

            {movie.type === 'movie' ? (
              // Movie Downloads
              <div className="space-y-4">
                {movie.downloadLinks.length > 0 ? (
                  movie.downloadLinks.map((link, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:border-primary transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-foreground">{link.title}</p>
                        <p className="text-sm text-foreground/60">{link.size}</p>
                      </div>
                      <Button asChild size="sm">
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </a>
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-foreground/60">No download links available yet</p>
                )}
              </div>
            ) : (
              // Series Downloads
              <>
                {movie.seasons && movie.seasons.length > 0 && (
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Select Season
                    </label>
                    <Select
                      value={selectedSeason.toString()}
                      onValueChange={(v) => setSelectedSeason(parseInt(v))}
                    >
                      <SelectTrigger className="w-full md:w-64 bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {movie.seasons.map((season) => (
                          <SelectItem key={season.seasonNumber} value={season.seasonNumber.toString()}>
                            Season {season.seasonNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {currentSeason ? (
                  <div className="space-y-4">
                    {currentSeason.episodes.map((episode) => (
                      <div key={episode.episodeNumber} className="rounded-lg border border-border bg-card p-4">
                        <div className="mb-3">
                          <p className="font-semibold text-foreground">
                            Episode {episode.episodeNumber}: {episode.title}
                          </p>
                        </div>
                        <div className="space-y-2">
                          {episode.downloadLinks.length > 0 ? (
                            episode.downloadLinks.map((link, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between rounded bg-background p-3"
                              >
                                <div>
                                  <p className="text-sm font-medium text-foreground">{link.title}</p>
                                  <p className="text-xs text-foreground/60">{link.size}</p>
                                </div>
                                <Button asChild size="sm" variant="outline">
                                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                                    <Download className="h-3 w-3" />
                                  </a>
                                </Button>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-foreground/60">No downloads available</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-foreground/60">No episodes available</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Screenshots Gallery */}
        {movie.screenshots && movie.screenshots.length > 1 && (
          <div className="border-t border-border px-4 py-12 sm:px-6 lg:px-8">
            <div className="container max-w-7xl mx-auto">
              <h2 className="mb-8 text-2xl font-bold text-foreground">Screenshots</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {movie.screenshots.map((screenshot, idx) => (
                  <div key={idx} className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={screenshot}
                      alt={`${movie.title} screenshot ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Related Movies */}
        {relatedMovies.length > 0 && (
          <div className="border-t border-border px-4 py-12 sm:px-6 lg:px-8">
            <div className="container max-w-7xl mx-auto">
              <h2 className="mb-8 text-2xl font-bold text-foreground">You Might Also Like</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {relatedMovies.map((relatedMovie) => (
                  <MovieCard key={relatedMovie._id} {...relatedMovie} />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
