import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Prescription, Pill, MagnifyingGlass, Plus, X, CheckCircle, UserCircle, CaretRight, ArrowLeft, Receipt } from '@phosphor-icons/react';
import { PageHeader, EmptyState, LoadingSkeleton, Avatar } from '@/components/primitives';
import { FeatureGate } from '@/components/FeatureGate';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { usePatients } from '@/hooks/usePatients';
import { usePrescriptions } from '@/hooks/useClinical';
import { useMedicines, useDispense, useDispenses, useDosageSchedules } from '@/hooks/usePharmacy';
import { useHasRole } from '@/hooks/useRole';
import { toast, toastApiError } from '@/lib/toast';
import { fmtDate } from '@/lib/format';
import { cn } from '@/lib/utils';

const inr = (v) => (v == null ? '₹0' : `₹${(Math.round(v * 100) / 100).toLocaleString('en-IN')}`);
const parseDurationDays = (txt) => { const m = String(txt || '').match(/(\d+)/); return m ? String(Number(m[1])) : ''; };

export default function PharmacyDispensePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dispense" description="Fulfil a doctor's prescription — pick the patient, the prescription, then the medicines to give. Stock is deducted first-expiry-first." />
      <FeatureGate feature="MEDICINE_DISPENSING">
        <DispenseBody />
      </FeatureGate>
    </div>
  );
}

function DispenseBody() {
  const [params, setParams] = useSearchParams();
  const [patientId, setPatientId] = useState(params.get('patientId') || '');
  const [rxId, setRxId] = useState(params.get('prescriptionId') || '');

  const selectPatient = (id) => { setPatientId(id); setRxId(''); };
  const clearPatient = () => { setPatientId(''); setRxId(''); setParams({}, { replace: true }); };

  if (!patientId) return <PatientPicker onSelect={selectPatient} />;
  return <PatientDispense patientId={patientId} rxId={rxId} setRxId={setRxId} onChangePatient={clearPatient} />;
}

/* ------------------------------- Patient picker ------------------------------- */

