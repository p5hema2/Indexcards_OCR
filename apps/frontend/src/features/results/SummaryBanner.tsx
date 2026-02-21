import React from 'react';
import { RotateCcw, FileSpreadsheet, FileJson } from 'lucide-react';
import type { ResultRow } from '../../store/wizardStore';

interface SummaryBannerProps {
  results: ResultRow[];
  batchName: string;
  totalDuration: number;
  onDownloadCSV: () => void;
  onDownloadJSON: () => void;
  onRetryAllFailed: () => void;
  failedCount: number;
  isProcessing: boolean;
}

export const SummaryBanner: React.FC<SummaryBannerProps> = ({
  results,
  batchName,
  totalDuration,
  onDownloadCSV,
  onDownloadJSON,
  onRetryAllFailed,
  failedCount,
  isProcessing,
}) => {
  const successCount = results.filter((r) => r.status === 'success').length;

  return (
    <div className="bg-parchment-light/30 border border-parchment-dark/50 rounded-lg p-4 parchment-shadow">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Stats */}
        <div className="flex flex-wrap gap-6">
          <div className="flex flex-col">
            <span className="font-mono text-archive-sepia font-bold text-lg">{results.length}</span>
            <span className="text-xs uppercase tracking-widest text-archive-ink/40">Processed</span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-archive-sepia font-bold text-lg">{successCount}</span>
            <span className="text-xs uppercase tracking-widest text-archive-ink/40">Success</span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-archive-sepia font-bold text-lg">{failedCount}</span>
            <span className="text-xs uppercase tracking-widest text-archive-ink/40">Errors</span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-archive-sepia font-bold text-lg">{totalDuration.toFixed(1)}s</span>
            <span className="text-xs uppercase tracking-widest text-archive-ink/40">Total</span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-archive-sepia font-bold text-lg truncate max-w-[12rem]">{batchName}</span>
            <span className="text-xs uppercase tracking-widest text-archive-ink/40">Batch</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {failedCount > 0 && (
            <button
              onClick={onRetryAllFailed}
              disabled={isProcessing}
              className="flex items-center gap-2 px-3 py-2 rounded font-serif text-sm border border-parchment-dark/60 text-archive-ink/60 hover:border-archive-sepia/40 hover:text-archive-sepia hover:bg-parchment-dark/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-4 h-4" />
              Retry All Failed
            </button>
          )}
          <button
            onClick={onDownloadCSV}
            className="flex items-center gap-2 px-3 py-2 rounded font-serif text-sm border border-parchment-dark/60 text-archive-ink/60 hover:border-archive-sepia/40 hover:text-archive-sepia hover:bg-parchment-dark/10 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Download CSV
          </button>
          <button
            onClick={onDownloadJSON}
            className="flex items-center gap-2 px-3 py-2 rounded font-serif text-sm border border-parchment-dark/60 text-archive-ink/60 hover:border-archive-sepia/40 hover:text-archive-sepia hover:bg-parchment-dark/10 transition-all"
          >
            <FileJson className="w-4 h-4" />
            Download JSON
          </button>
        </div>
      </div>
    </div>
  );
};
