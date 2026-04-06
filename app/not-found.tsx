import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-sm font-semibold tracking-wide text-primary">404</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">Page not found</h1>
          <p className="mt-3 text-foreground/70">
            The page you are looking for is unavailable or may have been moved.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/movies">Browse Movies</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
