import React, { useState, useRef, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnDef,
} from '@tanstack/react-table';
import { RotateCcw } from 'lucide-react';
import type { ResultRow } from '../../store/wizardStore';
import { useWizardStore } from '../../store/wizardStore';
import { ThumbnailCell } from './ThumbnailCell';

// Status color lookup map — avoid Tailwind JIT string concatenation pitfall
const statusStyles: Record<string, string> = {
  success: 'text-green-700 bg-green-50',
  failed: 'text-red-600 bg-red-50',
};

interface EditableCellProps {
  value: string;
  isEdited: boolean;
  onCommit: (newValue: string) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({ value, isEdited, onCommit }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  // Keep draft in sync with external value changes (e.g. after retry)
  useEffect(() => {
    if (!editing) {
      setDraft(value);
    }
  }, [value, editing]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) {
      onCommit(draft);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commit();
    } else if (e.key === 'Escape') {
      setDraft(value);
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        className="w-full bg-transparent border-b border-archive-sepia/50 focus:outline-none font-serif text-sm text-archive-ink"
      />
    );
  }

  return (
    <span
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      className={`cursor-pointer font-serif text-sm ${isEdited ? 'text-archive-sepia font-medium' : 'text-archive-ink/80'} hover:text-archive-sepia transition-colors`}
      title={isEdited ? 'Edited — click to modify again' : 'Click to edit'}
    >
      {value || <span className="text-archive-ink/30 italic">—</span>}
      {isEdited && <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-archive-sepia/60 align-middle" />}
    </span>
  );
};

interface ResultsTableProps {
  results: ResultRow[];
  fields: string[];
  batchName: string;
  onRetryImage: (filename: string) => void;
  isProcessing: boolean;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({
  results,
  fields,
  batchName,
  onRetryImage,
  isProcessing,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const updateResultCell = useWizardStore((state) => state.updateResultCell);

  const columnHelper = createColumnHelper<ResultRow>();

  const columns: ColumnDef<ResultRow, unknown>[] = [
    // Thumbnail column
    columnHelper.display({
      id: 'thumbnail',
      header: '',
      cell: ({ row }) => (
        <ThumbnailCell batchName={batchName} filename={row.original.filename} />
      ),
    }),

    // Filename column
    columnHelper.accessor('filename', {
      header: 'File',
      cell: (info) => (
        <span className="font-mono text-xs text-archive-ink/70 break-all">
          {info.getValue()}
        </span>
      ),
    }),

    // Status column
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const status = info.getValue();
        const style = statusStyles[status] ?? 'text-archive-ink/60 bg-parchment-dark/20';
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${style}`}>
            {status}
          </span>
        );
      },
    }),

    // Dynamic field columns
    ...fields.map((field) =>
      columnHelper.display({
        id: `field_${field}`,
        header: field,
        cell: ({ row }) => {
          const ocrValue = row.original.data[field] ?? '';
          const editedValue = row.original.editedData[field];
          const displayValue = editedValue !== undefined ? editedValue : ocrValue;
          const isEdited = editedValue !== undefined && editedValue !== ocrValue;

          return (
            <EditableCell
              value={displayValue}
              isEdited={isEdited}
              onCommit={(newValue) =>
                updateResultCell(row.original.filename, field, newValue)
              }
            />
          );
        },
      })
    ),

    // Duration column
    columnHelper.accessor('duration', {
      header: 'Duration',
      cell: (info) => (
        <span className="font-mono text-xs text-archive-ink/50">
          {info.getValue().toFixed(1)}s
        </span>
      ),
    }),

    // Error column
    columnHelper.display({
      id: 'error',
      header: 'Error',
      cell: ({ row }) =>
        row.original.status === 'failed' && row.original.error ? (
          <span className="text-xs text-red-600/80 italic font-serif">{row.original.error}</span>
        ) : null,
    }),

    // Actions column
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: ({ row }) =>
        row.original.status === 'failed' ? (
          <button
            onClick={() => onRetryImage(row.original.filename)}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-serif border border-parchment-dark/50 text-archive-ink/50 hover:border-archive-sepia/40 hover:text-archive-sepia hover:bg-parchment-dark/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-3 h-3" />
            Retry
          </button>
        ) : null,
    }),
  ];

  const table = useReactTable({
    data: results,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-parchment-dark/30">
      <table className="w-full border-collapse">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-parchment-dark/30 bg-parchment-dark/10">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className={`px-4 py-3 text-left text-xs uppercase tracking-widest text-archive-ink/40 font-semibold whitespace-nowrap ${
                    header.column.getCanSort() ? 'cursor-pointer select-none hover:text-archive-sepia transition-colors' : ''
                  }`}
                >
                  {header.isPlaceholder ? null : (
                    <span className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && <span>↑</span>}
                      {header.column.getIsSorted() === 'desc' && <span>↓</span>}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, rowIndex) => (
            <tr
              key={row.id}
              className={`border-b border-parchment-dark/20 transition-colors ${
                row.original.status === 'failed'
                  ? 'bg-red-50/20'
                  : rowIndex % 2 === 0
                  ? 'bg-parchment-light/20'
                  : 'bg-transparent'
              } hover:bg-parchment-dark/10`}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-2 text-sm font-serif">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
