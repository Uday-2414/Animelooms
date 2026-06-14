
/**
 * Reusable Base Skeleton loader
 */
export function Skeleton({ className = '', ...props }) {
  return (
    <div 
      className={`animate-shimmer bg-white/5 rounded-lg ${className}`} 
      {...props} 
    />
  )
}

/**
 * Skeleton for standard AnimeCard component
 */
export function AnimeCardSkeleton({ className = '' }) {
  return (
    <div 
      className={`relative flex flex-col justify-end bg-surface-card rounded-2xl overflow-hidden border border-white/5 p-4 gap-2 w-full aspect-[2/3] animate-shimmer ${className}`}
      aria-hidden="true"
    >
      {/* Badges placeholder */}
      <div className="flex gap-1.5">
        <Skeleton className="h-5 w-12 bg-white/10" />
        <Skeleton className="h-5 w-16 bg-white/10" />
      </div>

      {/* Title placeholder */}
      <Skeleton className="h-4 w-11/12 bg-white/20 mt-1" />

      {/* Metadata placeholder */}
      <div className="flex justify-between items-center w-full mt-1">
        <Skeleton className="h-3.5 w-12 bg-white/10" />
        <Skeleton className="h-3 w-16 bg-white/5" />
      </div>
    </div>
  )
}

/**
 * Skeleton for NewsCard component
 */
export function NewsCardSkeleton({ className = '' }) {
  return (
    <div 
      className={`flex flex-col md:flex-row bg-surface-card border border-white/5 rounded-2xl overflow-hidden animate-shimmer ${className}`}
      aria-hidden="true"
    >
      {/* Article Image placeholder */}
      <Skeleton className="w-full md:w-48 h-48 md:h-auto rounded-none flex-shrink-0" />

      {/* Article Content placeholder */}
      <div className="p-6 flex flex-col justify-between flex-grow gap-4">
        <div className="space-y-3">
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-3 w-16 bg-white/20" />
            <span className="text-white/10">•</span>
            <Skeleton className="h-3 w-20 bg-white/10" />
            <span className="text-white/10">•</span>
            <Skeleton className="h-3 w-24 bg-white/10" />
          </div>

          {/* Title */}
          <Skeleton className="h-5 w-11/12 bg-white/25" />

          {/* Excerpt */}
          <div className="space-y-2 pt-1">
            <Skeleton className="h-3.5 w-full bg-white/10" />
            <Skeleton className="h-3.5 w-full bg-white/10" />
            <Skeleton className="h-3.5 w-2/3 bg-white/10" />
          </div>
        </div>

        {/* Read More Link */}
        <Skeleton className="h-4 w-24 bg-white/15" />
      </div>
    </div>
  )
}

/**
 * Skeleton for AnimeDetails page content
 */
export function AnimeDetailsSkeleton() {
  return (
    <div className="space-y-8 pb-12 animate-shimmer" aria-hidden="true">
      {/* Back button */}
      <div>
        <Skeleton className="h-4 w-32 bg-white/10" />
      </div>

      {/* Main details layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left side poster */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
          <Skeleton className="w-full aspect-[2/3] rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>

        {/* Right side contents */}
        <div className="flex-grow space-y-6 w-full">
          <div className="space-y-2">
            <Skeleton className="h-9 w-2/3 bg-white/20" />
            <Skeleton className="h-4 w-1/3 bg-white/10" />
          </div>

          {/* Badges */}
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-white/5">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
                <div className="space-y-1.5 flex-grow">
                  <Skeleton className="h-2.5 w-12" />
                  <Skeleton className="h-3.5 w-16" />
                </div>
              </div>
            ))}
          </div>

          {/* Synopsis */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-24 bg-white/20" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full bg-white/10" />
              <Skeleton className="h-4 w-full bg-white/10" />
              <Skeleton className="h-4 w-full bg-white/10" />
              <Skeleton className="h-4 w-4/5 bg-white/10" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Skeleton className="h-11 w-40 rounded-lg bg-white/20" />
            <Skeleton className="h-11 w-28 rounded-lg bg-white/10" />
          </div>
        </div>
      </div>

      {/* Trailer & Related */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8 border-t border-white/5">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-6 w-36 bg-white/20" />
          <Skeleton className="w-full aspect-video rounded-2xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-32 bg-white/20" />
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="flex gap-4 p-3 bg-surface-chrome/30 rounded-2xl border border-white/5">
                <Skeleton className="w-20 aspect-[2/3] rounded-lg flex-shrink-0" />
                <div className="flex-grow space-y-2 pt-1">
                  <Skeleton className="h-3.5 w-full bg-white/15" />
                  <Skeleton className="h-3 w-16 bg-white/10" />
                  <Skeleton className="h-5 w-14 rounded-md bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton for Watchlist list elements
 */
export function WatchlistCardSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      <AnimeCardSkeleton />
      <div className="space-y-2">
        <div className="grid grid-cols-1 gap-2">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} className="h-9 w-full" />
          ))}
        </div>
        <Skeleton className="h-8 w-full bg-red-950/10" />
      </div>
    </div>
  )
}
