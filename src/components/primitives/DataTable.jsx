import { useEffect, useMemo, useState } from 'react';
import { Search, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { TableSkeleton } from './LoadingSkeleton';
import { EmptyState } from './EmptyState';

const PAGE_SIZES = [10, 25, 50];

/**
 * DataTable — one cohesive surface: search + actions live in the table card's header
 * bar, states (loading / error / empty / populated) render inside the same frame, and
 * a footer carries the record range + pagination. Handles all four states (§8.5).
 *
 * columns: [{ key, header, render?(row), className?, headClassName?, align? }]
 * Right-aligned columns get tabular numerals automatically.
 * Pagination is client-side (lists are server-bounded); controls hide when everything
 * fits on one smallest page. Opt out with `pagination={false}`.
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
  toolbar, // optional extra controls on the right of the header bar
  pagination = true,
  defaultPageSize = 10,
  className,
}) {
  const hasHeaderBar = !!search || !!toolbar;
  const count = data?.length || 0;

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const pageCount = Math.max(1, Math.ceil(count / pageSize));
  const safePage = Math.min(page, pageCount - 1);

  // Back to page 1 whenever the underlying list changes shape (new search, refetch).
  useEffect(() => {
    setPage(0);
  }, [count, search?.value]);

  const rows = useMemo(() => {
    if (!pagination || !data) return data || [];
    const start = safePage * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, pagination, safePage, pageSize]);

  const rangeStart = count === 0 ? 0 : safePage * pageSize + 1;
  const rangeEnd = pagination ? Math.min(count, (safePage + 1) * pageSize) : count;
  const showControls = pagination && count > PAGE_SIZES[0];

  return (
    <div className={cn('overflow-hidden rounded-2xl border bg-card shadow-sm', className)}>
      {/* integrated header bar — search melts into the surface, actions sit right */}
      {hasHeaderBar && (
        <div className="flex flex-col gap-3 border-b border-border/70 px-4 py-3 sm:flex-row sm:items-center">
          {search ? (
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
              <Input
                value={search.value}
                onChange={(e) => search.onChange(e.target.value)}
                placeholder={search.placeholder || 'Search…'}
                className="h-9 border-transparent bg-muted/60 pl-9 shadow-none transition-colors placeholder:text-muted-foreground/70 hover:bg-muted/80 focus-visible:border-input focus-visible:bg-card"
                aria-label={search.placeholder || 'Search'}
              />
            </div>
          ) : (
            <span className="hidden flex-1 sm:block" />
          )}
          {toolbar && <div className="flex flex-wrap items-center gap-2 sm:ml-auto">{toolbar}</div>}
        </div>
      )}

      {isLoading ? (
        <TableSkeleton cols={columns.length} bare />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-6 w-6" />
          </span>
          <p className="mt-4 text-base font-medium text-foreground">Couldn’t load this data</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">{error?.message || 'Please try again.'}</p>
          {onRetry && (
            <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
              Retry
            </Button>
          )}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState title={empty.title || 'Nothing here yet'} description={empty.description} action={empty.action} icon={empty.icon} />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/70 bg-muted/40 hover:bg-muted/40">
                {columns.map((col) => (
                  <TableHead key={col.key} className={cn(col.align === 'right' && 'text-right', col.headClassName)}>
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={getRowId(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(onRowClick && 'cursor-pointer active:bg-muted/60')}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} className={cn(col.align === 'right' && 'text-right tabular', col.className)}>
                      {col.render ? col.render(row) : row[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* footer — record range left, pagination right (hidden when it all fits) */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 bg-muted/30 px-4 py-2 sm:px-5">
            <span className="text-xs text-muted-foreground">
              {showControls ? (
                <>
                  <span className="tabular font-medium text-foreground/80">
                    {rangeStart}–{rangeEnd}
                  </span>{' '}
                  of <span className="tabular">{count}</span> {count === 1 ? 'record' : 'records'}
                </>
              ) : (
                <>
                  <span className="tabular font-medium text-foreground/80">{count}</span>{' '}
                  {count === 1 ? 'record' : 'records'}
                </>
              )}
            </span>

            {showControls && (
              <div className="flex items-center gap-4">
                <label className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
                  Rows
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(0);
                    }}
                    className="h-7 rounded-lg border border-border/70 bg-card px-1.5 text-xs font-medium text-foreground outline-none transition-colors hover:border-border focus:ring-2 focus:ring-ring/30"
                    aria-label="Rows per page"
                  >
                    {PAGE_SIZES.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex items-center gap-1.5">
                  <PagerButton
                    disabled={safePage === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </PagerButton>
                  <span className="min-w-[3.25rem] text-center text-xs tabular text-muted-foreground">
                    {safePage + 1} / {pageCount}
                  </span>
                  <PagerButton
                    disabled={safePage >= pageCount - 1}
                    onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                    label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </PagerButton>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function PagerButton({ disabled, onClick, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border/70 bg-card text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  );
}
