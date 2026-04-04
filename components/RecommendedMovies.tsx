'use client';

import { useEffect, useState } from 'react';
import { MovieCard } from './MovieCard';

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

interface RecommendedMoviesProps {
  genres: string[];
  currentMovieSlug: string;
  limit?: number;
}

export function RecommendedMovies({
  genres,
  currentMovieSlug,
  limit = 5,
}: RecommendedMoviesProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        // Search for movies with similar genres
        const genreQuery = genres[0] ? `genre=${encodeURIComponent(genres[0])}` : '';
        const response = await fetch(`/api/movies?${genreQuery}&limit=10`);
        const data = await response.json();

        // Filter out current movie and limit results
        const filtered = data.movies
          .filter((m: Movie) => m.slug !== currentMovieSlug)
          .slice(0, limit);

        setMovies(filtered);
      } catch (error) {
        console.error('Failed to fetch recommended movies:', error);
      } finally {
        setLoading(false);
      }
    };

    if (genres.length > 0) {
      fetchRecommended();
    }
  }, [genres, currentMovieSlug, limit]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Recommended For You</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="aspect-video animate-pulse rounded-lg bg-card"
            />
          ))}
        </div>
      </div>
    );
  }

  if (movies.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Recommended For You</h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {movies.map((movie) => (
          <MovieCard key={movie._id} {...movie} />
        ))}
      </div>
    </div>
  );
}
