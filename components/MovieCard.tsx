import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';

interface MovieCardProps {
  title: string;
  slug?: string;
  posterUrl: string;
  imdbRating: number;
  type: 'movie' | 'series';
  views?: number;
}

export function MovieCard({ title, slug, posterUrl, imdbRating, type }: MovieCardProps) {
  const canOpenDetail = Boolean(slug);
  const href = canOpenDetail ? `/movie/${encodeURIComponent(slug!)}` : '#';

  return (
    <Link href={href} aria-disabled={!canOpenDetail} className={!canOpenDetail ? 'pointer-events-none' : ''}>
      <div className="group relative overflow-hidden rounded-lg bg-card transition-transform duration-300 hover:scale-105 cursor-pointer">
        <div className="aspect-[2/3] relative bg-muted">
          <Image
            src={posterUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 300px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-end p-3">
            <p className="text-white font-semibold text-sm line-clamp-2 mb-2">{title}</p>
            {imdbRating > 0 && (
              <div className="flex items-center gap-1 text-xs text-yellow-400">
                <Star className="h-3 w-3 fill-yellow-400" />
                <span>{imdbRating.toFixed(1)}</span>
              </div>
            )}
            {type === 'series' && (
              <span className="inline-block mt-2 px-2 py-1 bg-primary/80 text-primary-foreground text-xs rounded">
                Series
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
