import { Check, Sparkles, AlertTriangle } from 'lucide-react';
import { PageHeader, LoadingSkeleton } from '@/components/primitives';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription, useChangePlan } from '@/hooks/useSubscription';
import { cn } from '@/lib/utils';
import { toast, toastApiError } from '@/lib/toast';

// Keep in sync with the backend feature matrix (clinic-api/src/config/plans.js) — the
// backend is the real lock; these lines are the marketing view of it.
const TIERS = [
  {
    key: 'basic',
    name: 'Basic',
    price: 999,
    lines: [
      'Online booking + token',
      'Self-service reschedule & cancel links',
      'Live queue + TV display',
      'Email appointment reminders',
      'Public website',
      '1 doctor',
    ],
  },
  {
    key: 'standard',
    name: 'Standard',
    price: 1999,
    lines: [
      'Everything in Basic',
      'Doctor dashboard + prescriptions',
      'Patient timeline + reports',
      'Billing, payment links & daily cash register',
      'Doctor time off & cancellation waitlist',
      'Post-visit review requests',
      'Invoice & prescription sharing (email/WhatsApp)',
      'CRM: birthday & follow-up automations',
      'WhatsApp channel — link your number',
      'CSV data export',
      'Up to 5 doctors',
    ],
  },
  {
    key: 'premium',
    name: 'Premium',
    price: 3999,
    lines: [
      'Everything in Standard',
      'Multi-branch + owner analytics with P&L',
      'QR self check-in kiosk',
      'Treatment recalls ("cleaning due in 6 months")',
      'Expense tracking',
      'AI assistant + AI-personalized campaigns',
      'Edit email templates, images & wording',
      'Unlimited doctors',
    ],
  },
  {
    key: 'ultra_premium',
    name: 'Ultra Premium',
    price: 9999,
    lines: [
      'Everything in Premium',
      'Full pharmacy management — catalog, batch inventory, expiry & low-stock alerts',
      'Suppliers & purchase orders with goods-receipt into stock',
      'Prescription-linked dispensing (FEFO) + dosage schedules',
      'Online medicine store on your website — Rx upload & pharmacist verification',
      'Pharmacy billing, expenses & margin/valuation reports',
      'Pharmacy Owner & Manager staff roles',
    ],
  },
];

export default function PlanPage() {
  const { data, isLoading } = useSubscription();
  const change = useChangePlan();
  const current = data?.plan;
  const status = data?.subscription?.status;
  const pastDue = status === 'past_due';

  const switchTo = async (plan) => {
    try {
      const res = await change.mutateAsync(plan);
      if (res?.pending) toast.success(res.message || `Upgrade to ${plan} requested — we’ll confirm shortly.`);
      else if (res?.downgraded) toast.success(`Plan changed to ${plan}`);
      else toast.success(`Plan changed to ${plan}`);
    } catch (e) {
      toastApiError(e);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plan & billing"
        description="Your subscription drives which features are unlocked."
        actions={current ? <Badge className={cn('capitalize', pastDue && 'bg-warning/15 text-warning')}>{current}{pastDue ? ' · past due' : ''}</Badge> : null}
      />
      {isLoading ? (
        <LoadingSkeleton lines={6} />
      ) : (
        <>
          {pastDue && (
            <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
              <div className="text-sm">
                <p className="font-semibold text-foreground">Your last payment failed</p>
                <p className="mt-0.5 text-muted-foreground">
                  Please update your payment method to keep your premium features. If your subscription is cancelled,
                  your clinic drops to the Basic plan and premium features are locked. Contact us if you need help.
                </p>
              </div>
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {TIERS.map((t) => {
              const isCurrent = current === t.key;
              return (
                <Card key={t.key} className={cn('flex flex-col p-5', isCurrent && 'border-primary ring-1 ring-primary')}>
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-lg font-semibold">{t.name}</h3>
                    <span className="text-sm text-muted-foreground">₹{t.price}/mo</span>
                  </div>
                  <ul className="mt-3 flex-1 space-y-1.5 text-sm">
                    {t.lines.map((l) => (
                      <li key={l} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {l}</li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    {isCurrent ? (
                      <Button variant="outline" className="w-full" disabled>Current plan</Button>
                    ) : (
                      <Button className="w-full" onClick={() => switchTo(t.key)} disabled={change.isPending}>
                        <Sparkles className="h-4 w-4" /> Switch to {t.name}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
          <p className="text-caption text-muted-foreground">
            Downgrades apply immediately. Upgrades are activated by our team after billing is set up — you’ll get a
            confirmation and won’t lose any data. (In this demo environment every change applies instantly.)
          </p>
        </>
      )}
    </div>
  );
}
