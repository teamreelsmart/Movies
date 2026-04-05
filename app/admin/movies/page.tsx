'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Movie {
  _id: string;
  title: string;
  slug: string;
  posterUrl: string;
  type: 'movie' | 'series';
  views: number;
  imdbRating: number;
  createdAt: string;
  isTrending?: boolean;
}

function MoviesManagementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const type = searchParams.get('type') || '';

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', '10');
        if (type) params.append('type', type);

        const res = await fetch(`/api/movies?${params}`);
        const data = await res.json();
        setMovies(data.movies || []);
        setTotal(data.pagination?.total || 0);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch movies',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [page, type, toast]);


  const handleTrendingToggle = async (slug: string, isTrending: boolean) => {
    try {
      const res = await fetch(`/api/movies/${slug}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTrending: !isTrending }),
      });

      if (!res.ok) throw new Error('Failed to update trending status');

      setMovies((prev) =>
        prev.map((m) => (m.slug === slug ? { ...m, isTrending: !isTrending } : m))
      );

      toast({
        title: 'Updated',
        description: `Trending is now ${!isTrending ? 'ON' : 'OFF'}` ,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update trending status',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this?')) return;

    try {
      const res = await fetch(`/api/movies/${slug}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');

      setMovies(movies.filter((m) => m.slug !== slug));
      toast({
        title: 'Deleted',
        description: 'Movie/Series deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AdminHeader />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="container max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {type === 'series' ? 'Manage Series' : 'Manage Movies'}
              </h1>
            </div>
            <Button onClick={() => router.push(`/admin/movies/add${type ? `?type=${type}` : ''}`)} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Add {type === 'series' ? 'Series' : 'Movie'}
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-foreground/60">Loading...</p>
            </div>
          ) : movies.length > 0 ? (
            <>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-card/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Title</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Type</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Rating</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Views</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Added</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Trending Now</th>
                      <th className="px-4 py-3 text-right font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movies.map((movie) => (
                      <tr key={movie._id} className="border-b border-border hover:bg-card/50">
                        <td className="px-4 py-3 font-medium text-foreground">{movie.title}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            movie.type === 'series'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-accent/10 text-accent'
                          }`}>
                            {movie.type === 'series' ? 'Series' : 'Movie'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-foreground/70">
                          {movie.imdbRating ? `${movie.imdbRating.toFixed(1)}/10` : '-'}
                        </td>
                        <td className="px-4 py-3 text-foreground/70">{movie.views}</td>
                        <td className="px-4 py-3 text-foreground/70">
                          {new Date(movie.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => handleTrendingToggle(movie.slug, Boolean(movie.isTrending))}
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                              movie.isTrending
                                ? 'bg-green-500/15 text-green-600 hover:bg-green-500/25'
                                : 'bg-muted text-foreground/70 hover:bg-muted/80'
                            }`}
                          >
                            {movie.isTrending ? 'ON' : 'OFF'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              onClick={() => router.push(`/admin/movies/${movie.slug}/edit`)}
                              size="sm"
                              variant="ghost"
                              className="text-primary hover:bg-primary/10"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(movie.slug)}
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-6 flex items-center justify-center gap-2">
                <Button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  variant="outline"
                >
                  Previous
                </Button>
                <span className="text-sm text-foreground/60">
                  Page {page} of {Math.ceil(total / 10)}
                </span>
                <Button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / 10)}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-border bg-card px-6 py-12 text-center">
              <p className="mb-4 text-foreground/60">No {type === 'series' ? 'series' : 'movies'} found</p>
              <Button onClick={() => router.push(`/admin/movies/add${type ? `?type=${type}` : ''}`)} size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Add {type === 'series' ? 'Series' : 'Movie'}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function MoviesManagementPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MoviesManagementContent />
    </Suspense>
  );
}
