import PageContainer from '@/components/layout/PageContainer';
import Section from '@/components/layout/Section';
import Hero from '@/components/sections/Hero';
import FeaturedProducts from '@/components/sections/FeaturedProducts';
import Stats from '@/components/sections/Stats';
import CategoriesGrid from '@/components/sections/CategoriesGrid';

export default function HomePage() {
  return (
    <PageContainer>
      <Hero />

      <Section title="FEATURED_HARDWARE" subtitle="LATEST HIGH-SIGNAL ENTRIES">
        <FeaturedProducts />
      </Section>

      <Section title="SYSTEM_METRICS" subtitle="LIVE CATALOG TELEMETRY" variant="grid">
        <Stats />
      </Section>

      <Section title="DOMAIN_NODES" subtitle="JUMP BY CATEGORY">
        <CategoriesGrid />
      </Section>
    </PageContainer>
  );
}
