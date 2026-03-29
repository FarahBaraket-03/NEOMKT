'use client';

import { useEffect, useState } from 'react';
import { ApolloError, useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Card, { CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { CREATE_BRAND, UPDATE_BRAND } from '@/gql/documents';
import { useToast } from '@/components/ui/Toast';

interface BrandValue {
  id?: string;
  name: string;
  slug: string;
  country?: string | null;
  foundedYear?: number | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  description?: string | null;
}

interface BrandFormProps {
  mode: 'create' | 'edit';
  brand?: BrandValue;
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

export default function BrandForm({ mode, brand }: BrandFormProps) {
  const router = useRouter();
  const { pushToast } = useToast();

  const [name, setName] = useState(brand?.name ?? '');
  const [slug, setSlug] = useState(brand?.slug ?? '');
  const [slugCustomized, setSlugCustomized] = useState(mode === 'edit');
  const [country, setCountry] = useState(brand?.country ?? '');
  const [foundedYear, setFoundedYear] = useState(brand?.foundedYear ? String(brand.foundedYear) : '');
  const [logoUrl, setLogoUrl] = useState(brand?.logoUrl ?? '');
  const [websiteUrl, setWebsiteUrl] = useState(brand?.websiteUrl ?? '');
  const [description, setDescription] = useState(brand?.description ?? '');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [createBrand, { loading: creating }] = useMutation(CREATE_BRAND);
  const [updateBrand, { loading: updating }] = useMutation(UPDATE_BRAND);

  const currentYear = new Date().getFullYear();

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

  return (
    <Card variant="terminal" className="max-w-3xl">
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
              country: country.trim() || null,
              foundedYear: foundedYear ? Number(foundedYear) : null,
              logoUrl: logoUrl.trim() || null,
              websiteUrl: websiteUrl.trim() || null,
              description: description.trim() || null,
            };

            try {
              if (mode === 'create') {
                await createBrand({
                  variables: {
                    input: payload,
                  },
                });
              } else if (brand?.id) {
                await updateBrand({
                  variables: {
                    id: brand.id,
                    input: payload,
                  },
                });
              }

              pushToast({
                title: 'BRAND SAVED // SUCCESS',
                variant: 'success',
              });
              router.push('/admin/brands');
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
            </div>

            <div className="space-y-2">
              <label className="font-sharetech text-xs uppercase tracking-widest text-mutedForeground">Country</label>
              <Input value={country} onChange={(event) => setCountry(event.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="font-sharetech text-xs uppercase tracking-widest text-mutedForeground">Founded Year</label>
              <Input
                type="number"
                min={1800}
                max={currentYear}
                value={foundedYear}
                onChange={(event) => setFoundedYear(event.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="font-sharetech text-xs uppercase tracking-widest text-mutedForeground">Logo URL</label>
              <Input value={logoUrl} onChange={(event) => setLogoUrl(event.target.value)} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="font-sharetech text-xs uppercase tracking-widest text-mutedForeground">Website URL</label>
              <Input value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="font-sharetech text-xs uppercase tracking-widest text-mutedForeground">Description</label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="cyber-chamfer-sm min-h-[120px] w-full bg-input border border-border px-3 py-3 text-sm font-jetbrains text-foreground placeholder:text-mutedForeground outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 focus:shadow-neon-sm"
              />
            </div>
          </div>

          {formError ? (
            <p className="font-sharetech text-xs text-destructive uppercase tracking-widest">{formError}</p>
          ) : null}

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="default" isLoading={creating || updating}>
              {mode === 'create' ? 'CREATE BRAND' : 'SAVE CHANGES'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
