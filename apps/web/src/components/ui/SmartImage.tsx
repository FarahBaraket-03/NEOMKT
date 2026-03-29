'use client';

import Image, { type ImageProps } from 'next/image';
import { useEffect, useState } from 'react';
import { IMAGE_PLACEHOLDER_URL, resolveImageUrl } from '@/lib/utils';

type SmartImageProps = Omit<ImageProps, 'src'> & {
  src?: string | null;
};

export default function SmartImage({ src, ...props }: SmartImageProps) {
  const resolved = resolveImageUrl(src);
  const [currentSrc, setCurrentSrc] = useState(resolved);

  useEffect(() => {
    setCurrentSrc(resolved);
  }, [resolved]);

  return (
    <Image
      {...props}
      src={currentSrc}
      onError={() => {
        if (currentSrc !== IMAGE_PLACEHOLDER_URL) {
          setCurrentSrc(IMAGE_PLACEHOLDER_URL);
        }
      }}
    />
  );
}
