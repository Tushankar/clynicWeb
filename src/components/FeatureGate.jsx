import { useFeature } from '@/hooks/usePlan';
import { usePlan } from '@/hooks/usePlan';
import { UpgradeNotice } from './UpgradeNotice';
import { LoadingSkeleton } from '@/components/primitives';

/**
 * Renders children only when the clinic's plan unlocks `feature`; otherwise shows
 * the upgrade notice. While the plan is loading, shows a skeleton (avoids a flash
 * of the upgrade prompt for users who actually have access).
 */
export function FeatureGate({ feature, children }) {
  const { isLoading } = usePlan();
  const allowed = useFeature(feature);
  if (isLoading) return <LoadingSkeleton lines={5} />;
  if (!allowed) return <UpgradeNotice feature={feature} />;
  return children;
}
