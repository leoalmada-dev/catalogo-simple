// components/WhatsAppButton.tsx
import Link from "next/link";

export function WhatsAppButton({
  phone,
  text,
}: {
  phone: string;
  text: string;
}) {
  const msg = encodeURIComponent(text);
  const href = `https://wa.me/${phone}?text=${msg}`;

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-[2.5rem] items-center justify-center rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      aria-label={`Consultar por WhatsApp: ${text}`}
    >
      Consultar por WhatsApp
    </Link>
  );
}
