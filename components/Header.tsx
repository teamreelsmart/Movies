'use client';

import Image from 'next/image';
import Link from 'next/link';
import { SearchBox } from './SearchBox';
import { Menu } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary flex-shrink-0">
          <Image src="/icon.svg" alt="Movies Entertainment logo" width={34} height={34} priority />
          <span className="hidden sm:inline">Movies Entertainment</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden gap-6 md:flex">
          <Link href="/movies" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
            Movies
          </Link>
          <Link href="/series" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
            Series
          </Link>
          <Link href="/request" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
            Request
          </Link>
        </nav>

        {/* Search Box */}
        <div className="flex-1 max-w-sm hidden sm:block">
          <SearchBox />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 hover:bg-card transition-colors md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-card/50 px-4 py-4 sm:px-6 md:hidden">
          <div className="space-y-3 mb-4">
            <SearchBox />
          </div>
          <nav className="flex flex-col gap-2">
            <Link
              href="/movies"
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 hover:bg-primary/10 hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Movies
            </Link>
            <Link
              href="/series"
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 hover:bg-primary/10 hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Series
            </Link>
            <Link
              href="/request"
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 hover:bg-primary/10 hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Request
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
