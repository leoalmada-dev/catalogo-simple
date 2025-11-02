'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // En desarrollo podés inspeccionar el error:
    // console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="space-y-4 rounded-2xl border bg-white p-6 text-center">
        <h1 className="text-xl font-semibold">No pudimos cargar este producto</h1>
        <p className="text-sm text-neutral-600">
          Ocurrió un problema al traer los datos. Intentá nuevamente o volvé al catálogo.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90"
          >
            Reintentar
          </button>
          <Link
            href="/"
            className="rounded-xl border bg-white px-4 py-2 text-sm hover:bg-neutral-50"
          >
            Volver al catálogo
          </Link>
        </div>

        {process.env.NODE_ENV !== 'production' && error?.digest && (
          <p className="mt-2 text-xs text-neutral-400">
            error digest: <code>{error.digest}</code>
          </p>
        )}
      </div>
    </div>
  );
}
