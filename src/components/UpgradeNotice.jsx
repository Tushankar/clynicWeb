import { Lock, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePlan } from '@/hooks/usePlan';
import { featureLabel, featureTier } from '@/lib/features';

/**
 * Shown when a plan-gated feature is locked for the current clinic. The backend
 * still returns 403 if the API is hit directly (hard rule 5) — this is the
 * friendly UI side of that lock + an upgrade prompt.
 */
export function UpgradeNotice({ feature, className }) {
  const plan = usePlan().data?.plan;
  const label = featureLabel(feature);
  const tier = featureTier(feature);

  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center px-6 py-14 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Lock className="h-6 w-6" />
        </span>
        <h3 className="mt-4 text-lg font-semibold">{label} is a {tier} feature</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Your clinic is on the{' '}
          {plan ? <Badge variant="secondary" className="capitalize">{plan}</Badge> : 'current'} plan. Upgrade to{' '}
          {tier} to unlock {label.toLowerCase()}.
        </p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          <Sparkles className="h-4 w-4" /> Contact your administrator to upgrade
        </div>
      </CardContent>
    </Card>
  );
}
