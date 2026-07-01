import { PageHeader, EmptyState } from '@/components/primitives';

/** Placeholder for nav targets whose screens are built later in the Phase 1 loop. */
export default function ComingSoon({ title, description, icon }) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <div className="rounded-lg border border-dashed bg-card">
        <EmptyState
          icon={icon}
          title="Arriving later in Phase 1"
          description="The foundation and design system are in place; this screen is built in a later step of the Phase 1 loop."
        />
      </div>
    </div>
  );
}
