import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border bg-white">
        <span className="text-xl">404</span>
      </div>

      <h1 className="text-2xl font-semibold">Producto no encontrado</h1>
      <p className="text-sm text-neutral-600">
        Puede que el producto no esté publicado o el enlace haya cambiado.
      </p>

      <div className="flex items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-xl border bg-white px-4 py-2 text-sm hover:bg-neutral-50"
        >
          ← Volver al catálogo
        </Link>
        <Link
          href="/?category=all"
          className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90"
        >
          Ver todos los productos
        </Link>
      </div>
    </div>
  );
}
