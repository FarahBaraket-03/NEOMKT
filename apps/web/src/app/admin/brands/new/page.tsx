import BrandForm from '@/components/admin/BrandForm';

export default function AdminNewBrandPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-orbitron text-3xl text-accent uppercase tracking-wider">NEW BRAND</h1>
        <p className="font-sharetech text-xs text-mutedForeground uppercase tracking-widest mt-1">
          {'> create brand profile'}
        </p>
      </div>
      <BrandForm mode="create" />
    </div>
  );
}
