import { useMemo, useRef, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { OrgNode, PayslipEntry, UserRole } from '../../types/api';

interface PayslipListProps {
  payslips: PayslipEntry[];
  userRole: UserRole;
  orgStructure: OrgNode[];
  onUpload: (payload: { userId: string; month: number; year: number; file: File }) => Promise<void>;
  isUploading?: boolean;
}

const monthOptions = Array.from({ length: 12 }).map((_, index) => ({
  value: index + 1,
  label: new Date(2000, index, 1).toLocaleString(undefined, { month: 'long' }),
}));

const flattenOrg = (nodes: OrgNode[]): Array<{ id: string; name: string; email: string }> => {
  const result: Array<{ id: string; name: string; email: string }> = [];
  const stack = [...nodes];
  while (stack.length) {
    const node = stack.pop()!;
    result.push({ id: node.id, name: node.name, email: node.email });
    stack.push(...node.children);
  }
  return result;
};

export const PayslipList = ({ payslips, userRole, orgStructure, onUpload, isUploading = false }: PayslipListProps) => {
  const canUpload = userRole === 'ADMIN';
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const employees = useMemo(() => flattenOrg(orgStructure), [orgStructure]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    setError(null);
    if (!selectedEmployeeId) {
      setError('Select an employee before uploading.');
      return;
    }
    if (!file) {
      setError('Attach a PDF payslip to upload.');
      return;
    }

    await onUpload({ userId: selectedEmployeeId, month, year, file });
    setFile(null);
  };

  return (
    <Card
      title="Payslips"
      subtitle={canUpload ? 'Secure payroll document vault with admin uploads' : 'Monthly salary slips and payroll documents'}
      action={
        canUpload && (
          <Button variant="ghost" onClick={handleFileSelect}>
            Attach PDF
          </Button>
        )
      }
    >
      {canUpload && (
        <div className="mb-6 grid gap-4 md:grid-cols-[2fr_1fr_1fr_auto]">
          <select
            value={selectedEmployeeId}
            onChange={(event) => setSelectedEmployeeId(event.target.value)}
            className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            <option value="">Select employee</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name} · {employee.email}
              </option>
            ))}
          </select>
          <select
            value={month}
            onChange={(event) => setMonth(Number(event.target.value))}
            className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            {monthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
            className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            min={2000}
            max={2100}
          />
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleUpload} loading={isUploading}>
              Upload
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(event) => {
              const nextFile = event.target.files?.[0];
              if (nextFile) {
                setFile(nextFile);
              }
            }}
          />
          {file && (
            <p className="md:col-span-4 text-xs text-slate-300">Selected: {file.name}</p>
          )}
          {error && <p className="md:col-span-4 text-sm text-rose-300">{error}</p>}
        </div>
      )}

      <div className="space-y-4">
        {payslips.length === 0 && <p className="text-sm text-slate-300">No payslips uploaded yet.</p>}
        {payslips.map((payslip) => {
          const monthLabel = new Date(payslip.year, payslip.month - 1, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' });
          return (
            <div key={payslip.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
              <div>
                <p className="text-sm font-semibold text-white">{monthLabel}</p>
                <p className="text-xs text-slate-300">Uploaded {new Date(payslip.createdAt).toLocaleDateString()}</p>
              </div>
              <Badge variant="info">PDF</Badge>
              <Button asChild variant="secondary" className="text-sm">
                <a href={payslip.downloadUrl} target="_blank" rel="noreferrer">
                  Download
                </a>
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
