// Skeleton loading state for collection [slug] pages
// Shown while server data fetch is in progress (Suspense boundary)

export default function CollectionLoading() {
  return (
    <div className="min-h-screen animate-fade-in">
      {/* Hero Skeleton */}
      <div className="bg-gradient-to-b from-soft-pink/20 to-ivory py-14 md:py-20">
        <div className="container-luxury text-center">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-3 w-10 bg-neutral-200 rounded-full animate-pulse" />
            <div className="h-3 w-3 bg-neutral-100 rounded-full animate-pulse" />
            <div className="h-3 w-20 bg-neutral-200 rounded-full animate-pulse" />
            <div className="h-3 w-3 bg-neutral-100 rounded-full animate-pulse" />
            <div className="h-3 w-16 bg-neutral-200 rounded-full animate-pulse" />
          </div>

          {/* Title skeleton */}
          <div className="max-w-md mx-auto space-y-3">
            <div className="h-3 w-32 bg-rose-gold/20 rounded-full animate-pulse mx-auto" />
            <div className="h-12 w-64 bg-neutral-200 rounded-xl animate-pulse mx-auto" />
            <div className="h-4 w-96 bg-neutral-100 rounded-full animate-pulse mx-auto" />
            <div className="h-3 w-24 bg-neutral-100 rounded-full animate-pulse mx-auto" />
          </div>
        </div>
      </div>

      {/* Products Grid Skeleton */}
      <div className="container-luxury py-8 md:py-12">
        {/* Toolbar skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="h-9 w-28 bg-neutral-100 rounded-full animate-pulse" />
          <div className="h-9 w-36 bg-neutral-100 rounded-full animate-pulse" />
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div
                className="aspect-[4/5] bg-neutral-100 rounded-xl animate-pulse"
                style={{ animationDelay: `${i * 80}ms` }}
              />
              <div className="h-3 w-3/4 bg-neutral-100 rounded-full animate-pulse" />
              <div className="h-3 w-1/2 bg-neutral-100 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
