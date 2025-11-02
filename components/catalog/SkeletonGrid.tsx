// Server Component (sin 'use client')
export default function SkeletonGrid({ count = 12 }: { count?: number }) {
  const items = Array.from({ length: count });
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border bg-white"
          aria-hidden="true"
        >
          <div className="aspect-[4/3] w-full rounded-t-2xl bg-neutral-100" />
          <div className="p-3 space-y-2">
            <div className="h-4 w-3/4 rounded bg-neutral-100" />
            <div className="h-3 w-1/3 rounded bg-neutral-100" />
          </div>
        </div>
      ))}
    </section>
  );
}
