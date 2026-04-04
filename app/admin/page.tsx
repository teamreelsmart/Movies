'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Film, Send, ListTodo } from 'lucide-react';

interface Stats {
  movies: number;
  series: number;
  requests: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ movies: 0, series: 0, requests: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [moviesRes, requestsRes] = await Promise.all([
          fetch('/api/movies?limit=1'),
          fetch('/api/requests?limit=1'),
        ]);

        const moviesData = await moviesRes.json();
        const requestsData = await requestsRes.json();

        const movies = moviesData.pagination?.total || 0;
        const totalRequests = requestsData.pagination?.total || 0;
        const series = moviesData.movies?.filter((m: any) => m.type === 'series').length || 0;

        setStats({
          movies: movies - series,
          series,
          requests: totalRequests,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AdminHeader />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="container max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="mt-2 text-foreground/60">Welcome to OrvixMovies Admin Panel</p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-3 mb-12">
            {/* Movies Card */}
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/60">Total Movies</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    {loading ? '-' : stats.movies}
                  </p>
                </div>
                <Film className="h-12 w-12 text-primary/20" />
              </div>
              <Button asChild className="mt-4 w-full" size="sm">
                <Link href="/admin/movies">Manage</Link>
              </Button>
            </div>

            {/* Series Card */}
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/60">Total Series</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    {loading ? '-' : stats.series}
                  </p>
                </div>
                <Send className="h-12 w-12 text-accent/20" />
              </div>
              <Button asChild className="mt-4 w-full" size="sm" variant="outline">
                <Link href="/admin/movies?type=series">Manage</Link>
              </Button>
            </div>

            {/* Requests Card */}
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/60">Pending Requests</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    {loading ? '-' : stats.requests}
                  </p>
                </div>
                <ListTodo className="h-12 w-12 text-primary/20" />
              </div>
              <Button asChild className="mt-4 w-full" size="sm" variant="outline">
                <Link href="/admin/requests">View All</Link>
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/movies/add">Add Movie</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/movies/add?type=series">Add Series</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/movies">Manage Content</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/settings">Settings</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
