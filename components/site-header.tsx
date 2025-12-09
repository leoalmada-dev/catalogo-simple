// components/site-header.tsx
import Image from "next/image";
import Link from "next/link";

const wa = process.env.WHATSAPP_PHONE;
const waUrl = wa ? `https://wa.me/${wa}` : "#";

export default function SiteHeader() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Branding */}
        <Link
          href="/"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-800 rounded-md"
        >
          <Image
            src="/panther.svg"
            alt="Logo de Pantera mini mayorista"
            width={64}
            height={64}
            className="select-none"
          />

          <span className="text-lg font-semibold tracking-tight">
            Pantera{" "}
            <span className="font-normal text-neutral-600">miniMayorista</span>
          </span>
        </Link>

        {/* Nav principal */}
        <nav
          className="flex items-center gap-3"
          aria-label="Acciones principales del sitio"
        >
          {/* Placeholder temporal: más adelante colocamos categorías o CTA principal */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center rounded-md border px-3 text-sm text-neutral-700 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-800"
          >
            WhatsApp
          </a>
        </nav>
      </div>
    </header>
  );
}
