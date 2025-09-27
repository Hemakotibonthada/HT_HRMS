import clsx from 'clsx';
import type { ReactNode } from 'react';

export interface DataTableColumn<T> {
  header: ReactNode;
  className?: string;
  accessorKey?: keyof T & string;
  cell?: (row: T, rowIndex: number) => ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Array<DataTableColumn<T>>;
  getRowId?: (row: T, index: number) => string;
  className?: string;
  emptyMessage?: string;
}

export const DataTable = <T,>({ data, columns, getRowId, className, emptyMessage }: DataTableProps<T>) => {
  if (!data.length) {
    return (
      <div className={clsx('rounded-xl border border-dashed border-white/15 bg-white/5 p-6 text-center text-sm text-slate-300', className)}>
        {emptyMessage ?? 'No records available yet.'}
      </div>
    );
  }

  return (
    <div className={clsx('overflow-x-auto', className)}>
      <table className="min-w-full divide-y divide-white/10 text-left text-sm text-slate-100">
        <thead className="bg-white/5 text-xs uppercase tracking-[0.3em] text-slate-300">
          <tr>
            {columns.map((column, index) => (
              <th key={index} scope="col" className={clsx('px-4 py-3 font-semibold', column.className)}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.map((row, rowIndex) => (
            <tr key={getRowId ? getRowId(row, rowIndex) : rowIndex} className="hover:bg-white/5">
              {columns.map((column, colIndex) => (
                <td key={colIndex} className={clsx('px-4 py-3 align-top text-sm', column.className)}>
                  {column.cell
                    ? column.cell(row, rowIndex)
                    : column.accessorKey
                      ? ((row as Record<string, ReactNode>)[column.accessorKey] ?? '—')
                      : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
