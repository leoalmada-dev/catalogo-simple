import Image from "next/image"
import Link from "next/link"

const wa = process.env.WHATSAPP_PHONE
const waUrl = wa ? `https://wa.me/${wa}` : "#"

export default function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          {/* Logo opcional: si tenés un SVG o imagen, ponelo acá */}
          <Image src="/panther.svg" alt="Pantera mini mayorista" width={64} height={64} />

          <span className="text-base font-semibold tracking-tight">
            Pantera <span className="font-normal text-neutral-600">mini mayorista</span>
          </span>
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/api/health" className="text-sm text-neutral-600 hover:underline">Health</Link>
          <a href={waUrl} className="inline-flex h-9 items-center rounded-md border px-3 text-sm hover:bg-neutral-50">
            WhatsApp
          </a>
        </nav>
      </div>
    </header>
  )
}
