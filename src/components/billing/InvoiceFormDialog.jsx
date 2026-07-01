import { useEffect, useState } from 'react';
import { Plus, Trash2, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/primitives';
import { usePatients } from '@/hooks/usePatients';
import { useCreateInvoice } from '@/hooks/useBilling';
import { toast, toastApiError } from '@/lib/toast';

const emptyItem = () => ({ description: '', amount: '', quantity: 1 });
const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

export function InvoiceFormDialog({ open, onOpenChange, patient: fixedPatient }) {
  const create = useCreateInvoice();
  const [patient, setPatient] = useState(null);
  const [psearch, setPsearch] = useState('');
  const [items, setItems] = useState([{ description: 'Consultation fee', amount: '500', quantity: 1 }]);
  const [gstRate, setGstRate] = useState('0');
  const matches = usePatients(!fixedPatient && psearch ? psearch : '').data?.items || [];

  useEffect(() => {
    if (open) {
      setPatient(fixedPatient || null);
      setPsearch('');
      setItems([{ description: 'Consultation fee', amount: '500', quantity: 1 }]);
      setGstRate('0');
    }
  }, [open, fixedPatient]);

  const setItem = (i, k, v) => setItems((p) => p.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)));
  const subtotal = round2(items.reduce((s, it) => s + (Number(it.amount) || 0) * (Number(it.quantity) || 1), 0));
  const gstAmount = round2((subtotal * (Number(gstRate) || 0)) / 100);
  const total = round2(subtotal + gstAmount);
  const canSubmit = patient && items.some((it) => it.description && Number(it.amount) >= 0);

  const submit = async () => {
    try {
      await create.mutateAsync({
        patientId: patient._id,
        gstRate: Number(gstRate) || 0,
        items: items.filter((it) => it.description).map((it) => ({ description: it.description, amount: Number(it.amount) || 0, quantity: Number(it.quantity) || 1 })),
      });
      toast.success('Invoice created');
      onOpenChange(false);
    } catch (err) {
      toastApiError(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>New invoice</DialogTitle>
          <DialogDescription>Add line items; GST is computed server-side.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <FormField label="Patient" required>
            {patient ? (
              <div className="flex items-center justify-between rounded-md border bg-accent/50 px-3 py-2 text-sm">
                <span><span className="font-medium">{patient.name}</span> · {patient.phone || '—'}</span>
                {!fixedPatient && <Button variant="ghost" size="sm" onClick={() => setPatient(null)}>Change</Button>}
              </div>
            ) : (
              <div>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={psearch} onChange={(e) => setPsearch(e.target.value)} placeholder="Search patient…" className="pl-9" />
                </div>
                {psearch && (
                  <div className="mt-1 max-h-36 overflow-auto rounded-md border">
                    {matches.length === 0 ? <p className="px-3 py-2 text-sm text-muted-foreground">No matches</p> : matches.map((m) => (
                      <button key={m._id} type="button" onClick={() => { setPatient(m); setPsearch(''); }} className="block w-full px-3 py-2 text-left text-sm hover:bg-accent">
                        {m.name} · {m.phone || '—'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </FormField>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Line items</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => setItems((p) => [...p, emptyItem()])}><Plus className="h-4 w-4" /> Add</Button>
            </div>
            {items.map((it, i) => (
              <div key={i} className="grid grid-cols-12 items-center gap-2">
                <Input className="col-span-6" placeholder="Description" value={it.description} onChange={(e) => setItem(i, 'description', e.target.value)} />
                <Input className="col-span-2" type="number" placeholder="Amount" value={it.amount} onChange={(e) => setItem(i, 'amount', e.target.value)} />
                <Input className="col-span-2" type="number" placeholder="Qty" value={it.quantity} onChange={(e) => setItem(i, 'quantity', e.target.value)} />
                <Button type="button" variant="ghost" size="icon" className="col-span-2 text-muted-foreground" onClick={() => setItems((p) => (p.length > 1 ? p.filter((_, idx) => idx !== i) : p))}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>

          <div className="flex items-end justify-between gap-4">
            <FormField label="GST rate (%)" className="w-32">
              <Input type="number" value={gstRate} onChange={(e) => setGstRate(e.target.value)} />
            </FormField>
            <div className="text-right text-sm">
              <div className="text-muted-foreground">Subtotal ₹{subtotal} · GST ₹{gstAmount}</div>
              <div className="text-lg font-semibold tabular">Total ₹{total}</div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!canSubmit || create.isPending}>{create.isPending ? 'Creating…' : 'Create invoice'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
