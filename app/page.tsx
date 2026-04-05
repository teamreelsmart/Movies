'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MovieCard } from '@/components/MovieCard';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import Link from 'next/link';

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
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // Fetch new movies
        const newRes = await fetch('/api/movies?sort=createdAt&limit=5');
        const newData = await newRes.json();
        setNewMovies(newData.movies || []);

        // Fetch trending movies
        const trendingRes = await fetch('/api/movies?isTrending=true&limit=5');
        const trendingData = await trendingRes.json();
        setTrendingMovies(trendingData.movies || []);

        // Extract unique genres
        const allMovies = [...(newData.movies || []), ...(trendingData.movies || [])];
        const uniqueGenres = Array.from(
          new Set(allMovies.flatMap((m: Movie) => m.genres))
        ).slice(0, 6) as string[];
        setGenres(uniqueGenres);
      } catch (error) {
        console.error('Failed to fetch movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1">
        {/* Telegram Banner */}
        <section className="border-b border-border bg-gradient-to-r from-primary/20 to-accent/20 px-4 py-6 sm:px-6 lg:px-8">
          <div className="container max-w-7xl mx-auto">
            <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-3">
                <Send className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Join our Telegram Channel</p>
                  <p className="text-xs text-foreground/70">Get instant updates on new releases</p>
                </div>
              </div>
              <Button asChild variant="default" size="sm" className="ml-4">
                <a href="https://t.me/orvixmovies" target="_blank" rel="noopener noreferrer">
                  Join
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* New Added Section */}
        {newMovies.length > 0 && (
          <section className="border-b border-border px-4 py-12 sm:px-6 lg:px-8">
            <div className="container max-w-7xl mx-auto">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Newly Added</h2>
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

        {/* Trending Section */}
        {trendingMovies.length > 0 && (
          <section className="border-b border-border px-4 py-12 sm:px-6 lg:px-8">
            <div className="container max-w-7xl mx-auto">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Trending Now</h2>
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

        {/* Genres Section */}
        {genres.length > 0 && (
          <section className="border-b border-border px-4 py-12 sm:px-6 lg:px-8">
            <div className="container max-w-7xl mx-auto">
              <h2 className="mb-6 text-2xl font-bold text-foreground">Browse by Genre</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {genres.map((genre) => (
                  <Link
                    key={genre}
                    href={`/movies?genre=${encodeURIComponent(genre)}`}
                    className="group rounded-lg border border-border bg-card px-4 py-3 text-center font-medium text-foreground transition-all hover:border-primary hover:bg-primary/10"
                  >
                    {genre}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Series Section */}
        <section className="border-b border-border px-4 py-12 sm:px-6 lg:px-8">
          <div className="container max-w-7xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Web Series</h2>
              <Link href="/series" className="text-sm text-primary hover:underline">
                View All →
              </Link>
            </div>
            {trendingMovies.filter(m => m.type === 'series').length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {trendingMovies.filter(m => m.type === 'series').map((movie) => (
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

        {/* CTA Section */}
        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="container max-w-7xl mx-auto">
            <div className="rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 px-6 py-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground">Missing a Movie or Series?</h2>
              <p className="mb-6 text-foreground/70">Request your favorite content and we&apos;ll add it soon</p>
              <Button asChild size="lg">
                <Link href="/request">Make a Request</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
