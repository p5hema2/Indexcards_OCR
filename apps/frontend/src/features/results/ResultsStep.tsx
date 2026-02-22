import React, { useEffect, useRef } from 'react';
import { Loader2, RefreshCcw } from 'lucide-react';
import { useWizardStore } from '../../store/wizardStore';
import type { ResultRow } from '../../store/wizardStore';
import { useResultsQuery } from '../../api/batchesApi';
import { useRetryBatchMutation } from '../../api/batchesApi';
import { retryImage } from '../../api/batchesApi';
import { toast } from 'sonner';
import { SummaryBanner } from './SummaryBanner';
import { ResultsTable } from './ResultsTable';
import { useResultsExport } from './useResultsExport';
import { WizardNav } from '../../components/WizardNav';

export const ResultsStep: React.FC = () => {
  const {
    batchId,
    fields,
    results,
    processingState,
    setResults,
    setStep,
    setIsProcessing,
    resetWizard,
  } = useWizardStore();

  const { isProcessing } = processingState;

  const { data: rawResults, isLoading, error } = useResultsQuery(batchId);

  const hydratedRef = useRef(false);

  // Hydrate store from backend results on mount; merge existing edits
  useEffect(() => {
    if (!rawResults || hydratedRef.current) return;
    hydratedRef.current = true;

    const existingEditsMap = new Map<string, Record<string, string>>(
      results.map((r) => [r.filename, r.editedData])
    );

    const rows: ResultRow[] = rawResults.map((r) => ({
      filename: r.filename,
      status: r.success ? 'success' : 'failed',
      error: r.error ?? undefined,
      data: r.data ?? {},
      editedData: existingEditsMap.get(r.filename) ?? {},
      duration: r.duration,
    }));

    setResults(rows);
  }, [rawResults, results, setResults]);

  const fieldLabels = fields.map((f) => f.label);

  // Computed summary stats
  const failedCount = results.filter((r) => r.status === 'failed').length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

  const { downloadCSV, downloadJSON } = useResultsExport(results, fieldLabels, batchId ?? 'batch');

  const retryBatchMutation = useRetryBatchMutation();

  const handleRetryAllFailed = () => {
    if (!batchId) return;
    setIsProcessing(true);
    retryBatchMutation.mutate(batchId, {
      onSuccess: () => {
        setStep('processing');
      },
      onError: () => {
        setIsProcessing(false);
      },
    });
  };

  const handleRetryImage = async (filename: string) => {
    if (!batchId) return;
    setIsProcessing(true);
    try {
      await retryImage(batchId, filename);
      toast.success(`Retry started for ${filename}`);
      setStep('processing');
    } catch {
      toast.error(`Failed to retry ${filename}`);
      setIsProcessing(false);
    }
  };

  const handleStartNewBatch = () => {
    resetWizard();
    // resetWizard sets step to 'upload' via initialState
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-archive-ink/50">
        <Loader2 className="w-8 h-8 animate-spin text-archive-sepia/60" />
        <p className="font-serif italic text-sm">Loading archival results...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-archive-ink/50">
        <p className="font-serif italic text-sm text-red-600/70">
          Failed to load results. Please try refreshing.
        </p>
      </div>
    );
  }

  // Empty state
  if (!isLoading && results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-archive-ink/40">
        <p className="font-serif italic text-sm">No results found for this batch.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-serif text-archive-sepia">Archival Results</h2>
        {batchId && (
          <p className="text-archive-ink/60 italic font-light font-mono text-sm">{batchId}</p>
        )}
      </div>

      {/* Summary banner */}
      <SummaryBanner
        results={results}
        batchName={batchId ?? ''}
        totalDuration={totalDuration}
        onDownloadCSV={downloadCSV}
        onDownloadJSON={downloadJSON}
        onRetryAllFailed={handleRetryAllFailed}
        failedCount={failedCount}
        isProcessing={isProcessing}
      />

      {/* Results table */}
      <ResultsTable
        results={results}
        fields={fieldLabels}
        onRetryImage={handleRetryImage}
        isProcessing={isProcessing}
      />

      <WizardNav
        next={{
          label: 'Start New Batch',
          onClick: handleStartNewBatch,
          icon: <RefreshCcw className="w-5 h-5" />,
        }}
      />
    </div>
  );
};