function PatientPicker({ onSelect }) {
  const [search, setSearch] = useState('');
  const { data, isLoading } = usePatients(search);
  const patients = data?.items || data?.patients || [];

  return (
    <Card className="p-5">
      <div className="relative max-w-md">
        <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search a patient by name or phone…" className="pl-9" autoFocus />
      </div>
      <div className="mt-4 divide-y">
        {isLoading ? <LoadingSkeleton lines={4} /> : patients.length === 0 ? (
          <EmptyState icon={UserCircle} title="No patients found" description="Search for the patient you're dispensing to." />
        ) : patients.slice(0, 20).map((p) => (
          <button key={p._id} onClick={() => onSelect(p._id)} className="flex w-full items-center gap-3 py-2.5 text-left transition-colors hover:bg-muted/50">
            <Avatar name={p.name} />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-foreground">{p.name}</span>
              <span className="block truncate text-xs text-muted-foreground">{p.phone || p.patientCode || '—'}</span>
            </span>
            <CaretRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    </Card>
  );
}

/* ------------------------- Patient + prescription + dispense ------------------------- */

function PatientDispense({ patientId, rxId, setRxId, onChangePatient }) {
  const { data: rxData, isLoading: rxLoading } = usePrescriptions(patientId);
  const prescriptions = rxData?.items || rxData?.prescriptions || [];
  const selectedRx = prescriptions.find((r) => r._id === rxId) || null;
  const patientName = selectedRx?.patientName || prescriptions[0]?.patientName || 'Patient';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onChangePatient}><ArrowLeft className="h-4 w-4" /> Change patient</Button>
        <span className="flex items-center gap-2 font-semibold text-foreground"><Avatar name={patientName} /> {patientName}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        {/* Prescriptions */}
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Prescriptions</h3>
          {rxLoading ? <LoadingSkeleton lines={4} /> : prescriptions.length === 0 ? (
            <EmptyState icon={Prescription} title="No prescriptions" description="This patient has no prescriptions to dispense against." />
          ) : (
            <div className="space-y-2">
              {prescriptions.map((rx) => (
                <button key={rx._id} onClick={() => setRxId(rx._id)} className={cn('w-full rounded-xl border p-3 text-left transition-colors', rx._id === rxId ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/40')}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{rx.diagnosis || 'Prescription'}</span>
                    <span className="text-xs text-muted-foreground">{fmtDate(rx.createdAt)}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{rx.items?.length || 0} medicine(s) · {rx.doctorName || 'doctor'}</p>
                </button>
              ))}
            </div>
          )}
          <PatientMedsSummary patientId={patientId} />
        </Card>

        {/* Dispense form */}
        <div>
          {selectedRx ? <DispenseForm rx={selectedRx} /> : (
            <Card className="flex h-full items-center justify-center p-10">
              <EmptyState icon={Pill} title="Select a prescription" description="Pick a prescription on the left to dispense its medicines." />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function PatientMedsSummary({ patientId }) {
  const { data } = useDosageSchedules(patientId);
  const active = (data?.items || []).filter((s) => s.active);
  if (!active.length) return null;
  return (
    <div className="mt-5 border-t pt-4">
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Current medicines</h4>
      <ul className="space-y-1.5">
        {active.slice(0, 8).map((s) => (
          <li key={s._id} className="flex items-center justify-between text-sm">
            <span className="truncate text-foreground">{s.medicineName}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{[s.dosage, s.timing].filter(Boolean).join(' · ') || '—'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* --------------------------------- Dispense form --------------------------------- */

function DispenseForm({ rx }) {
  const medicines = useMedicines({}).data?.items || [];
  const medById = useMemo(() => Object.fromEntries(medicines.map((m) => [m._id, m])), [medicines]);
  const dispense = useDispense();

  const newToken = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
  const prefillLines = () => (rx.items?.length ? rx.items : [{}]).map((it) => ({
    rxDrug: it.drug || '',
    medicineId: '',
    qty: '1',
    unitPrice: '',
    dosage: it.frequency || it.dose || '',
    timing: '',
    durationDays: parseDurationDays(it.duration),
    instructions: '',
    remindersEnabled: false,
    priceTouched: false,
  }));

  // Prefill one line per prescribed item; staff maps each free-text drug to a catalog medicine.
  const [lines, setLines] = useState([]);
  // Idempotency key for this dispense action — re-sent on retries so a double-submit is a server no-op.
  const [token, setToken] = useState(newToken);
  useEffect(() => {
    setLines(prefillLines());
    setToken(newToken());
  }, [rx._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const setLine = (i, k) => (v) => setLines((ls) => ls.map((l, idx) => {
    if (idx !== i) return l;
    const next = { ...l, [k]: v };
    if (k === 'unitPrice') next.priceTouched = true; // user typed a price → stop auto-defaulting it
    // (Re)default the unit price from the catalog whenever the medicine changes, UNLESS the user set
    // it — so switching a line to a different medicine can't keep the previous medicine's price.
    if (k === 'medicineId' && !l.priceTouched) {
      const med = medById[v];
      next.unitPrice = med && med.sellingPrice != null ? String(med.sellingPrice) : '';
    }
    return next;
  }));
  const addLine = () => setLines((ls) => [...ls, { rxDrug: '', medicineId: '', qty: '1', unitPrice: '', dosage: '', timing: '', durationDays: '', instructions: '', remindersEnabled: false }]);
  const removeLine = (i) => setLines((ls) => ls.filter((_, idx) => idx !== i));

  const validLines = lines.filter((l) => l.medicineId && Number(l.qty) >= 1);
  const total = validLines.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.unitPrice) || 0), 0);

  const submit = async () => {
    if (!validLines.length) { toast.error('Add at least one medicine with a quantity.'); return; }
    // Guard: warn on any line exceeding live availability (server enforces this too).
    const short = validLines.find((l) => { const m = medById[l.medicineId]; return m && Number(l.qty) > (m.available || 0); });
    if (short) { const m = medById[short.medicineId]; toast.error(`Only ${m.available} of ${m.name} in stock.`); return; }
    try {
      const res = await dispense.mutateAsync({
        prescriptionId: rx._id,
        clientToken: token, // idempotent: a retried submit reuses this → no duplicate dispense/invoice
        items: validLines.map((l) => ({
          medicineId: l.medicineId,
          qty: Number(l.qty),
          unitPrice: l.unitPrice === '' ? undefined : Number(l.unitPrice),
          dosage: l.dosage,
          timing: l.timing,
          durationDays: l.durationDays === '' ? undefined : Number(l.durationDays),
          instructions: l.instructions,
          remindersEnabled: l.remindersEnabled,
        })),
      });
      toast.success(res?.invoiceId ? 'Dispensed — invoice created' : 'Dispensed');
      // Clear the committed form + issue a fresh token so an accidental re-click can't re-dispense.
      setLines([{ rxDrug: '', medicineId: '', qty: '1', unitPrice: '', dosage: '', timing: '', durationDays: '', instructions: '', remindersEnabled: false, priceTouched: false }]);
      setToken(newToken());
    } catch (e) {
      toastApiError(e);
    }
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground">Dispense against: <span className="text-foreground">{rx.diagnosis || 'Prescription'}</span></h3>
        <Button variant="ghost" size="sm" onClick={addLine} disabled={!medicines.length}><Plus className="h-4 w-4" /> Add line</Button>
      </div>
      {!medicines.length && <p className="mt-3 rounded-lg border border-dashed bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">Add medicines to your catalog first (Medicines tab).</p>}

      <div className="mt-4 space-y-3">
        {lines.map((l, i) => {
          const med = medById[l.medicineId];
          const short = med && Number(l.qty) > (med.available || 0);
          return (
            <div key={i} className="rounded-xl border bg-muted/20 p-3">
              {l.rxDrug && <p className="mb-2 text-xs text-muted-foreground">Prescribed: <span className="font-medium text-foreground">{l.rxDrug}</span></p>}
              <div className="grid grid-cols-12 items-end gap-2">
                <div className="col-span-12 space-y-1 sm:col-span-5">
                  <span className="text-[11px] text-muted-foreground">Medicine</span>
                  <Select value={l.medicineId} onValueChange={setLine(i, 'medicineId')}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select medicine" /></SelectTrigger>
                    <SelectContent>
                      {medicines.map((m) => (
                        <SelectItem key={m._id} value={m._id}>
                          {m.name}{m.strength ? ` · ${m.strength}` : ''} — {m.available || 0} in stock
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3 space-y-1 sm:col-span-2">
                  <span className="text-[11px] text-muted-foreground">Qty</span>
                  <Input className={cn('h-9', short && 'border-destructive text-destructive')} type="number" min="1" value={l.qty} onChange={(e) => setLine(i, 'qty')(e.target.value)} />
                </div>
                <div className="col-span-4 space-y-1 sm:col-span-2">
                  <span className="text-[11px] text-muted-foreground">Unit ₹</span>
                  <Input className="h-9" type="number" min="0" step="0.01" value={l.unitPrice} onChange={(e) => setLine(i, 'unitPrice')(e.target.value)} />
                </div>
                <div className="col-span-4 space-y-1 sm:col-span-2">
                  <span className="text-[11px] text-muted-foreground">Dosage</span>
                  <Input className="h-9" value={l.dosage} onChange={(e) => setLine(i, 'dosage')(e.target.value)} placeholder="1-0-1" />
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive" aria-label="Remove line" onClick={() => removeLine(i)} disabled={lines.length === 1}><X className="h-4 w-4" /></Button>
                </div>
                <div className="col-span-6 space-y-1 sm:col-span-3">
                  <span className="text-[11px] text-muted-foreground">Timing</span>
                  <Input className="h-9" value={l.timing} onChange={(e) => setLine(i, 'timing')(e.target.value)} placeholder="after food" />
                </div>
                <div className="col-span-6 space-y-1 sm:col-span-2">
                  <span className="text-[11px] text-muted-foreground">Days</span>
                  <Input className="h-9" type="number" min="0" value={l.durationDays} onChange={(e) => setLine(i, 'durationDays')(e.target.value)} />
                </div>
                <div className="col-span-12 space-y-1 sm:col-span-7">
                  <span className="text-[11px] text-muted-foreground">Instructions</span>
                  <Input className="h-9" value={l.instructions} onChange={(e) => setLine(i, 'instructions')(e.target.value)} placeholder="optional" />
                </div>
              </div>
              {short && <p className="mt-1.5 text-xs text-destructive">Only {med.available || 0} in stock — reduce the quantity or add stock.</p>}
              {med?.prescriptionRequired && <p className="mt-1.5 text-xs text-muted-foreground">Rx-required — dispensing against this prescription.</p>}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between border-t pt-4">
        <span className="text-sm"><span className="text-muted-foreground">Total: </span><span className="font-semibold tabular">{inr(total)}</span></span>
        <Button onClick={submit} disabled={dispense.isPending || !validLines.length}>
          <CheckCircle className="h-4 w-4" /> {dispense.isPending ? 'Dispensing…' : 'Dispense & bill'}
        </Button>
      </div>
      <RecentDispenses patientId={rx.patientId} />
    </Card>
  );
}

function RecentDispenses({ patientId }) {
  const { data } = useDispenses({ patientId });
  const items = (data?.items || []).slice(0, 4);
  if (!items.length) return null;
  return (
    <div className="mt-5 border-t pt-4">
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recent dispenses</h4>
      <ul className="space-y-1.5">
        {items.map((d) => (
          <li key={d._id} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-foreground"><Receipt className="h-3.5 w-3.5 text-muted-foreground" />{d.items?.length || 0} medicine(s)</span>
            <span className="shrink-0 text-xs text-muted-foreground">{inr(d.total)} · {fmtDate(d.dispensedAt || d.createdAt)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
