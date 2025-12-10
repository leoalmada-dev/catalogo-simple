// app/producto/[slug]/loading.tsx
export default function Loading() {
    return (
        <div className="space-y-4 animate-pulse">
            {/* Breadcrumbs fantasma */}
            <div className="flex gap-2 text-xs text-neutral-400">
                <div className="h-3 w-12 rounded bg-neutral-100" />
                <span aria-hidden>/</span>
                <div className="h-3 w-16 rounded bg-neutral-100" />
                <span aria-hidden>/</span>
                <div className="h-3 w-24 rounded bg-neutral-100" />
            </div>

            <article className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Columna imágenes */}
                <section className="space-y-3">
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-100" />

                    <div className="grid grid-cols-4 gap-2">
                        {Array.from({ length: 4 }).map((_, idx) => (
                            <div
                                key={idx}
                                className="aspect-square rounded-xl bg-neutral-100"
                            />
                        ))}
                    </div>
                </section>

                {/* Columna info */}
                <section className="space-y-4">
                    <div className="space-y-2">
                        <div className="h-6 w-3/4 rounded bg-neutral-100" />
                        <div className="h-4 w-1/2 rounded bg-neutral-100" />
                    </div>

                    <div className="space-y-2">
                        <div className="h-4 w-full rounded bg-neutral-100" />
                        <div className="h-4 w-5/6 rounded bg-neutral-100" />
                        <div className="h-4 w-2/3 rounded bg-neutral-100" />
                    </div>

                    <div className="space-y-2">
                        <div className="h-4 w-24 rounded bg-neutral-100" />
                        <div className="flex flex-wrap gap-2">
                            {Array.from({ length: 3 }).map((_, idx) => (
                                <div
                                    key={idx}
                                    className="h-7 w-20 rounded-full bg-neutral-100"
                                />
                            ))}
                        </div>
                    </div>

                    <div className="h-10 w-full rounded-xl bg-neutral-100" />
                </section>
            </article>
        </div>
    );
}
