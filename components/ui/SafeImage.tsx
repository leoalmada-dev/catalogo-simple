'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

export default function SafeImage(props: ImageProps & { fallbackSrc?: string }) {
  const { src, fallbackSrc = '/no-image.svg', ...rest } = props;
  const [errored, setErrored] = useState(false);

  const finalSrc = (!src || errored) ? fallbackSrc : src;

  return (
    <Image
      {...rest}
      src={finalSrc}
      onError={() => setErrored(true)}
    />
  );
}
