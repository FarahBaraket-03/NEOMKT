'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Pagination from '@/components/ui/Pagination';
import SmartImage from '@/components/ui/SmartImage';
import { useToast } from '@/components/ui/Toast';
import ConfirmDeleteDialog from '@/components/admin/ConfirmDeleteDialog';
import { DELETE_PRODUCT, GET_ADMIN_PRODUCTS } from '@/gql/documents';
import { formatPrice } from '@/lib/format';

const PAGE_SIZE = 20;

interface AdminProductsQueryData {
  products: Array<{
    id: string;
    name: string;
    slug: string;
    imageUrl?: string | null;
    price: number;
    stock: number;
    status: 'ACTIVE' | 'DISCONTINUED' | 'OUT_OF_STOCK';
    brand: {
      id: string;
      name: string;
    };
    category: {
      id: string;
      name: string;
    };
  }>;
  productsCount: number;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { pushToast } = useToast();

  const page = Math.max(Number(searchParams.get('page') ?? '1') || 1, 1);
  const search = (searchParams.get('search') ?? '').trim();
  const [searchInput, setSearchInput] = useState(search);

  const offset = (page - 1) * PAGE_SIZE;

  const { data, loading, refetch } = useQuery<AdminProductsQueryData>(GET_ADMIN_PRODUCTS, {
    variables: {
      search: search || undefined,
      limit: PAGE_SIZE,
      offset,
    },
    fetchPolicy: 'cache-and-network',
  });

  const [deleteProduct] = useMutation(DELETE_PRODUCT);

  const totalProducts = data?.productsCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));

  const products = useMemo(() => data?.products ?? [], [data?.products]);

  const setQueryParams = (next: { page?: number; search?: string }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (next.search !== undefined) {
      const normalizedSearch = next.search.trim();
      if (normalizedSearch.length > 0) {
        params.set('search', normalizedSearch);
      } else {
        params.delete('search');
      }
      params.set('page', '1');
    }

    if (next.page !== undefined) {
      params.set('page', String(next.page));
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h1 className="font-orbitron text-3xl text-accent uppercase tracking-wider">PRODUCTS</h1>
          <p className="font-sharetech text-xs text-mutedForeground uppercase tracking-widest mt-1">
            {'> inventory control // product registry'}
          </p>
        </div>

        <Link href="/admin/products/new">
          <Button variant="default" className="gap-2">
            <Plus className="h-4 w-4" />
            + NEW PRODUCT
          </Button>
        </Link>
      </div>

      <Card variant="terminal" className="overflow-hidden">
        <CardContent className="pt-10 space-y-4">
          <form
            className="flex flex-wrap gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              setQueryParams({ search: searchInput });
            }}
          >
            <div className="flex-1 min-w-[260px]">
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="SEARCH BY NAME"
              />
            </div>
            <Button type="submit" variant="outline" className="gap-2">
              <Search className="h-4 w-4" />
              SEARCH
            </Button>
          </form>

          <div className="overflow-x-auto border border-border cyber-chamfer-sm">
            <table className="w-full min-w-[980px] border-collapse">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="text-left px-3 py-3 font-sharetech uppercase tracking-widest text-xs text-mutedForeground">Image</th>
                  <th className="text-left px-3 py-3 font-sharetech uppercase tracking-widest text-xs text-mutedForeground">Name</th>
                  <th className="text-left px-3 py-3 font-sharetech uppercase tracking-widest text-xs text-mutedForeground">Brand</th>
                  <th className="text-left px-3 py-3 font-sharetech uppercase tracking-widest text-xs text-mutedForeground">Category</th>
                  <th className="text-left px-3 py-3 font-sharetech uppercase tracking-widest text-xs text-mutedForeground">Price</th>
                  <th className="text-left px-3 py-3 font-sharetech uppercase tracking-widest text-xs text-mutedForeground">Stock</th>
                  <th className="text-left px-3 py-3 font-sharetech uppercase tracking-widest text-xs text-mutedForeground">Status</th>
                  <th className="text-left px-3 py-3 font-sharetech uppercase tracking-widest text-xs text-mutedForeground">Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((item, index) => {
                  const stockClass =
                    item.stock === 0
                      ? 'text-destructive'
                      : item.stock < 10
                        ? 'text-[#facc15]'
                        : 'text-accent';

                  return (
                    <tr
                      key={item.id}
                      className={[
                        'border-b border-border/50 font-jetbrains text-sm',
                        index % 2 === 0 ? 'bg-muted/20' : '',
                        'hover:bg-muted/40 transition-colors',
                      ].join(' ')}
                    >
                      <td className="px-3 py-2">
                        <div className="h-10 w-10 relative overflow-hidden border border-border cyber-chamfer-sm">
                          <SmartImage
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-3 py-2 uppercase tracking-wide">{item.name}</td>
                      <td className="px-3 py-2 uppercase tracking-wide">{item.brand.name}</td>
                      <td className="px-3 py-2 uppercase tracking-wide">{item.category.name}</td>
                      <td className="px-3 py-2">{formatPrice(item.price)}</td>
                      <td className={`px-3 py-2 ${stockClass}`}>{item.stock}</td>
                      <td className="px-3 py-2">
                        <Badge
                          variant={
                            item.status === 'ACTIVE'
                              ? 'default'
                              : item.status === 'OUT_OF_STOCK'
                                ? 'destructive'
                                : 'muted'
                          }
                        >
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/products/${item.id}/edit`}>
                            <button
                              type="button"
                              title="Edit"
                              className="h-8 w-8 inline-flex items-center justify-center border border-border cyber-chamfer-sm text-mutedForeground hover:text-accent hover:border-accent"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          </Link>

                          <ConfirmDeleteDialog
                            itemName={item.name}
                            onConfirm={async () => {
                              await deleteProduct({
                                variables: {
                                  id: item.id,
                                },
                              });
                              await refetch();
                              pushToast({
                                title: 'PRODUCT DELETED // SUCCESS',
                                variant: 'info',
                              });
                            }}
                            trigger={
                              <button
                                type="button"
                                title="Delete"
                                className="h-8 w-8 inline-flex items-center justify-center border border-border cyber-chamfer-sm text-mutedForeground hover:text-destructive hover:border-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {!loading && products.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-3 py-8 text-center font-sharetech text-xs uppercase tracking-widest text-mutedForeground"
                    >
                      {'> no products found'}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="pt-2">
            <Pagination
              page={Math.min(page, totalPages)}
              totalPages={totalPages}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
