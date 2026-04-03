'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { ChevronDown, ChevronRight, FolderTree, Pencil, Plus, Trash2 } from 'lucide-react';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ConfirmDeleteDialog from '@/components/admin/ConfirmDeleteDialog';
import { DELETE_CATEGORY, GET_ADMIN_CATEGORIES } from '@/gql/documents';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

interface AdminCategoryItem {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  parentId?: string | null;
  products: Array<{ id: string }>;
}

interface AdminCategoriesQueryData {
  categories: AdminCategoryItem[];
}

interface CategoryRow {
  category: AdminCategoryItem;
  depth: number;
  hasChildren: boolean;
}

const ROOT_KEY = '__root__';

export default function AdminCategoriesPage() {
  const { pushToast } = useToast();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const { data, loading, refetch } = useQuery<AdminCategoriesQueryData>(GET_ADMIN_CATEGORIES, {
    fetchPolicy: 'cache-and-network',
  });

  const [deleteCategory] = useMutation(DELETE_CATEGORY);

  const categories = data?.categories ?? [];

  const childrenByParent = useMemo(() => {
    const map = new Map<string, AdminCategoryItem[]>();

    for (const category of categories) {
      const parentKey = category.parentId ?? ROOT_KEY;
      if (!map.has(parentKey)) {
        map.set(parentKey, []);
      }
      map.get(parentKey)?.push(category);
    }

    return map;
  }, [categories]);

  const categoryById = useMemo(() => {
    const map = new Map<string, AdminCategoryItem>();
    for (const category of categories) {
      map.set(category.id, category);
    }
    return map;
  }, [categories]);

  const rootCategories = childrenByParent.get(ROOT_KEY) ?? [];

  const totalProductsByCategory = useMemo(() => {
    const totals = new Map<string, number>();

    const countProducts = (categoryId: string, path: Set<string>): number => {
      if (totals.has(categoryId)) {
        return totals.get(categoryId) ?? 0;
      }

      // Guard against accidental cycles in category parent references.
      if (path.has(categoryId)) {
        return 0;
      }

      const category = categoryById.get(categoryId);
      const ownCount = category?.products.length ?? 0;
      const children = childrenByParent.get(categoryId) ?? [];

      const nextPath = new Set(path);
      nextPath.add(categoryId);

      const childrenCount = children.reduce((sum, child) => {
        return sum + countProducts(child.id, nextPath);
      }, 0);

      const total = ownCount + childrenCount;
      totals.set(categoryId, total);
      return total;
    };

    for (const category of categories) {
      countProducts(category.id, new Set());
    }

    return totals;
  }, [categories, categoryById, childrenByParent]);

  const visibleRows = useMemo(() => {
    const rows: CategoryRow[] = [];

    const walk = (parentId: string | null, depth: number) => {
      const parentKey = parentId ?? ROOT_KEY;
      const children = childrenByParent.get(parentKey) ?? [];

      for (const child of children) {
        const hasChildren = (childrenByParent.get(child.id)?.length ?? 0) > 0;
        rows.push({
          category: child,
          depth,
          hasChildren,
        });

        if (hasChildren && expandedIds.has(child.id)) {
          walk(child.id, depth + 1);
        }
      }
    };

    walk(null, 0);
    return rows;
  }, [childrenByParent, expandedIds]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h1 className="font-orbitron text-3xl text-accent uppercase tracking-wider">CATEGORIES</h1>
          <p className="font-sharetech text-xs text-mutedForeground uppercase tracking-widest mt-1">
            {'> taxonomy tree // hierarchical navigation'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="gap-2"
            onClick={() => {
              setExpandedIds(new Set(rootCategories.map((category) => category.id)));
            }}
            type="button"
          >
            <FolderTree className="h-4 w-4" />
            EXPAND ROOTS
          </Button>

          <Link href="/admin/categories/new">
            <Button variant="default" className="gap-2">
              <Plus className="h-4 w-4" />
              + NEW CATEGORY
            </Button>
          </Link>
        </div>
      </div>

      <Card variant="terminal" className="overflow-hidden">
        <CardContent className="pt-10">
          <div className="overflow-x-auto border border-border cyber-chamfer-sm">
            <table className="w-full min-w-[980px] border-collapse">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="text-left px-3 py-3 font-sharetech uppercase tracking-widest text-xs text-mutedForeground">Category Tree</th>
                  <th className="text-left px-3 py-3 font-sharetech uppercase tracking-widest text-xs text-mutedForeground">Slug</th>
                  <th className="text-left px-3 py-3 font-sharetech uppercase tracking-widest text-xs text-mutedForeground">Icon</th>
                  <th className="text-left px-3 py-3 font-sharetech uppercase tracking-widest text-xs text-mutedForeground">Products</th>
                  <th className="text-left px-3 py-3 font-sharetech uppercase tracking-widest text-xs text-mutedForeground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row, index) => {
                  const { category, depth, hasChildren } = row;
                  const childrenCount = childrenByParent.get(category.id)?.length ?? 0;
                  const directProductsCount = category.products.length;
                  const totalProductsCount = totalProductsByCategory.get(category.id) ?? directProductsCount;

                  return (
                    <tr
                      key={category.id}
                      className={cn(
                        'border-b border-border/50 font-jetbrains text-sm',
                        index % 2 === 0 && 'bg-muted/20',
                        'hover:bg-muted/40 transition-colors',
                      )}
                    >
                      <td className="px-3 py-2">
                        <div className="flex items-center" style={{ paddingLeft: `${depth * 18}px` }}>
                          <div className={cn('flex items-center gap-2', depth > 0 && 'border-l border-border/70 pl-3')}>
                            {hasChildren ? (
                              <button
                                type="button"
                                className="h-6 w-6 inline-flex items-center justify-center border border-border cyber-chamfer-sm text-mutedForeground hover:text-accent hover:border-accent"
                                onClick={() => {
                                  setExpandedIds((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(category.id)) {
                                      next.delete(category.id);
                                    } else {
                                      next.add(category.id);
                                    }
                                    return next;
                                  });
                                }}
                                title={expandedIds.has(category.id) ? 'Collapse' : 'Expand'}
                              >
                                {expandedIds.has(category.id) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </button>
                            ) : (
                              <span className="inline-block h-6 w-6" />
                            )}

                            {depth > 0 ? (
                              <span className="font-sharetech text-xs text-mutedForeground">└─</span>
                            ) : null}

                            <div className="flex items-center gap-2">
                              <span className="uppercase tracking-wide">{category.name}</span>
                              <span className="font-sharetech text-[10px] uppercase tracking-widest text-mutedForeground">
                                ({totalProductsCount} products)
                              </span>
                              {hasChildren ? (
                                <span className="font-sharetech text-[10px] uppercase tracking-widest text-accent">
                                  {childrenCount} children
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-2 uppercase tracking-wide">{category.slug}</td>
                      <td className="px-3 py-2 uppercase tracking-wide">{category.icon ?? '-'}</td>
                      <td className="px-3 py-2">{totalProductsCount}</td>

                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/categories/new?parentId=${category.id}`}>
                            <button
                              type="button"
                              title="Create child category"
                              className="h-8 px-2 inline-flex items-center justify-center border border-border cyber-chamfer-sm text-mutedForeground hover:text-accent hover:border-accent font-sharetech text-[10px] uppercase tracking-widest"
                            >
                              + CHILD
                            </button>
                          </Link>

                          <Link href={`/admin/categories/${category.id}/edit`}>
                            <button
                              type="button"
                              title="Edit"
                              className="h-8 w-8 inline-flex items-center justify-center border border-border cyber-chamfer-sm text-mutedForeground hover:text-accent hover:border-accent"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          </Link>

                          {hasChildren ? (
                            <button
                              type="button"
                              title="Delete disabled while children exist"
                              className="h-8 w-8 inline-flex items-center justify-center border border-border cyber-chamfer-sm text-mutedForeground/60 cursor-not-allowed"
                              disabled
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : (
                            <ConfirmDeleteDialog
                              itemName={category.name}
                              onConfirm={async () => {
                                await deleteCategory({
                                  variables: {
                                    id: category.id,
                                  },
                                });
                                await refetch();
                                pushToast({
                                  title: 'CATEGORY DELETED // SUCCESS',
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
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {!loading && visibleRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-8 text-center font-sharetech text-xs uppercase tracking-widest text-mutedForeground"
                    >
                      {'> no categories found'}
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
