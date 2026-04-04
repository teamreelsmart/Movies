export function MovieCardSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      <div className="aspect-video rounded-lg bg-card" />
      <div className="space-y-2">
        <div className="h-4 w-3/4 rounded bg-card" />
        <div className="h-3 w-1/2 rounded bg-card" />
      </div>
    </div>
  );
}

export function MovieDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="aspect-video rounded-lg bg-card md:aspect-auto md:h-96" />
        <div className="md:col-span-2 space-y-4">
          <div className="h-8 w-1/2 rounded bg-card" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-card" />
            <div className="h-4 w-full rounded bg-card" />
            <div className="h-4 w-3/4 rounded bg-card" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 w-full rounded bg-card" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
