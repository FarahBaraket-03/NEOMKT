'use client';

import { useEffect, useMemo, useState } from 'react';
import { ApolloError, useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Card, { CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { CREATE_CATEGORY, UPDATE_CATEGORY } from '@/gql/documents';
import { useToast } from '@/components/ui/Toast';

interface CategoryValue {
  id?: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  icon?: string | null;
}

interface CategoryOption {
  id: string;
  name: string;
  parentId?: string | null;
}

interface CategoryFormProps {
  mode: 'create' | 'edit';
  category?: CategoryValue;
  categoryOptions: CategoryOption[];
  initialParentId?: string;
}

const NONE_OPTION_VALUE = '__none__';

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

export default function CategoryForm({
  mode,
  category,
  categoryOptions,
  initialParentId,
}: CategoryFormProps) {
  const router = useRouter();
  const { pushToast } = useToast();

  const [name, setName] = useState(category?.name ?? '');
  const [slug, setSlug] = useState(category?.slug ?? '');
  const [slugCustomized, setSlugCustomized] = useState(mode === 'edit');
  const [icon, setIcon] = useState(category?.icon ?? '');
  const [description, setDescription] = useState(category?.description ?? '');
  const [parentValue, setParentValue] = useState(
    category?.parentId ?? initialParentId ?? NONE_OPTION_VALUE,
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [createCategory, { loading: creating }] = useMutation(CREATE_CATEGORY);
  const [updateCategory, { loading: updating }] = useMutation(UPDATE_CATEGORY);

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

  const parentSelectOptions = useMemo(() => {
    return [
      { label: 'NO PARENT', value: NONE_OPTION_VALUE },
      ...categoryOptions
        .filter((item) => item.id !== category?.id)
        .map((item) => ({ label: item.name, value: item.id })),
    ];
  }, [category?.id, categoryOptions]);

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
              description: description.trim() || null,
              icon: icon.trim() || null,
              parentId: parentValue === NONE_OPTION_VALUE ? null : parentValue,
            };

            try {
              if (mode === 'create') {
                await createCategory({
                  variables: {
                    input: payload,
                  },
                });
              } else if (category?.id) {
                await updateCategory({
                  variables: {
                    id: category.id,
                    input: payload,
                  },
                });
              }

              pushToast({
                title: 'CATEGORY SAVED // SUCCESS',
                variant: 'success',
              });
              router.push('/admin/categories');
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
              <label className="font-sharetech text-xs uppercase tracking-widest text-mutedForeground">Icon</label>
              <Input value={icon} onChange={(event) => setIcon(event.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="font-sharetech text-xs uppercase tracking-widest text-mutedForeground">Parent Category</label>
              <Select
                value={parentValue}
                onValueChange={setParentValue}
                options={parentSelectOptions}
              />
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
              {mode === 'create' ? 'CREATE CATEGORY' : 'SAVE CHANGES'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
