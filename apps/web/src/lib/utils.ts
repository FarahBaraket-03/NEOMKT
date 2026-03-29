import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export const IMAGE_PLACEHOLDER_URL = '/images/product-placeholder.svg';

export function resolveImageUrl(url?: string | null): string {
  if (!url || url.trim().length === 0) {
    return IMAGE_PLACEHOLDER_URL;
  }

  if (url.startsWith('/')) {
    return url;
  }

  try {
    const parsed = new URL(url);

    // Avoid external placeholder host dependency in runtime.
    const isPlaceholdHost = parsed.hostname === 'placehold.co';

    if (isPlaceholdHost) {
      return IMAGE_PLACEHOLDER_URL;
    }

    return url;
  } catch {
    return IMAGE_PLACEHOLDER_URL;
  }
}
