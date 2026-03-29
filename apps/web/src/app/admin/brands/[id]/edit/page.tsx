import { notFound } from 'next/navigation';
import BrandForm from '@/components/admin/BrandForm';
import { GET_ADMIN_BRAND_BY_ID } from '@/gql/documents';
import { createServerApolloClient } from '@/lib/apollo/server';
import { ensureAdminAccess, redirectOnAdminGraphQLError } from '@/lib/auth/admin';

interface AdminBrandQueryData {
  brand: {
    id: string;
    name: string;
    slug: string;
    country?: string | null;
    foundedYear?: number | null;
    logoUrl?: string | null;
    websiteUrl?: string | null;
    description?: string | null;
  } | null;
}

export default async function AdminEditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { accessToken } = await ensureAdminAccess();
  const client = await createServerApolloClient(accessToken);

  let data: AdminBrandQueryData;

  try {
    const result = await client.query<AdminBrandQueryData>({
      query: GET_ADMIN_BRAND_BY_ID,
      variables: {
        id,
      },
      fetchPolicy: 'no-cache',
    });

    data = result.data;
  } catch (error) {
    redirectOnAdminGraphQLError(error);
  }

  if (!data.brand) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-orbitron text-3xl text-accent uppercase tracking-wider">EDIT BRAND</h1>
        <p className="font-sharetech text-xs text-mutedForeground uppercase tracking-widest mt-1">
          {'> update brand profile'}
        </p>
      </div>
      <BrandForm mode="edit" brand={data.brand} />
    </div>
  );
}
