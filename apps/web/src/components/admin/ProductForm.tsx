'use client';

import { useEffect, useMemo, useState } from 'react';
import { ApolloError, useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import {
  CREATE_PRODUCT,
  CREATE_PRODUCT_SPEC,
  DELETE_PRODUCT_SPEC,
  UPDATE_PRODUCT,
} from '@/gql/documents';
import { useToast } from '@/components/ui/Toast';

interface OptionItem {
  id: string;
  name: string;
}

interface ProductSpecValue {
  id?: string;
  key: string;
  value: string;
  unit?: string | null;
  displayOrder?: number;
}

interface ProductValue {
  id?: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  stock: number;
  status: 'ACTIVE' | 'DISCONTINUED' | 'OUT_OF_STOCK';
  brandId: string;
  categoryId: string;
  imageUrl?: string | null;
  releaseDate?: string | null;
  specs?: ProductSpecValue[];
}

interface ProductFormProps {
  mode: 'create' | 'edit';
  product?: ProductValue;
  brands: OptionItem[];
  categories: OptionItem[];
}

interface SpecDraft {
  id?: string;
  key: string;
  value: string;
  unit: string;
  displayOrder: number;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseGraphqlFieldError(error: unknown): {
  field?: string;
  message: string;
} {
  if (error instanceof ApolloError) {
    const firstError = error.graphQLErrors[0] as
      | { message?: string; extensions?: Record<string, unknown> }
      | undefined;

    const field =
      firstError?.extensions && typeof firstError.extensions.field === 'string'
        ? (firstError.extensions.field as string)
        : undefined;

    return {
      field,
      message: firstError?.message ?? error.message,
    };
  }

  return {
    message: (error as Error)?.message ?? 'Unexpected error',
  };
}

function formatDateForInput(value?: string | null): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
}

export default function ProductForm({ mode, product, brands, categories }: ProductFormProps) {
  const router = useRouter();
  const { pushToast } = useToast();

  const [name, setName] = useState(product?.name ?? '');
  const [slug, setSlug] = useState(product?.slug ?? '');
  const [slugCustomized, setSlugCustomized] = useState(mode === 'edit');
  const [brandId, setBrandId] = useState(product?.brandId ?? brands[0]?.id ?? '');
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? categories[0]?.id ?? '');
  const [status, setStatus] = useState<ProductValue['status']>(product?.status ?? 'ACTIVE');
  const [price, setPrice] = useState(product ? String(product.price) : '0');
  const [stock, setStock] = useState(product ? String(product.stock) : '0');
  const [description, setDescription] = useState(product?.description ?? '');
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? '');
  const [releaseDate, setReleaseDate] = useState(formatDateForInput(product?.releaseDate));
  const [specs, setSpecs] = useState<SpecDraft[]>(
    (product?.specs ?? []).map((item, index) => ({
      id: item.id,
      key: item.key,
      value: item.value,
      unit: item.unit ?? '',
      displayOrder: item.displayOrder ?? index,
    })),
  );
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [newSpecUnit, setNewSpecUnit] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [createProduct, { loading: creatingProduct }] = useMutation(CREATE_PRODUCT);
  const [updateProduct, { loading: updatingProduct }] = useMutation(UPDATE_PRODUCT);
  const [createProductSpec, { loading: creatingSpec }] = useMutation(CREATE_PRODUCT_SPEC);
  const [deleteProductSpec, { loading: deletingSpec }] = useMutation(DELETE_PRODUCT_SPEC);

  const isSubmitting = creatingProduct || updatingProduct;

  useEffect(() => {
    if (slugCustomized) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSlug(slugify(name));
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [name, slugCustomized]);

  const canAddSpec = useMemo(() => {
    return newSpecKey.trim().length > 0 && newSpecValue.trim().length > 0;
  }, [newSpecKey, newSpecValue]);

  const resetNewSpecFields = () => {
    setNewSpecKey('');
    setNewSpecValue('');
    setNewSpecUnit('');
  };

  const handleAddSpec = async () => {
    if (!canAddSpec) {
      return;
    }

    if (mode === 'edit' && product?.id) {
      try {
        const nextDisplayOrder = specs.length;
        const result = await createProductSpec({
          variables: {
            input: {
              productId: product.id,
              key: newSpecKey.trim(),
              value: newSpecValue.trim(),
              unit: newSpecUnit.trim() || null,
              displayOrder: nextDisplayOrder,
            },
          },
        });

        const createdSpec = result.data?.createProductSpec as ProductSpecValue | undefined;
        if (createdSpec) {
          setSpecs((prev) => [
            ...prev,
            {
              id: createdSpec.id,
              key: createdSpec.key,
              value: createdSpec.value,
              unit: createdSpec.unit ?? '',
              displayOrder: createdSpec.displayOrder ?? nextDisplayOrder,
            },
          ]);
        }
        resetNewSpecFields();
      } catch (error) {
        const parsed = parseGraphqlFieldError(error);
        setFormError(parsed.message);
      }
      return;
    }

    setSpecs((prev) => [
      ...prev,
      {
        key: newSpecKey.trim(),
        value: newSpecValue.trim(),
        unit: newSpecUnit.trim(),
        displayOrder: prev.length,
      },
    ]);
    resetNewSpecFields();
  };

  const handleRemoveSpec = async (spec: SpecDraft) => {
    if (spec.id && mode === 'edit') {
      try {
        await deleteProductSpec({
          variables: {
            id: spec.id,
          },
        });
      } catch (error) {
        const parsed = parseGraphqlFieldError(error);
        setFormError(parsed.message);
        return;
      }
    }

    setSpecs((prev) => prev.filter((item) => item !== spec));
  };

  return (
    <Card variant="terminal" className="max-w-4xl">
      <CardContent className="pt-10">
        <form
          className="space-y-6"
          onSubmit={async (event) => {
            event.preventDefault();
            setFieldErrors({});
            setFormError(null);

            const payload = {
              name: name.trim(),
              slug: slug.trim(),
              brandId,
              categoryId,
              status,
              price: Number(price),
              stock: Number(stock),
              description: description.trim() || null,
              imageUrl: imageUrl.trim() || null,
              images: imageUrl.trim() ? [imageUrl.trim()] : [],
              releaseDate: releaseDate ? new Date(releaseDate).toISOString() : null,
            };

            try {
              let savedProductId = product?.id;

              if (mode === 'create') {
                const result = await createProduct({
                  variables: {
                    input: payload,
                  },
                });
                savedProductId = result.data?.createProduct?.id as string | undefined;
              } else if (savedProductId) {
                await updateProduct({
                  variables: {
                    id: savedProductId,
                    input: payload,
                  },
                });
              }

              if (!savedProductId) {
                throw new Error('Unable to resolve saved product identifier.');
              }

              if (mode === 'create' && specs.length > 0) {
                for (const [index, spec] of specs.entries()) {
                  await createProductSpec({
                    variables: {
                      input: {
                        productId: savedProductId,
                        key: spec.key,
                        value: spec.value,
                        unit: spec.unit || null,
                        displayOrder: index,
                      },
                    },
                  });
                }
              }

              pushToast({
                title: 'PRODUCT SAVED // SUCCESS',
                variant: 'success',
              });
              router.push('/admin/products');
              router.refresh();
            } catch (error) {
              const parsed = parseGraphqlFieldError(error);
              if (parsed.field) {
                setFieldErrors((prev) => ({
                  ...prev,
                  [parsed.field as string]: parsed.message,
                }));
              } else {
                setFormError(parsed.message);
              }
            }
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <label className="font-sharetech text-xs uppercase tracking-widest text-mutedForeground">Name</label>
              <Input value={name} onChange={(event) => setName(event.target.value)} required />
              {fieldErrors.name ? (
                <p className="font-sharetech text-xs text-destructive uppercase tracking-widest">{fieldErrors.name}</p>
              ) : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="font-sharetech text-xs uppercase tracking-widest text-mutedForeground">Slug</label>
              <Input
                value={slug}
                onChange={(event) => {
                  setSlug(event.target.value);
                  setSlugCustomized(true);
                }}
                required
              />
              <p className="font-sharetech text-xs text-mutedForeground uppercase tracking-widest">{`> slug: ${slug || 'n/a'}`}</p>
              {fieldErrors.slug ? (
                <p className="font-sharetech text-xs text-destructive uppercase tracking-widest">{fieldErrors.slug}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="font-sharetech text-xs uppercase tracking-widest text-mutedForeground">Brand</label>
              <Select
                value={brandId}
                onValueChange={setBrandId}
                options={brands.map((item) => ({ label: item.name, value: item.id }))}
                placeholder="SELECT BRAND"
              />
              {fieldErrors.brandId ? (
                <p className="font-sharetech text-xs text-destructive uppercase tracking-widest">{fieldErrors.brandId}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="font-sharetech text-xs uppercase tracking-widest text-mutedForeground">Category</label>
              <Select
                value={categoryId}
                onValueChange={setCategoryId}
                options={categories.map((item) => ({ label: item.name, value: item.id }))}
                placeholder="SELECT CATEGORY"
              />
              {fieldErrors.categoryId ? (
                <p className="font-sharetech text-xs text-destructive uppercase tracking-widest">{fieldErrors.categoryId}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="font-sharetech text-xs uppercase tracking-widest text-mutedForeground">Status</label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as ProductValue['status'])}
                options={[
                  { label: 'ACTIVE', value: 'ACTIVE' },
                  { label: 'DISCONTINUED', value: 'DISCONTINUED' },
                  { label: 'OUT_OF_STOCK', value: 'OUT_OF_STOCK' },
                ]}
              />
            </div>

            <div className="space-y-2">
              <label className="font-sharetech text-xs uppercase tracking-widest text-mutedForeground">Price</label>
              <Input type="number" min={0} step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} required />
              {fieldErrors.price ? (
                <p className="font-sharetech text-xs text-destructive uppercase tracking-widest">{fieldErrors.price}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="font-sharetech text-xs uppercase tracking-widest text-mutedForeground">Stock</label>
              <Input type="number" min={0} step="1" value={stock} onChange={(event) => setStock(event.target.value)} required />
              {fieldErrors.stock ? (
                <p className="font-sharetech text-xs text-destructive uppercase tracking-widest">{fieldErrors.stock}</p>
              ) : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="font-sharetech text-xs uppercase tracking-widest text-mutedForeground">Description</label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="cyber-chamfer-sm min-h-[120px] w-full bg-input border border-border px-3 py-3 text-sm font-jetbrains text-foreground placeholder:text-mutedForeground outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 focus:shadow-neon-sm"
              />
              {fieldErrors.description ? (
                <p className="font-sharetech text-xs text-destructive uppercase tracking-widest">{fieldErrors.description}</p>
              ) : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="font-sharetech text-xs uppercase tracking-widest text-mutedForeground">Image URL</label>
              <Input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} />
              {fieldErrors.imageUrl ? (
                <p className="font-sharetech text-xs text-destructive uppercase tracking-widest">{fieldErrors.imageUrl}</p>
              ) : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="font-sharetech text-xs uppercase tracking-widest text-mutedForeground">Release Date</label>
              <Input type="date" value={releaseDate} onChange={(event) => setReleaseDate(event.target.value)} />
            </div>
          </div>

          <div className="space-y-3 border-t border-border pt-5">
            <h2 className="font-sharetech text-xs uppercase tracking-widest text-mutedForeground">TECHNICAL SPECIFICATIONS</h2>

            <div className="space-y-2">
              {specs.map((spec, index) => (
                <div key={spec.id ?? `${spec.key}-${index}`} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_180px_auto] gap-2">
                  <Input value={spec.key} disabled />
                  <Input value={spec.value} disabled />
                  <Input value={spec.unit || ''} disabled />
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={deletingSpec}
                    onClick={() => {
                      void handleRemoveSpec(spec);
                    }}
                  >
                    REMOVE
                  </Button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_180px] gap-2">
              <Input
                value={newSpecKey}
                onChange={(event) => setNewSpecKey(event.target.value)}
                placeholder="SPEC KEY"
              />
              <Input
                value={newSpecValue}
                onChange={(event) => setNewSpecValue(event.target.value)}
                placeholder="SPEC VALUE"
              />
              <Input
                value={newSpecUnit}
                onChange={(event) => setNewSpecUnit(event.target.value)}
                placeholder="UNIT"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={!canAddSpec || creatingSpec}
              onClick={() => {
                void handleAddSpec();
              }}
            >
              + ADD SPEC
            </Button>
          </div>

          {formError ? (
            <p className="font-sharetech text-xs text-destructive uppercase tracking-widest">{formError}</p>
          ) : null}

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="default" isLoading={isSubmitting}>
              {mode === 'create' ? 'CREATE PRODUCT' : 'SAVE CHANGES'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
