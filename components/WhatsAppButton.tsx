// components/WhatsAppButton.tsx
type WhatsAppButtonProps = {
  phone: string;
  text: string;
};

export function WhatsAppButton({ phone, text }: WhatsAppButtonProps) {
  if (!phone) return null;

  const msg = encodeURIComponent(text);
  const href = `https://wa.me/${phone}?text=${msg}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      aria-label="Consultar por WhatsApp"
    >
      Consultar por WhatsApp
    </a>
  );
}
