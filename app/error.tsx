'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Útil mientras desarrollamos; en prod lo podés enviar a un logger
    // console.error(error);
  }, [error]);

  return (
    <html lang="es">
      <body className="min-h-dvh bg-white text-neutral-900">
        <main className="mx-auto max-w-2xl p-6">
          <div className="space-y-4 rounded-2xl border bg-white p-6 text-center">
            <h1 className="text-xl font-semibold">Algo salió mal</h1>
            <p className="text-sm text-neutral-600">
              Hubo un problema al cargar la página. Probá nuevamente.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => reset()}
                className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90"
              >
                Reintentar
              </button>
              <a
                href="/"
                className="rounded-xl border bg-white px-4 py-2 text-sm hover:bg-neutral-50"
              >
                Ir al inicio
              </a>
            </div>

            {process.env.NODE_ENV !== 'production' && error?.digest && (
              <p className="mt-2 text-xs text-neutral-400">
                error digest: <code>{error.digest}</code>
              </p>
            )}
          </div>
        </main>
      </body>
    </html>
  );
}
