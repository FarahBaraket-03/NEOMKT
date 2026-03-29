import { notFound } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import { GET_ADMIN_PRODUCT_FORM } from '@/gql/documents';
import { createServerApolloClient } from '@/lib/apollo/server';
import { ensureAdminAccess, redirectOnAdminGraphQLError } from '@/lib/auth/admin';

interface ProductFormQueryData {
  product: {
    id: string;
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
    specs: Array<{
      id: string;
      key: string;
      value: string;
      unit?: string | null;
      displayOrder: number;
    }>;
  } | null;
  brands: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
}

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { accessToken } = await ensureAdminAccess();
  const client = await createServerApolloClient(accessToken);

  let data: ProductFormQueryData;

  try {
    const result = await client.query<ProductFormQueryData>({
      query: GET_ADMIN_PRODUCT_FORM,
      variables: {
        id,
      },
      fetchPolicy: 'no-cache',
    });

    data = result.data;
  } catch (error) {
    redirectOnAdminGraphQLError(error);
  }

  if (!data.product) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-orbitron text-3xl text-accent uppercase tracking-wider">EDIT PRODUCT</h1>
        <p className="font-sharetech text-xs text-mutedForeground uppercase tracking-widest mt-1">
          {'> update inventory entry'}
        </p>
      </div>
      <ProductForm mode="edit" product={data.product} brands={data.brands ?? []} categories={data.categories ?? []} />
    </div>
  );
}
