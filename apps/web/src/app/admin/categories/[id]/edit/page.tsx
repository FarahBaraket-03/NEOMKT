import { notFound } from 'next/navigation';
import CategoryForm from '@/components/admin/CategoryForm';
import { GET_ADMIN_CATEGORY_BY_ID } from '@/gql/documents';
import { createServerApolloClient } from '@/lib/apollo/server';
import { ensureAdminAccess, redirectOnAdminGraphQLError } from '@/lib/auth/admin';

interface AdminCategoryQueryData {
  category: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    parentId?: string | null;
    icon?: string | null;
  } | null;
  categories: Array<{
    id: string;
    name: string;
    parentId?: string | null;
  }>;
}

export default async function AdminEditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { accessToken } = await ensureAdminAccess();
  const client = await createServerApolloClient(accessToken);

  let data: AdminCategoryQueryData;

  try {
    const result = await client.query<AdminCategoryQueryData>({
      query: GET_ADMIN_CATEGORY_BY_ID,
      variables: {
        id,
      },
      fetchPolicy: 'no-cache',
    });

    data = result.data;
  } catch (error) {
    redirectOnAdminGraphQLError(error);
  }

  if (!data.category) {
    notFound();
  }

  const categoryOptions = (data.categories ?? []).map((category) => ({
    id: category.id,
    name: category.name,
    parentId: category.parentId ?? null,
  }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-orbitron text-3xl text-accent uppercase tracking-wider">EDIT CATEGORY</h1>
        <p className="font-sharetech text-xs text-mutedForeground uppercase tracking-widest mt-1">
          {'> update taxonomy node'}
        </p>
      </div>
      <CategoryForm mode="edit" category={data.category} categoryOptions={categoryOptions} />
    </div>
  );
}
