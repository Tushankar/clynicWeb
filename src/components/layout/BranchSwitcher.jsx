import { Building2, ChevronDown, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useBranch } from '@/context/BranchContext';

/**
 * Branch switcher — shown only for Premium clinics with more than one branch.
 * "All branches" is the centralized owner view (branchId === null). Otherwise the
 * whole shell scopes branch-aware lists to the chosen branch.
 */
export function BranchSwitcher() {
  const { branches, multiBranch, branchId, setBranchId } = useBranch();
  if (!multiBranch) return null;

  const active = branches.find((b) => b._id === branchId);
  const label = branchId === null ? 'All branches' : active?.name || 'Branch';

  return (
    <Popover>
      <PopoverTrigger className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-muted">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="max-w-[10rem] truncate font-medium">{label}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-1">
        <Option label="All branches" hint="Centralized view" active={branchId === null} onSelect={() => setBranchId(null)} />
        <div className="my-1 h-px bg-border" />
        {branches.map((b) => (
          <Option key={b._id} label={b.name} hint={b.isPrimary ? 'Primary' : undefined} active={branchId === b._id} onSelect={() => setBranchId(b._id)} />
        ))}
      </PopoverContent>
    </Popover>
  );
}

function Option({ label, hint, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn('flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-muted', active && 'bg-accent')}
    >
      <span className="min-w-0 truncate">
        {label}
        {hint && <span className="ml-2 text-xs text-muted-foreground">{hint}</span>}
      </span>
      {active && <Check className="h-4 w-4 shrink-0 text-primary" />}
    </button>
  );
}
