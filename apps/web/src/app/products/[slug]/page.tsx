import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageContainer from '@/components/layout/PageContainer';
import ProductImages from '@/components/products/ProductImages';
import ProductInfo from '@/components/products/ProductInfo';
import ProductReviewsPanel from '@/components/products/ProductReviewsPanel';
import type { Product } from '@/gql/__generated__';

export const revalidate = 3600;

const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_HTTP_URL ?? 'http://localhost:4000/graphql';

async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query ProductBySlug($search: String!) {
            products(search: $search, limit: 100) {
              id
              name
              slug
              description
              price
              stock
              status
              imageUrl
              images
              avgRating
              reviewCount
              brand { id name }
              category { id name slug }
              specs { id key value unit displayOrder }
              reviews {
                id
                productId
                rating
                title
                comment
                isVerified
                createdAt
                user { id username }
              }
            }
          }
        `,
        variables: { search: slug.split('-').join(' ') },
      }),
      next: { revalidate: 3600 },
    });

    const json = (await response.json()) as {
      data?: { products?: Product[] };
    };
    const products = json.data?.products ?? [];
    return products.find((item) => item.slug === slug) ?? null;
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query StaticParamsProducts {
            products(limit: 100) {
              slug
            }
          }
        `,
      }),
      next: { revalidate: 3600 },
    });

    const json = (await response.json()) as {
      data?: { products?: Array<{ slug: string }> };
    };

    return (json.data?.products ?? []).map((item) => ({ slug: item.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) {
    return { title: 'Product Not Found' };
  }

  return {
    title: product.name,
    description: product.description ?? `${product.name} product detail page`,
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      images: product.imageUrl ? [product.imageUrl] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <PageContainer>
      <div className="space-y-8 animate-in fade-in duration-500 py-8">
        <div className="border-b border-border pb-6">
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-widest mb-4">
            <Link href="/products" className="text-accent hover:text-accentSecondary hover:underline transition-colors">
              // CATALOG
            </Link>
            <span className="text-mutedForeground">/</span>
            <Link href={`/products?categoryId=${product.category.id}`} className="text-accentTertiary hover:text-accentSecondary hover:underline transition-colors">
              {product.category.name}
            </Link>
            <span className="text-mutedForeground">/</span>
            <span className="text-foreground">{product.name}</span>
          </div>
          
          <h1 
            className="text-3xl sm:text-4xl md:text-6xl font-black uppercase tracking-[0.1em] sm:tracking-widest text-shadow-neon font-orbitron text-accent break-words" 
          >
            SYSTEM_DATA
          </h1>
          <p className="text-mutedForeground font-mono mt-2 uppercase tracking-widest">
            // HARDWARE_SPECS_AND_TELEMETRY
            <span className="ml-2 inline-block animate-blink text-accent">_</span>
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8">
          <ProductImages images={product.images} name={product.name} category={product.category.name} productId={product.id} />
          <ProductInfo product={product} />
        </div>

        <div id="reviews" className="mt-16 pt-8 border-t border-border/50">
          <h2 className="text-2xl md:text-3xl font-orbitron font-black uppercase tracking-widest text-shadow-neon mb-2">
            USER_FEEDBACK
          </h2>
          <p className="text-mutedForeground font-mono text-sm uppercase tracking-widest mb-8">
            // VERIFIED_LOGS_AND_REPORTS
          </p>
          <ProductReviewsPanel reviews={product.reviews || []} productId={product.id} />
        </div>
      </div>
    </PageContainer>
  );
}
