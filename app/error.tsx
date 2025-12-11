// app/error.tsx
'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function GlobalError({
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
    <div className="min-h-dvh bg-neutral-50">
      <main className="mx-auto flex min-h-dvh max-w-2xl items-center justify-center p-6">
        <div className="w-full space-y-4 rounded-2xl border bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold">Algo salió mal</h1>
          <p className="text-sm text-neutral-600">
            Hubo un problema al cargar la página. Probá nuevamente.
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-800 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Reintentar
            </button>
            <Link
              href="/"
              className="text-sm text-neutral-700 underline hover:text-neutral-900"
            >
              Volver al inicio
            </Link>
          </div>

          {process.env.NODE_ENV !== 'production' && error?.digest && (
            <p className="mt-2 text-xs text-neutral-400">
              error digest: <code>{error.digest}</code>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
