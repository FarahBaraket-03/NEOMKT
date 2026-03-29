'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Button from './Button';

interface PaginationProps {
  page: number;
  totalPages: number;
}

function buildPages(page: number, totalPages: number): number[] {
  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);
  for (let cursor = page - 1; cursor <= page + 1; cursor += 1) {
    if (cursor >= 1 && cursor <= totalPages) {
      pages.add(cursor);
    }
  }
  return [...pages].sort((a, b) => a - b);
}

export default function Pagination({ page, totalPages }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updatePage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(nextPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  const pages = buildPages(page, totalPages);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => updatePage(page - 1)}>
        PREV
      </Button>
      {pages.map((item) => (
        <Button
          key={item}
          size="sm"
          variant={item === page ? 'default' : 'ghost'}
          className={item === page ? 'bg-accent text-background' : undefined}
          onClick={() => updatePage(item)}
        >
          {item}
        </Button>
      ))}
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => updatePage(page + 1)}
      >
        NEXT
      </Button>
    </div>
  );
}
