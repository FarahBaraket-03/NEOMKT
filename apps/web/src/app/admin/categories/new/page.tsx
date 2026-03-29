import CategoryForm from '@/components/admin/CategoryForm';
import { GET_ADMIN_CATEGORIES } from '@/gql/documents';
import { createServerApolloClient } from '@/lib/apollo/server';
import { ensureAdminAccess, redirectOnAdminGraphQLError } from '@/lib/auth/admin';

interface AdminCategoriesLookupData {
  categories: Array<{
    id: string;
    name: string;
    parentId?: string | null;
  }>;
}

export default async function AdminNewCategoryPage({
  searchParams,
}: {
  searchParams: Promise<{ parentId?: string }>;
}) {
  const params = await searchParams;
  const { accessToken } = await ensureAdminAccess();
  const client = await createServerApolloClient(accessToken);

  let data: AdminCategoriesLookupData;

  try {
    const result = await client.query<AdminCategoriesLookupData>({
      query: GET_ADMIN_CATEGORIES,
      fetchPolicy: 'no-cache',
    });

    data = result.data;
  } catch (error) {
    redirectOnAdminGraphQLError(error);
  }

  const categoryOptions = (data.categories ?? []).map((category) => ({
    id: category.id,
    name: category.name,
    parentId: category.parentId ?? null,
  }));

  const hasSelectedParent = categoryOptions.some((item) => item.id === params.parentId);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-orbitron text-3xl text-accent uppercase tracking-wider">NEW CATEGORY</h1>
        <p className="font-sharetech text-xs text-mutedForeground uppercase tracking-widest mt-1">
          {'> create taxonomy node'}
        </p>
      </div>
      <CategoryForm
        mode="create"
        categoryOptions={categoryOptions}
        initialParentId={hasSelectedParent ? params.parentId : undefined}
      />
    </div>
  );
}
