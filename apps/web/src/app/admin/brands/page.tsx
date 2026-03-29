'use client';

import Link from 'next/link';
import { useMutation, useQuery } from '@apollo/client';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SmartImage from '@/components/ui/SmartImage';
import ConfirmDeleteDialog from '@/components/admin/ConfirmDeleteDialog';
import { DELETE_BRAND, GET_ADMIN_BRANDS } from '@/gql/documents';
import { useToast } from '@/components/ui/Toast';

interface AdminBrandsQueryData {
  brands: Array<{
    id: string;
    name: string;
    slug: string;
    country?: string | null;
    foundedYear?: number | null;
    logoUrl?: string | null;
    products: Array<{ id: string }>;
  }>;
}

function initials(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase();
}

export default function AdminBrandsPage() {
  const { pushToast } = useToast();

  const { data, loading, refetch } = useQuery<AdminBrandsQueryData>(GET_ADMIN_BRANDS, {
    fetchPolicy: 'cache-and-network',
  });

  const [deleteBrand] = useMutation(DELETE_BRAND);

  const brands = data?.brands ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h1 className="font-orbitron text-3xl text-accent uppercase tracking-wider">BRANDS</h1>
          <p className="font-sharetech text-xs text-mutedForeground uppercase tracking-widest mt-1">
            {'> brand registry // vendor catalog'}
          </p>
        </div>

        <Link href="/admin/brands/new">
          <Button variant="default" className="gap-2">
            <Plus className="h-4 w-4" />
            + NEW BRAND
          </Button>
        </Link>
      </div>

      <Card variant="terminal" className="overflow-hidden">
        <CardContent className="pt-10">
          <div className="overflow-x-auto border border-border cyber-chamfer-sm">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="text-left px-3 py-3 font-sharetech uppercase tracking-widest text-xs text-mutedForeground">Logo</th>
                  <th className="text-left px-3 py-3 font-sharetech uppercase tracking-widest text-xs text-mutedForeground">Name</th>
                  <th className="text-left px-3 py-3 font-sharetech uppercase tracking-widest text-xs text-mutedForeground">Country</th>
                  <th className="text-left px-3 py-3 font-sharetech uppercase tracking-widest text-xs text-mutedForeground">Founded Year</th>
                  <th className="text-left px-3 py-3 font-sharetech uppercase tracking-widest text-xs text-mutedForeground">Product Count</th>
                  <th className="text-left px-3 py-3 font-sharetech uppercase tracking-widest text-xs text-mutedForeground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((item, index) => (
                  <tr
                    key={item.id}
                    className={[
                      'border-b border-border/50 font-jetbrains text-sm',
                      index % 2 === 0 ? 'bg-muted/20' : '',
                      'hover:bg-muted/40 transition-colors',
                    ].join(' ')}
                  >
                    <td className="px-3 py-2">
                      <div className="h-10 w-10 relative overflow-hidden border border-border cyber-chamfer-sm flex items-center justify-center bg-muted/40">
                        {item.logoUrl ? (
                          <SmartImage
                            src={item.logoUrl}
                            alt={item.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="font-sharetech text-xs text-accent">{initials(item.name)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 uppercase tracking-wide">{item.name}</td>
                    <td className="px-3 py-2 uppercase tracking-wide">{item.country ?? '-'}</td>
                    <td className="px-3 py-2">{item.foundedYear ?? '-'}</td>
                    <td className="px-3 py-2">{item.products.length}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/brands/${item.id}/edit`}>
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
                            await deleteBrand({
                              variables: {
                                id: item.id,
                              },
                            });
                            await refetch();
                            pushToast({
                              title: 'BRAND DELETED // SUCCESS',
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
                ))}

                {!loading && brands.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-8 text-center font-sharetech text-xs uppercase tracking-widest text-mutedForeground"
                    >
                      {'> no brands found'}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
