import "./globals.css"
import { ReactNode } from "react"
import SiteHeader from "@/components/site-header"
import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/env';
import UtmCapture from "@/components/analytics/UtmCapture";

export const metadata: Metadata = {
  title: 'Catálogo Simple',
  description: 'Catálogo SEO-first sin checkout',
  metadataBase: new URL(SITE_URL), // 👈
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-dvh bg-white text-neutral-900 antialiased">
        <SiteHeader />
        <main className="mx-auto max-w-6xl p-4">{children}</main>
        <UtmCapture />
      </body>
    </html>
  )
}
