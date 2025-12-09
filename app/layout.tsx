// app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import SiteHeader from "@/components/site-header";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/env";
import UtmCapture from "@/components/analytics/UtmCapture";

const SITE_NAME = "Pantera mini mayorista";
const SITE_DESCRIPTION = "Catálogo de Pantera mini mayorista 🐆";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL.replace(/\/$/, "")}/favicon.ico`,
  };

  return (
    <html lang="es">
      <head>
        {/* Google Search Console verification */}
        <meta
          name="google-site-verification"
          content="CVZVmQ9X7PPfJNzLy3ie6pYh6Tp9ep-pregpk-gu4f4"
        />

        {/* JSON-LD global */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>

      <body className="min-h-dvh bg-white text-neutral-900 antialiased">
        {/* Skip link accesible */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 rounded-md bg-white px-4 py-2 shadow-md"
        >
          Saltar al contenido
        </a>

        <SiteHeader />

        <main
          id="main-content"
          className="mx-auto max-w-6xl p-4 outline-none focus-visible:ring-2 focus-visible:ring-neutral-800"
        >
          {children}
        </main>

        <UtmCapture />
      </body>
    </html>
  );
}
