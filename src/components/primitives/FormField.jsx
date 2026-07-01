import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

/**
 * FormField — consistent label + control + error/description wrapper.
 * Presentational: pass the control (Input/Select/etc.) as children, typically
 * registered via react-hook-form, and the field error message via `error`.
 */
export function FormField({ label, htmlFor, error, required, description, children, className }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <Label htmlFor={htmlFor}>
          {label}
          {required && <span className="text-destructive"> *</span>}
        </Label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : (
        description && <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
