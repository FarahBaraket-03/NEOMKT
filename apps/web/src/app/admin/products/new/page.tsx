import { createServerApolloClient } from '@/lib/apollo/server';
import { GET_ADMIN_PRODUCT_CREATE_LOOKUPS } from '@/gql/documents';
import ProductForm from '@/components/admin/ProductForm';
import { ensureAdminAccess, redirectOnAdminGraphQLError } from '@/lib/auth/admin';

interface ProductCreateLookupData {
  brands: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
}

export default async function AdminNewProductPage() {
  const { accessToken } = await ensureAdminAccess();
  const client = await createServerApolloClient(accessToken);

  let data: ProductCreateLookupData;

  try {
    const result = await client.query<ProductCreateLookupData>({
      query: GET_ADMIN_PRODUCT_CREATE_LOOKUPS,
      fetchPolicy: 'no-cache',
    });

    data = result.data;
  } catch (error) {
    redirectOnAdminGraphQLError(error);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-orbitron text-3xl text-accent uppercase tracking-wider">NEW PRODUCT</h1>
        <p className="font-sharetech text-xs text-mutedForeground uppercase tracking-widest mt-1">
          {'> create inventory entry'}
        </p>
      </div>
      <ProductForm mode="create" brands={data.brands ?? []} categories={data.categories ?? []} />
    </div>
  );
}
