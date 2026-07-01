import { useRef, useState } from 'react';
import { Eye, Trash2, Upload, FileText, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { EmptyState, LoadingSkeleton } from '@/components/primitives';
import { useReports, useUploadReport, useDeleteReport, openReport } from '@/hooks/useReports';
import { useHasRole } from '@/hooks/useRole';
import { fmtDateTime } from '@/lib/format';
import { toast, toastApiError } from '@/lib/toast';

const TYPES = ['lab', 'xray', 'prescription', 'discharge', 'other'];

export function ReportsTab({ patientId }) {
  const canDelete = useHasRole('owner', 'doctor');
  const { data, isLoading, isError, error, refetch } = useReports(patientId);
  const uploadM = useUploadReport();
  const delM = useDeleteReport();
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [type, setType] = useState('lab');
  const items = data?.items || [];

  const doUpload = async () => {
    if (!file) return;
    try {
      await uploadM.mutateAsync({ patientId, type, title: file.name, file });
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      toast.success('Report uploaded');
    } catch (e) {
      toastApiError(e);
    }
  };

  const view = async (id) => {
    try {
      await openReport(id);
    } catch (e) {
      toastApiError(e, 'Could not open report');
    }
  };

  const remove = async (id) => {
    try {
      await delM.mutateAsync(id);
      toast.success('Report deleted');
    } catch (e) {
      toastApiError(e);
    }
  };

  return (
    <div className="space-y-3">
      <Card className="p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm file:mr-3 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-1.5 file:text-sm"
          />
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
            <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
          </Select>
          <Button onClick={doUpload} disabled={!file || uploadM.isPending}>
            <Upload className="h-4 w-4" /> {uploadM.isPending ? 'Uploading…' : 'Upload'}
          </Button>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-caption text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" /> Files are private — opened via a short-lived secure link, never a public URL.
        </p>
      </Card>

      {isLoading ? (
        <LoadingSkeleton lines={3} />
      ) : isError ? (
        <Card className="p-6 text-center">
          <p className="text-sm text-destructive">{error?.message || 'Could not load reports.'}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>Retry</Button>
        </Card>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed"><EmptyState icon={FileText} title="No reports" description="Upload a lab result, X-ray, or PDF." /></div>
      ) : (
        items.map((r) => (
          <Card key={r._id} className="flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{r.title || r.originalName}</div>
              <div className="text-caption capitalize text-muted-foreground">{r.type} · {fmtDateTime(r.createdAt)}</div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => view(r._id)}><Eye className="h-4 w-4" /> View</Button>
              {canDelete && <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => remove(r._id)}><Trash2 className="h-4 w-4" /></Button>}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
