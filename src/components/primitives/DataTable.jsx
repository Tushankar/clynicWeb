import { Search, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { TableSkeleton } from './LoadingSkeleton';
import { EmptyState } from './EmptyState';

/**
 * DataTable — composes the shared Table with optional search and handles all
 * four states (section 8.5): loading (skeleton), error (message + retry),
 * empty (friendly EmptyState), populated.
 *
 * columns: [{ key, header, render?(row), className?, align? }]
 */
export function DataTable({
  columns,
  data,
  isLoading,
  isError,
  error,
  onRetry,
  getRowId = (row) => row._id || row.id,
  onRowClick,
  search, // { value, onChange, placeholder }
  empty = {}, // EmptyState props
  toolbar, // optional extra controls on the right of the search row
  className,
}) {
  const showSearchRow = !!search || !!toolbar;

  return (
    <div className={cn('space-y-3', className)}>
      {showSearchRow && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {search ? (
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search.value}
                onChange={(e) => search.onChange(e.target.value)}
                placeholder={search.placeholder || 'Search…'}
                className="pl-9"
                aria-label={search.placeholder || 'Search'}
              />
            </div>
          ) : (
            <span />
          )}
          {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
        </div>
      )}

      {isLoading ? (
        <TableSkeleton cols={columns.length} />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-12 text-center">
          <AlertCircle className="h-6 w-6 text-destructive" />
          <p className="mt-3 text-sm font-medium text-foreground">Couldn’t load this data</p>
          <p className="mt-1 text-sm text-muted-foreground">{error?.message || 'Please try again.'}</p>
          {onRetry && (
            <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
              Retry
            </Button>
          )}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="rounded-lg border border-dashed">
          <EmptyState title={empty.title || 'Nothing here yet'} description={empty.description} action={empty.action} icon={empty.icon} />
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {columns.map((col) => (
                  <TableHead key={col.key} className={cn(col.align === 'right' && 'text-right', col.headClassName)}>
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow
                  key={getRowId(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(onRowClick && 'cursor-pointer')}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} className={cn(col.align === 'right' && 'text-right', col.className)}>
                      {col.render ? col.render(row) : row[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
