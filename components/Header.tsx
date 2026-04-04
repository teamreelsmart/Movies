'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

export function Header() {
  const [searchActive, setSearchActive] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent"></div>
          <span>OrvixMovies</span>
        </Link>

        <nav className="hidden gap-6 md:flex">
          <Link href="/movies" className="text-sm font-medium text-foreground/70 hover:text-foreground">
            Movies
          </Link>
          <Link href="/series" className="text-sm font-medium text-foreground/70 hover:text-foreground">
            Series
          </Link>
          <Link href="/request" className="text-sm font-medium text-foreground/70 hover:text-foreground">
            Request
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setSearchActive(!searchActive)}
            className="rounded-lg p-2 hover:bg-card transition-colors"
          >
            <Search className="h-5 w-5" />
          </button>
          <Link
            href="/admin"
            className="hidden rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 sm:inline-flex"
          >
            Admin
          </Link>
        </div>
      </div>

      {searchActive && (
        <div className="border-t border-border bg-card/50 px-4 py-3 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Input
              placeholder="Search movies, series..."
              className="w-full bg-background border-border"
            />
          </div>
        </div>
      )}
    </header>
  );
}
