import { ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * The not-medical-advice disclaimer that MUST accompany every AI output in the UI
 * (hard rule 2). Prefer showing the server-provided `text` (authoritative); falls back
 * to a product-standard message. Rendered wherever AI content appears.
 */
const DEFAULT =
  'AI-generated — not medical advice. It does not diagnose or prescribe. A doctor must review and approve any clinical content before use.';

export function AiDisclaimer({ text, className }) {
  return (
    <div className={cn('flex items-start gap-2 rounded-md border border-amber-300/60 bg-amber-50 px-3 py-2 text-xs text-amber-900', className)}>
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{text || DEFAULT}</span>
    </div>
  );
}
