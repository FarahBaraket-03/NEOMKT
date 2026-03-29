'use client';

import { useEffect, useMemo, useState } from 'react';
import Input from '@/components/ui/Input';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface FilterSidebarProps {
  categories: Array<{ id: string; name: string }>;
  brands: Array<{ id: string; name: string }>;
  value: Record<string, string | undefined>;
  onApply: (next: Record<string, string | undefined>) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function FilterSidebar({
  categories,
  brands,
  value,
  onApply,
  isMobileOpen = false,
  onCloseMobile,
}: FilterSidebarProps) {
  const ALL_STATUS_VALUE = '__ALL_STATUS__';

  const [local, setLocal] = useState<Record<string, string | undefined>>(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if ((local.search ?? '') !== (value.search ?? '')) {
        onApply(local);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [local, onApply, value.search]);

  const statusOptions = useMemo(
    () => [
      { label: 'ALL STATUSES', value: ALL_STATUS_VALUE },
      { label: 'ACTIVE', value: 'ACTIVE' },
      { label: 'OUT OF STOCK', value: 'OUT_OF_STOCK' },
      { label: 'DISCONTINUED', value: 'DISCONTINUED' },
    ],
    [ALL_STATUS_VALUE],
  );

  return (
    <div
      className={cn(
        'lg:block',
        isMobileOpen
          ? 'fixed inset-0 z-50 bg-background/90 p-4 overflow-auto'
          : 'hidden lg:block',
      )}
    >
      <Card variant="terminal" className="h-fit max-w-sm w-full lg:max-w-none">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-orbitron uppercase text-xl text-accent">&gt;_ FILTERS</h3>
            {isMobileOpen ? (
              <Button variant="ghost" size="sm" onClick={onCloseMobile}>
                CLOSE
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
        <Input
          placeholder="SEARCH PRODUCTS"
          value={local.search ?? ''}
          onChange={(event) => setLocal((prev) => ({ ...prev, search: event.target.value }))}
        />

        <div>
          <p className="font-sharetech text-xs uppercase tracking-[0.2em] text-accentTertiary mb-2">CATEGORIES</p>
          <div className="space-y-2 max-h-40 overflow-auto pr-1">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center gap-2 text-sm font-jetbrains">
                <input
                  type="checkbox"
                  className="accent-[#00ff88]"
                  checked={local.categoryId === category.id}
                  onChange={(event) =>
                    setLocal((prev) => ({
                      ...prev,
                      categoryId: event.target.checked ? category.id : undefined,
                    }))
                  }
                />
                {category.name.toUpperCase()}
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="font-sharetech text-xs uppercase tracking-[0.2em] text-accentTertiary mb-2">BRANDS</p>
          <div className="space-y-2 max-h-40 overflow-auto pr-1">
            {brands.map((brand) => (
              <label key={brand.id} className="flex items-center gap-2 text-sm font-jetbrains">
                <input
                  type="checkbox"
                  className="accent-[#00ff88]"
                  checked={local.brandId === brand.id}
                  onChange={(event) =>
                    setLocal((prev) => ({
                      ...prev,
                      brandId: event.target.checked ? brand.id : undefined,
                    }))
                  }
                />
                {brand.name.toUpperCase()}
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="MIN"
            type="number"
            value={local.minPrice ?? ''}
            onChange={(event) => setLocal((prev) => ({ ...prev, minPrice: event.target.value || undefined }))}
          />
          <Input
            placeholder="MAX"
            type="number"
            value={local.maxPrice ?? ''}
            onChange={(event) => setLocal((prev) => ({ ...prev, maxPrice: event.target.value || undefined }))}
          />
        </div>

        <Select
          value={local.status ?? ALL_STATUS_VALUE}
          onValueChange={(next) =>
            setLocal((prev) => ({
              ...prev,
              status: next === ALL_STATUS_VALUE ? undefined : next,
            }))
          }
          options={statusOptions}
        />

        <Select
          value={local.sortBy ?? 'created_at'}
          onValueChange={(next) => setLocal((prev) => ({ ...prev, sortBy: next || undefined }))}
          options={[
            { label: 'CREATED', value: 'created_at' },
            { label: 'NAME', value: 'name' },
            { label: 'PRICE', value: 'price' },
          ]}
        />

        <Select
          value={local.sortOrder ?? 'DESC'}
          onValueChange={(next) => setLocal((prev) => ({ ...prev, sortOrder: next || undefined }))}
          options={[
            { label: 'DESC', value: 'DESC' },
            { label: 'ASC', value: 'ASC' },
          ]}
        />

          <Button variant="outline" className="w-full" onClick={() => onApply(local)}>
            APPLY FILTERS
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
