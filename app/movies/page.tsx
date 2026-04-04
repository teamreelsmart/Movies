'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MovieCard } from '@/components/MovieCard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Movie {
  _id: string;
  title: string;
  slug: string;
  posterUrl: string;
  imdbRating: number;
  type: 'movie' | 'series';
  views: number;
  genres: string[];
  language: string;
}

function MoviesContent() {
  const searchParams = useSearchParams();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') || 'all');
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.get('language') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'createdAt');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('limit', '24');
        params.append('page', page.toString());
        params.append('sort', sortBy);
        params.append('type', 'movie');
        if (selectedGenre && selectedGenre !== 'all') params.append('genre', selectedGenre);
        if (selectedLanguage && selectedLanguage !== 'all') params.append('language', selectedLanguage);

        const res = await fetch(`/api/movies?${params}`);
        const data = await res.json();
        setMovies(data.movies || []);
        setTotal(data.pagination?.total || 0);

        // Extract unique values
        const allMovies = data.movies || [];
        const uniqueGenres = Array.from(
          new Set(allMovies.flatMap((m: Movie) => m.genres))
        ) as string[];
        const uniqueLanguages = Array.from(
          new Set(allMovies.map((m: Movie) => m.language))
        ) as string[];

        setGenres(uniqueGenres.slice(0, 10));
        setLanguages(uniqueLanguages.slice(0, 10));
      } catch (error) {
        console.error('Failed to fetch movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [page, sortBy, selectedGenre, selectedLanguage]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1">
        <div className="border-b border-border px-4 py-6 sm:px-6 lg:px-8">
          <div className="container max-w-7xl mx-auto">
            <h1 className="mb-6 text-3xl font-bold text-foreground">Movies</h1>

            {/* Filters */}
            <div className="grid gap-4 md:grid-cols-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-card border-border">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="createdAt">Latest</SelectItem>
                  <SelectItem value="views">Trending</SelectItem>
                  <SelectItem value="imdbRating">Top Rated</SelectItem>
                </SelectContent>
              </Select>

              {genres.length > 0 && (
                <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                  <SelectTrigger className="bg-card border-border">
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all">All Genres</SelectItem>
                    {genres.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {languages.length > 0 && (
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="bg-card border-border">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all">All Languages</SelectItem>
                    {languages.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="container max-w-7xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-foreground/60">Loading movies...</p>
              </div>
            ) : movies.length > 0 ? (
              <>
                <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {movies.map((movie) => (
                    <MovieCard key={movie._id} {...movie} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-2">
                  <Button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-foreground/60">
                    Page {page} of {Math.ceil(total / 24)}
                  </span>
                  <Button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= Math.ceil(total / 24)}
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-border bg-card px-6 py-12 text-center">
                <p className="text-foreground/60">No movies found with these filters</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function MoviesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MoviesContent />
    </Suspense>
  );
}
