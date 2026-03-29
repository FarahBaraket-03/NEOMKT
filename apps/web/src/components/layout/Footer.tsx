import Link from 'next/link';
import { Github, Globe, Twitter, Hexagon } from 'lucide-react';
import PageContainer from './PageContainer';
import Logo from '@/components/ui/Logo';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-black/80 backdrop-blur-sm mt-12">
      <PageContainer>
        <div className="py-12 grid gap-10 md:grid-cols-4 border-b border-border/30">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div className="w-8 h-8">
                <Logo />
              </div>
              <span className="font-orbitron font-black text-white text-xl tracking-widest group-hover:text-shadow-neon transition-all">
                NEOMKT
              </span>
            </Link>
            <p className="text-sm text-mutedForeground font-mono leading-relaxed max-w-xs">
              Cyberpunk catalog platform for modern technology products.
            </p>
            <div className="flex gap-4 text-mutedForeground">
              <Twitter className="w-5 h-5 hover:text-accent cursor-pointer transition-colors" />
              <Github className="w-5 h-5 hover:text-accent cursor-pointer transition-colors" />
              <Globe className="w-5 h-5 hover:text-accent cursor-pointer transition-colors" />
            </div>
          </div>

          <div>
            <h4 className="font-orbitron uppercase tracking-widest text-white border-b border-border/50 pb-3 mb-6">Catalog</h4>
            <div className="space-y-3 font-mono text-sm text-mutedForeground">
              <p className="hover:text-accent transition-colors cursor-pointer group"><span className="text-accent opacity-0 group-hover:opacity-100 mr-2 transition-opacity">&gt;</span>Products</p>
              <p className="hover:text-accent transition-colors cursor-pointer group"><span className="text-accent opacity-0 group-hover:opacity-100 mr-2 transition-opacity">&gt;</span>Brands</p>
            </div>
          </div>

          <div>
            <h4 className="font-orbitron uppercase tracking-widest text-white border-b border-border/50 pb-3 mb-6">Platform</h4>
            <div className="space-y-3 font-mono text-sm text-mutedForeground">
              <p className="hover:text-accent transition-colors cursor-pointer group"><span className="text-accent opacity-0 group-hover:opacity-100 mr-2 transition-opacity">&gt;</span>GraphQL API</p>
              <p className="hover:text-accent transition-colors cursor-pointer group"><span className="text-accent opacity-0 group-hover:opacity-100 mr-2 transition-opacity">&gt;</span>Realtime</p>
            </div>
          </div>

          <div>
            <h4 className="font-orbitron uppercase tracking-widest text-white border-b border-border/50 pb-3 mb-6">SYS.STATUS</h4>
            <div className="border border-border/50 bg-card rounded-md p-4 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-mutedForeground">MAIN_SERVER:</span>
                <span className="text-accent flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent animate-pulse" /> ONLINE</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-mutedForeground">LATENCY:</span>
                <span className="text-white">12ms</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border/30">
                <span className="text-mutedForeground">SEC_LEVEL:</span>
                <span className="text-accentTertiary">OMEGA</span>
              </div>
              <div className="pt-1 text-mutedForeground opacity-70">
                &gt; LAST_UPDATE: {new Date().toISOString().split('T')[0]}
              </div>
            </div>
          </div>
        </div>

        <div className="py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono uppercase tracking-[0.18em] text-mutedForeground">
          <div>
            © {currentYear} NEOMKT. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-2 text-accent/80">
            <Hexagon className="w-4 h-4" />
            <span>CONNECTION SECURE // ENCRYPTION LEVEL: OMEGA</span>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
