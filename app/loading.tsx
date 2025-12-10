// app/loading.tsx
export default function Loading() {
    const skeletonItems = Array.from({ length: 8 });

    return (
        <div className="space-y-4 animate-pulse">
            {/* Breadcrumbs + título */}
            <div className="space-y-2">
                <div className="h-4 w-40 rounded bg-neutral-100" />
                <div className="h-7 w-32 rounded bg-neutral-100" />
                <div className="h-4 w-64 rounded bg-neutral-100" />
            </div>

            {/* Filtros (search + select) */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex w-full gap-2">
                    <div className="h-9 flex-1 rounded-xl border bg-neutral-100" />
                    <div className="h-9 w-24 rounded-xl border bg-neutral-100" />
                    <div className="h-9 w-24 rounded-xl border bg-neutral-100" />
                </div>
                <div className="h-9 w-full rounded-xl border bg-neutral-100 sm:w-64" />
            </div>

            {/* Grid de productos skeleton */}
            <section
                className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
                aria-label="Cargando productos del catálogo"
            >
                {skeletonItems.map((_, idx) => (
                    <article
                        key={idx}
                        className="flex flex-col overflow-hidden rounded-2xl border bg-white"
                    >
                        <div className="aspect-[4/3] w-full bg-neutral-100" />
                        <div className="space-y-2 p-3">
                            <div className="h-4 w-3/4 rounded bg-neutral-100" />
                            <div className="h-3 w-1/2 rounded bg-neutral-100" />
                        </div>
                    </article>
                ))}
            </section>
        </div>
    );
}
