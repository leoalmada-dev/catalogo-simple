import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false }, // evita indexación aunque encuentren la URL
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
