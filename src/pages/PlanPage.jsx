import { Check, Sparkles } from 'lucide-react';
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
];

export default function PlanPage() {
  const { data, isLoading } = useSubscription();
  const change = useChangePlan();
  const current = data?.plan;

  const switchTo = async (plan) => {
    try {
      await change.mutateAsync(plan);
      toast.success(`Plan changed to ${plan}`);
    } catch (e) {
      toastApiError(e);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plan & billing"
        description="Your subscription drives which features are unlocked."
        actions={current ? <Badge className="capitalize">{current}</Badge> : null}
      />
      {isLoading ? (
        <LoadingSkeleton lines={6} />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
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
            Plan changes apply immediately in this environment (mock gateway). In production this is driven by Razorpay
            subscription billing — the webhook updates your plan and feature access automatically.
          </p>
        </>
      )}
    </div>
  );
}
