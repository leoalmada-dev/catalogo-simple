import "./globals.css"
import { ReactNode } from "react"
import SiteHeader from "@/components/site-header"

export const metadata = {
  title: "Catálogo Simple",
  description: "Catálogo SEO-first sin checkout",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-dvh bg-white text-neutral-900 antialiased">
        <SiteHeader />
        <main className="mx-auto max-w-6xl p-4">{children}</main>
      </body>
    </html>
  )
}
