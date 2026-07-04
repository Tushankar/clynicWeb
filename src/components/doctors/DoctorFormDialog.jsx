import { useEffect, useState } from 'react';
import { IndianRupee, X, ImageOff, Plus, CalendarClock, Copy, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar } from '@/components/primitives';
import { useUpdateDoctor } from '@/hooks/useDoctors';
import { useHasRole } from '@/hooks/useRole';
import { toast, toastApiError } from '@/lib/toast';
import { cn } from '@/lib/utils';

/**
 * Edit an existing practitioner's clinic profile (owner-only): fees, the public profile
 * (photo, credentials, capabilities, bio), AND the recurring WEEKLY WORKING HOURS that
 * generate every bookable slot. Practitioners are added as team members via Clerk;
 * one-off leave/holidays live on the Time Off page. Working hours ≠ time off:
 *   - Working hours = the doctor's normal weekly schedule (here).
 *   - Time Off      = exceptions to it (leave, holidays, blocked slots).
 */

const DAYS = [
  ['mon', 'Monday'],
  ['tue', 'Tuesday'],
  ['wed', 'Wednesday'],
  ['thu', 'Thursday'],
  ['fri', 'Friday'],
  ['sat', 'Saturday'],
  ['sun', 'Sunday'],
];
const DEFAULT_WINDOW = { start: '10:00', end: '17:00' };
const emptyAvail = () => Object.fromEntries(DAYS.map(([k]) => [k, []]));

function normalizeAvailability(av) {
  const out = emptyAvail();
  if (!av) return out;
  const obj = av instanceof Map ? Object.fromEntries(av) : av;
  for (const [k] of DAYS) {
    const windows = Array.isArray(obj[k]) ? obj[k] : [];
    out[k] = windows.filter((w) => w && w.start && w.end).map((w) => ({ start: w.start, end: w.end }));
  }
  return out;
}

