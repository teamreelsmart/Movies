'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Send, Sparkles, Flame, Clapperboard } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MovieCard } from '@/components/MovieCard';
import { Button } from '@/components/ui/button';

interface Movie {
  _id: string;
  title: string;
  slug: string;
  posterUrl: string;
  imdbRating: number;
  type: 'movie' | 'series';
  views: number;
  genres: string[];
}

export default function Home() {
  const [newMovies, setNewMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [seriesItems, setSeriesItems] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const newRes = await fetch('/api/movies?sort=createdAt&limit=5');
        const newData = await newRes.json();
        setNewMovies(newData.movies || []);

        const trendingRes = await fetch('/api/movies?isTrending=true&limit=5');
        const trendingData = await trendingRes.json();
        setTrendingMovies(trendingData.movies || []);

        const seriesRes = await fetch('/api/movies?type=series&sort=createdAt&limit=10');
        const seriesData = await seriesRes.json();
        setSeriesItems(seriesData.movies || []);

        const allMovies = [...(newData.movies || []), ...(trendingData.movies || []), ...(seriesData.movies || [])];
        const uniqueGenres = Array.from(new Set(allMovies.flatMap((m: Movie) => m.genres))).slice(0, 6) as string[];
        setGenres(uniqueGenres);
      } catch (error) {
        console.error('Failed to fetch movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const totalViews = useMemo(
    () => [...newMovies, ...trendingMovies, ...seriesItems].reduce((sum, movie) => sum + (movie.views || 0), 0),
    [newMovies, trendingMovies, seriesItems],
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        <section className="px-4 pb-10 pt-8 sm:px-6 sm:pt-10 lg:px-8">
          <div className="container mx-auto max-w-7xl">
            <div className="liquid-glass overflow-hidden rounded-3xl border border-border/60 p-6 sm:p-8 lg:p-10">
              <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-end">
                <div>
                  <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    Fresh Streaming Picks
                  </p>
                  <h1 className="text-3xl font-black leading-tight text-foreground sm:text-4xl lg:text-5xl">
                    Discover your next <span className="text-primary">movie night</span> in seconds.
                  </h1>
                  <p className="mt-4 max-w-2xl text-sm text-foreground/70 sm:text-base">
                    New uploads, trending titles, and binge-worthy web series — all in one clean experience.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button asChild size="lg" className="rounded-xl">
                      <Link href="/movies">Browse Trending</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="rounded-xl border-primary/40 bg-transparent">
                      <Link href="/series">Explore Genres & Series</Link>
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  <div className="rounded-2xl border border-border/70 bg-card/70 p-4">
                    <p className="text-2xl font-bold text-foreground">{newMovies.length + trendingMovies.length + seriesItems.length}</p>
                    <p className="text-xs text-foreground/65">Active titles surfaced</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-card/70 p-4">
                    <p className="text-2xl font-bold text-foreground">{genres.length || 6}</p>
                    <p className="text-xs text-foreground/65">Popular genres</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-card/70 p-4">
                    <p className="text-2xl font-bold text-foreground">{totalViews.toLocaleString()}</p>
                    <p className="text-xs text-foreground/65">Views on featured catalog</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-gradient-to-r from-primary/15 to-accent/15 px-4 py-6 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-7xl">
            <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-3">
                <Send className="h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Join our Telegram Channel</p>
                  <p className="text-xs text-foreground/70">Get instant updates on new releases</p>
                </div>
              </div>
              <Button asChild size="sm" className="ml-4">
                <a href="https://t.me/orvixmovies" target="_blank" rel="noopener noreferrer">
                  Join
                </a>
              </Button>
            </div>
          </div>
        </section>

        {newMovies.length > 0 && (
          <section className="border-b border-border px-4 py-12 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-7xl rounded-2xl border border-border/60 bg-card/50 p-5 liquid-glass sm:p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="inline-flex items-center gap-2 text-2xl font-bold text-foreground">
                  <Clapperboard className="h-5 w-5 text-primary" /> Newly Added
                </h2>
                <Link href="/movies" className="text-sm text-primary hover:underline">
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {newMovies.map((movie) => (
                  <MovieCard key={movie._id} {...movie} />
                ))}
              </div>
            </div>
          </section>
        )}

        {trendingMovies.length > 0 && (
          <section className="border-b border-border px-4 py-12 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-7xl rounded-2xl border border-border/60 bg-card/50 p-5 liquid-glass sm:p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="inline-flex items-center gap-2 text-2xl font-bold text-foreground">
                  <Flame className="h-5 w-5 text-primary" /> Trending Now
                </h2>
                <Link href="/movies?sort=views" className="text-sm text-primary hover:underline">
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {trendingMovies.map((movie) => (
                  <MovieCard key={movie._id} {...movie} />
                ))}
              </div>
            </div>
          </section>
        )}

        {genres.length > 0 && (
          <section className="border-b border-border px-4 py-12 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-7xl rounded-2xl border border-border/60 bg-card/50 p-5 liquid-glass sm:p-6">
              <h2 className="mb-6 text-2xl font-bold text-foreground">Browse by Genre</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {genres.map((genre) => (
                  <Link
                    key={genre}
                    href={`/movies?genre=${encodeURIComponent(genre)}`}
                    className="group rounded-lg border border-border/70 bg-card/80 px-4 py-3 text-center font-medium text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:bg-primary/10 hover:shadow-lg"
                  >
                    {genre}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="border-b border-border px-4 py-12 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-7xl rounded-2xl border border-border/60 bg-card/50 p-5 liquid-glass sm:p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Web Series</h2>
              <Link href="/series" className="text-sm text-primary hover:underline">
                View All →
              </Link>
            </div>
            {seriesItems.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {seriesItems.map((movie) => (
                  <MovieCard key={movie._id} {...movie} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-card px-6 py-12 text-center">
                <p className="text-foreground/60">No series available yet</p>
              </div>
            )}
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-7xl">
            <div className="rounded-lg border border-primary/30 bg-gradient-to-br from-primary/20 to-accent/20 px-6 py-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground">Missing a Movie or Series?</h2>
              <p className="mb-6 text-foreground/70">Request your favorite content and we&apos;ll add it soon.</p>
              <Button asChild size="lg">
                <Link href="/request">Make a Request</Link>
              </Button>
            </div>
          </div>
        </section>

        {loading && (
          <section className="px-4 pb-12 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-7xl rounded-xl border border-border/70 bg-card/40 p-4 text-sm text-foreground/60">
              Loading latest catalog...
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
