import { useState } from 'react';
import { Globe2, Plus, Trash2, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useDomains, useAddDomain, useVerifyDomain, useRemoveDomain } from '@/hooks/useDomains';
import { toast, toastApiError } from '@/lib/toast';

/**
 * Custom-domain manager (step 7). Registering + verifying + resolution are handled by the
 * backend; the DNS records shown here and SSL issuance are the manual infra the owner/platform
 * completes at the registrar + ingress. Premium (CUSTOM_DOMAIN).
 */
export function CustomDomainCard() {
  const { data, isLoading } = useDomains();
  const domains = data?.items || [];
  const [input, setInput] = useState('');
  const [setup, setSetup] = useState(null);
  const add = useAddDomain();
  const verify = useVerifyDomain();
  const remove = useRemoveDomain();

  const doAdd = async () => {
    if (!input.trim()) return;
    try {
      const res = await add.mutateAsync(input.trim());
      setSetup(res.setup);
      setInput('');
      toast.success('Domain added — add the DNS records below, then Verify');
    } catch (e) {
      toastApiError(e);
    }
  };
  const doVerify = async (d) => {
    try {
      await verify.mutateAsync(d._id);
      toast.success('Domain verified');
    } catch (e) {
      toastApiError(e);
    }
  };
  const doRemove = async (d) => {
    if (!window.confirm(`Remove ${d.domain}?`)) return; // eslint-disable-line no-alert
    try {
      await remove.mutateAsync(d._id);
      toast.success('Domain removed');
    } catch (e) {
      toastApiError(e);
    }
  };

  return (
    <Card className="space-y-4 p-5">
      <div className="flex items-center gap-2">
        <Globe2 className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-medium text-muted-foreground">Custom domain</h3>
      </div>
      <p className="text-sm text-muted-foreground">Serve your site on your own domain (e.g. drsenclinic.com). Add it, point DNS, and verify.</p>

      <div className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="drsenclinic.com" />
        <Button onClick={doAdd} disabled={add.isPending}><Plus className="h-4 w-4" /> Add</Button>
      </div>

      {setup && (
        <div className="space-y-2 rounded-md border bg-muted/40 p-3 text-xs">
          <div className="font-medium text-foreground">Add these DNS records at your registrar:</div>
          {setup.dns.map((r, i) => (
            <div key={i} className="font-mono">
              <span className="text-muted-foreground">{r.type}</span> {r.host} → <span className="break-all">{r.value}</span>
            </div>
          ))}
          <div className="flex items-center gap-1 text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5" /> {setup.ssl}</div>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : domains.length === 0 ? (
        <p className="text-sm text-muted-foreground">No custom domains yet.</p>
      ) : (
        <div className="space-y-2">
          {domains.map((d) => (
            <div key={d._id} className="flex items-center gap-3 rounded-md border p-3 text-sm">
              <span className="min-w-0 flex-1 truncate font-medium">{d.domain}</span>
              {d.status === 'verified' ? (
                <Badge variant="secondary" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Verified</Badge>
              ) : (
                <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>
              )}
              <Badge variant={d.sslStatus === 'issued' ? 'secondary' : 'outline'}>SSL: {d.sslStatus}</Badge>
              {d.status !== 'verified' && <Button variant="outline" size="sm" onClick={() => doVerify(d)} disabled={verify.isPending}>Verify</Button>}
              <Button variant="ghost" size="icon" onClick={() => doRemove(d)} aria-label="Remove domain"><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
