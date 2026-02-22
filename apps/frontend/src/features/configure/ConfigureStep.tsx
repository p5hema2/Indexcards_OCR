import React, { useState } from 'react';
import { Play, Archive, Info } from 'lucide-react';
import { useWizardStore } from '../../store/wizardStore';
import { TemplateSelector } from './TemplateSelector';
import { FieldManager } from './FieldManager';
import { ImagePreview } from './ImagePreview';
import { useCreateBatchMutation, useStartBatchMutation } from '../../api/batchesApi';
import { toast } from 'sonner';
import { WizardNav } from '../../components/WizardNav';

export const ConfigureStep: React.FC = () => {
  const { files, fields, sessionId, setStep, setBatchId } = useWizardStore();
  const [batchName, setBatchName] = useState(`Batch_${new Date().toISOString().slice(0, 10)}`);

  const createBatchMutation = useCreateBatchMutation();
  const startBatchMutation = useStartBatchMutation();

  const handleBack = () => {
    setStep('upload');
  };

  const handleStartExtraction = () => {
    if (!sessionId || files.length === 0) {
      toast.error('No session or files found. Please restart.');
      setStep('upload');
      return;
    }

    if (fields.length === 0) {
      toast.error('Please define at least one field for extraction.');
      return;
    }

    if (!batchName.trim()) {
      toast.error('Please provide a batch name.');
      return;
    }

    // Prepare labels for the backend
    const fieldLabels = fields.map((f) => f.label);

    createBatchMutation.mutate(
      {
        custom_name: batchName.trim(),
        session_id: sessionId,
        fields: fieldLabels,
      },
      {
        onSuccess: (data) => {
          setBatchId(data.batch_name);
          // Now start the batch
          startBatchMutation.mutate(data.batch_name, {
            onSuccess: () => {
              setStep('processing');
            },
          });
        },
      }
    );
  };

  const isPending = createBatchMutation.isPending || startBatchMutation.isPending;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-serif text-archive-sepia">Configure Archival Batch</h2>
        <p className="text-archive-ink/60 italic font-light">
          Define how the Archive should interpret and extract information from your staged items.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-8">
          <div className="space-y-6 bg-parchment-light/30 border border-parchment-dark/50 p-6 rounded-lg parchment-shadow">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-widest text-archive-ink/40 font-semibold flex items-center gap-2">
                <Archive className="w-3 h-3" />
                Batch Identity
              </label>
              <input
                type="text"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                placeholder="Unique Batch Name"
                className="w-full bg-parchment-light/30 border border-parchment-dark/50 rounded px-4 py-2 font-serif text-archive-ink focus:outline-none focus:border-archive-sepia/50 transition-colors"
              />
            </div>

            <TemplateSelector />

            <div className="pt-4 border-t border-parchment-dark/30 space-y-2">
              <h4 className="text-xs uppercase tracking-widest text-archive-ink/40 font-semibold">Batch Summary</h4>
              <div className="flex flex-col gap-1 text-sm text-archive-ink/70 font-serif italic">
                <span>• {files.length} Collection Items</span>
                <span>• {fields.length} Metadata Fields</span>
              </div>
            </div>
          </div>

          {/* Image preview - only shown when files are present */}
          {files.length > 0 && (
            <div className="bg-parchment-light/30 border border-parchment-dark/50 p-4 rounded-lg parchment-shadow">
              <ImagePreview />
            </div>
          )}

          <div className="flex items-center gap-2 p-4 bg-archive-ink/5 border border-archive-ink/20 rounded-lg text-archive-ink/60 text-xs italic">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>Changes to the batch name or templates will not affect your staged files.</span>
          </div>
        </div>

        <div className="lg:col-span-8">
          <FieldManager />
        </div>
      </div>

      <WizardNav
        back={{
          label: 'Return to Staging',
          onClick: handleBack,
          disabled: isPending,
        }}
        next={{
          label: 'Commence Processing',
          onClick: handleStartExtraction,
          disabled: fields.length === 0 || isPending || !batchName.trim(),
          loading: isPending,
          icon: <Play className="w-5 h-5 fill-current" />,
        }}
      />
    </div>
  );
};
