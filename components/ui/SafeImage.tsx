'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

type SafeProps = Omit<ImageProps, 'alt'> & {
  alt: string;              // exigir alt siempre (evita warning a11y)
  fallbackSrc?: string;     // por defecto usamos un asset local existente
};

export default function SafeImage({ src, alt, fallbackSrc = '/next.svg', ...rest }: SafeProps) {
  const [errored, setErrored] = useState(false);
  const finalSrc = !src || errored ? fallbackSrc : src;

  return (
    <Image
      {...rest}
      alt={alt}
      src={finalSrc}
      onError={() => setErrored(true)}
    />
  );
}
