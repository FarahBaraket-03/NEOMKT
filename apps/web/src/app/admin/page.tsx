import Card, { CardContent } from '@/components/ui/Card';
import { createServerApolloClient } from '@/lib/apollo/server';
import { ensureAdminAccess, redirectOnAdminGraphQLError } from '@/lib/auth/admin';
import {
  GET_ADMIN_DASHBOARD_STATS,
  GET_ADMIN_RECENT_ACTIVITY,
} from '@/gql/documents';

interface DashboardStatsData {
  productsCount: number;
  brands: Array<{ id: string }>;
  lowStockProductsCount: number;
  reviewsCount: number;
}

interface DashboardActivityData {
  recentProducts: Array<{
    id: string;
    name: string;
    slug: string;
    createdAt: string;
  }>;
  recentReviews: Array<{
    id: string;
    title?: string | null;
    comment: string;
    createdAt: string;
    product: {
      id: string;
      name: string;
      slug: string;
    };
    user: {
      id: string;
      username: string;
    };
  }>;
}

function formatTerminalTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function AdminDashboardPage() {
  const { accessToken } = await ensureAdminAccess();
  const client = await createServerApolloClient(accessToken);

  let statsData: DashboardStatsData;
  let activityData: DashboardActivityData;

  try {
    const [{ data: fetchedStats }, { data: fetchedActivity }] = await Promise.all([
      client.query<DashboardStatsData>({
        query: GET_ADMIN_DASHBOARD_STATS,
        fetchPolicy: 'no-cache',
      }),
      client.query<DashboardActivityData>({
        query: GET_ADMIN_RECENT_ACTIVITY,
        fetchPolicy: 'no-cache',
      }),
    ]);

    statsData = fetchedStats;
    activityData = fetchedActivity;
  } catch (error) {
    redirectOnAdminGraphQLError(error);
  }

  const stats = [
    { label: 'TOTAL PRODUCTS', value: statsData.productsCount ?? 0 },
    { label: 'TOTAL BRANDS', value: statsData.brands?.length ?? 0 },
    { label: 'LOW STOCK', value: statsData.lowStockProductsCount ?? 0 },
    { label: 'PENDING REVIEWS', value: statsData.reviewsCount ?? 0 },
  ];

  const recentProducts = activityData.recentProducts ?? [];
  const recentReviews = activityData.recentReviews ?? [];

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-5">
        <h1 className="font-orbitron text-3xl md:text-4xl text-accent uppercase tracking-wider">
          ADMIN DASHBOARD
        </h1>
        <p className="font-sharetech text-xs text-mutedForeground uppercase tracking-widest mt-2">
          {'> system telemetry // administrative control surface'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((item) => (
          <Card key={item.label} variant="holographic" className="min-h-[132px]">
            <CardContent className="h-full flex flex-col justify-center gap-2">
              <p className="font-orbitron text-3xl text-accent">{item.value}</p>
              <p className="font-sharetech text-xs text-mutedForeground uppercase tracking-widest">
                {item.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card variant="terminal" className="overflow-hidden">
        <CardContent className="pt-10 space-y-6">
          <div>
            <h2 className="font-sharetech text-xs text-mutedForeground uppercase tracking-widest mb-3">
              RECENT PRODUCTS
            </h2>
            <div className="space-y-2">
              {recentProducts.map((item) => (
                <div
                  key={item.id}
                  className="border border-border bg-muted/20 px-3 py-2 cyber-chamfer-sm flex flex-wrap items-center justify-between gap-2"
                >
                  <p className="font-jetbrains text-xs uppercase tracking-wider text-foreground">
                    {'> product_created // '}
                    {item.name}
                  </p>
                  <p className="font-sharetech text-xs text-mutedForeground">
                    {formatTerminalTimestamp(item.createdAt)}
                  </p>
                </div>
              ))}
              {recentProducts.length === 0 ? (
                <p className="font-sharetech text-xs text-mutedForeground uppercase tracking-widest">
                  {'> no product activity found'}
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <h2 className="font-sharetech text-xs text-mutedForeground uppercase tracking-widest mb-3">
              RECENT REVIEWS
            </h2>
            <div className="space-y-2">
              {recentReviews.map((item) => (
                <div
                  key={item.id}
                  className="border border-border bg-muted/20 px-3 py-2 cyber-chamfer-sm flex flex-wrap items-center justify-between gap-2"
                >
                  <p className="font-jetbrains text-xs uppercase tracking-wider text-foreground">
                    {'> review_submitted // '}
                    {item.product.name}
                    {' // @'}
                    {item.user.username}
                  </p>
                  <p className="font-sharetech text-xs text-mutedForeground">
                    {formatTerminalTimestamp(item.createdAt)}
                  </p>
                </div>
              ))}
              {recentReviews.length === 0 ? (
                <p className="font-sharetech text-xs text-mutedForeground uppercase tracking-widest">
                  {'> no review activity found'}
                </p>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
