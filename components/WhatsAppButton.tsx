// components/WhatsAppButton.tsx
import Link from 'next/link';

export function WhatsAppButton({ phone, text }: { phone: string; text: string }) {
  const msg = encodeURIComponent(text);
  const href = `https://wa.me/${phone}?text=${msg}`;
  return (
    <Link
      href={href}
      target="_blank"
      className="inline-flex items-center justify-center rounded-xl bg-green-600 px-4 py-2 text-white hover:bg-green-700"
    >
      Consultar por WhatsApp
    </Link>
  );
}