/** Chip input for a string[] — type + Enter (or comma) to add, × to remove. */
function TagInput({ value, onChange, placeholder }) {
  const [text, setText] = useState('');
  const add = () => {
    const v = text.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setText('');
  };
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-input bg-background px-2.5 py-2 focus-within:ring-2 focus-within:ring-ring/30">
      {value.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          {tag}
          <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))} aria-label={`Remove ${tag}`} className="text-primary/60 hover:text-primary">
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); }
          else if (e.key === 'Backspace' && !text && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={add}
        placeholder={value.length ? '' : placeholder}
        className="min-w-[8rem] flex-1 bg-transparent px-1 py-0.5 text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

function Labeled({ label, hint, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-muted-foreground/80">{hint}</span>}
    </label>
  );
}

export function DoctorFormDialog({ open, onOpenChange, doctor }) {
  const update = useUpdateDoctor();
  const canEditFees = useHasRole('owner'); // fees are owner-only; receptionists edit everything else
  const [form, setForm] = useState(null);
  const [avail, setAvail] = useState(emptyAvail);
  const [photoBroken, setPhotoBroken] = useState(false);

  useEffect(() => {
    if (open && doctor) {
      setForm({
        specialization: doctor.specialization || '',
        qualifications: doctor.qualifications || '',
        experienceYears: doctor.experienceYears ?? '',
        registrationNumber: doctor.registrationNumber || '',
        consultationFee: doctor.consultationFee ?? '',
        followUpFee: doctor.followUpFee ?? '',
        photoUrl: doctor.photoUrl || '',
        bio: doctor.bio || '',
        services: Array.isArray(doctor.services) ? doctor.services : [],
        languages: Array.isArray(doctor.languages) ? doctor.languages : [],
        isActive: doctor.isActive !== false,
      });
      setAvail(normalizeAvailability(doctor.availability));
      setPhotoBroken(false);
    }
  }, [open, doctor]);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  // Working-hours handlers
  const toggleDay = (day, on) => setAvail((a) => ({ ...a, [day]: on ? [{ ...DEFAULT_WINDOW }] : [] }));
  const addWindow = (day) => setAvail((a) => ({ ...a, [day]: [...a[day], { ...DEFAULT_WINDOW }] }));
  const removeWindow = (day, i) => setAvail((a) => ({ ...a, [day]: a[day].filter((_, idx) => idx !== i) }));
  const setWindow = (day, i, key, val) => setAvail((a) => ({ ...a, [day]: a[day].map((w, idx) => (idx === i ? { ...w, [key]: val } : w)) }));
  const copyToAll = (day) => {
    const src = avail[day].map((w) => ({ ...w }));
    setAvail(Object.fromEntries(DAYS.map(([k]) => [k, src.map((w) => ({ ...w }))])));
    toast.success(`Copied ${DAYS.find(([k]) => k === day)[1]}’s hours to every day`);
  };

  const workingDays = DAYS.filter(([k]) => avail[k].length > 0).length;

  const submit = async () => {
    const photo = form.photoUrl.trim();
    if (photo && !/^https?:\/\//i.test(photo)) return toast.error('Photo must be a hosted http(s) image URL');
    // Only keep valid windows (end after start); drop empty days.
    const availability = {};
    for (const [k] of DAYS) {
      const windows = avail[k].filter((w) => w.start && w.end && w.start < w.end);
      if (windows.length) availability[k] = windows;
    }
    try {
      await update.mutateAsync({
        id: doctor._id,
        specialization: form.specialization.trim(),
        qualifications: form.qualifications.trim(),
        experienceYears: Number(form.experienceYears) || 0,
        registrationNumber: form.registrationNumber.trim(),
        // Fees only when the owner edits — the server also strips these for other roles.
        ...(canEditFees ? { consultationFee: Number(form.consultationFee) || 0, followUpFee: Number(form.followUpFee) || 0 } : {}),
        photoUrl: photo,
        bio: form.bio.trim(),
        services: form.services,
        languages: form.languages,
        isActive: form.isActive,
        availability,
      });
      toast.success('Doctor profile updated');
      onOpenChange(false);
    } catch (e) {
      toastApiError(e);
    }
  };

  if (!doctor || !form) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit {doctor.name}</DialogTitle>
          <DialogDescription>Fees, the public profile, and the weekly hours that generate bookable slots.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[68vh] space-y-5 overflow-y-auto pr-1">
          {/* Photo + identity */}
          <div className="flex gap-4">
            <div className="shrink-0 text-center">
              {form.photoUrl.trim() && !photoBroken ? (
                <img src={form.photoUrl.trim()} alt="" onError={() => setPhotoBroken(true)} className="h-16 w-16 rounded-full object-cover ring-2 ring-border" />
              ) : (
                <div className="relative">
                  <Avatar name={doctor.name} className="h-16 w-16 text-lg" />
                  {photoBroken && <ImageOff className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-background text-destructive" />}
                </div>
              )}
            </div>
            <div className="flex-1 space-y-3">
              <Labeled label="Photo URL" hint="A real headshot lifts bookings. Host it anywhere public.">
                <Input value={form.photoUrl} onChange={(e) => { set('photoUrl')(e.target.value); setPhotoBroken(false); }} placeholder="https://…/dr-photo.jpg" />
              </Labeled>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Labeled label="Specialization"><Input value={form.specialization} onChange={(e) => set('specialization')(e.target.value)} placeholder="Orthodontist" /></Labeled>
            <Labeled label="Qualifications"><Input value={form.qualifications} onChange={(e) => set('qualifications')(e.target.value)} placeholder="BDS, MDS (Ortho)" /></Labeled>
            <Labeled label="Years of experience"><Input type="number" min="0" className="tabular" value={form.experienceYears} onChange={(e) => set('experienceYears')(e.target.value)} placeholder="12" /></Labeled>
            <Labeled label="Registration no." hint="Medical council reg. (optional)"><Input value={form.registrationNumber} onChange={(e) => set('registrationNumber')(e.target.value)} placeholder="Optional" /></Labeled>
          </div>

          {/* Fees — owner only (pricing decision) */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Labeled label="Consultation fee" hint={canEditFees ? 'Shown on booking + used for prepayment.' : 'Only the owner can change fees.'}>
              <div className="relative">
                <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input type="number" min="0" disabled={!canEditFees} className="pl-8 tabular" value={form.consultationFee} onChange={(e) => set('consultationFee')(e.target.value)} placeholder="500" />
              </div>
            </Labeled>
            <Labeled label="Follow-up fee" hint={canEditFees ? '0 = same as consultation.' : 'Owner only'}>
              <div className="relative">
                <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input type="number" min="0" disabled={!canEditFees} className="pl-8 tabular" value={form.followUpFee} onChange={(e) => set('followUpFee')(e.target.value)} placeholder="0" />
              </div>
            </Labeled>
          </div>

          {/* Capabilities */}
          <Labeled label="Services & capabilities" hint="What they treat / do — shown as tags on the website (great for SEO).">
            <TagInput value={form.services} onChange={set('services')} placeholder="Type a service and press Enter (e.g. Root canal)" />
          </Labeled>
          <Labeled label="Languages spoken">
            <TagInput value={form.languages} onChange={set('languages')} placeholder="English, Hindi, Bengali…" />
          </Labeled>

          <Labeled label="Short bio" hint="1–3 lines. Appears on the doctor card.">
            <Textarea value={form.bio} onChange={(e) => set('bio')(e.target.value)} rows={3} maxLength={600} placeholder="Dr. Sen is known for gentle, patient-first dentistry…" />
          </Labeled>

          {/* Working hours */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Weekly working hours</span>
            </div>
            <p className="text-[11px] text-muted-foreground">The recurring schedule that generates bookable slots. Add a second session for split hours (e.g. morning + evening OPD). One-off leave goes on the Time Off page.</p>

            {workingDays === 0 && (
              <p className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> No working days set — this doctor won’t have any bookable slots until you add hours.
              </p>
            )}

            <div className="divide-y rounded-xl border">
              {DAYS.map(([key, label]) => {
                const windows = avail[key];
                const on = windows.length > 0;
                return (
                  <div key={key} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-start">
                    <label className="flex w-32 shrink-0 items-center gap-2.5 pt-1.5">
                      <Switch checked={on} onCheckedChange={(v) => toggleDay(key, v)} />
                      <span className="text-sm font-medium">{label}</span>
                    </label>
                    <div className="flex-1">
                      {!on ? (
                        <p className="pt-1.5 text-sm text-muted-foreground">Closed</p>
                      ) : (
                        <div className="space-y-2">
                          {windows.map((w, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <Input type="time" value={w.start} onChange={(e) => setWindow(key, i, 'start', e.target.value)} className="w-32" />
                              <span className="text-muted-foreground">–</span>
                              <Input type="time" value={w.end} onChange={(e) => setWindow(key, i, 'end', e.target.value)} className="w-32" />
                              {windows.length > 1 && (
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeWindow(key, i)} aria-label="Remove session">
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <div className="flex flex-wrap items-center gap-3">
                            <Button type="button" variant="ghost" size="sm" className="text-primary" onClick={() => addWindow(key)}>
                              <Plus className="h-3.5 w-3.5" /> Add session
                            </Button>
                            <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" onClick={() => copyToAll(key)} title="Copy this day's hours to every day">
                              <Copy className="h-3.5 w-3.5" /> Copy to all days
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <label className="flex items-center justify-between rounded-lg border px-3.5 py-3">
            <span>
              <span className="block text-sm font-medium text-foreground">Bookable</span>
              <span className="block text-xs text-muted-foreground">Inactive doctors don’t appear on the booking page.</span>
            </span>
            <Switch checked={form.isActive} onCheckedChange={set('isActive')} />
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={update.isPending}>{update.isPending ? 'Saving…' : 'Save profile'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
