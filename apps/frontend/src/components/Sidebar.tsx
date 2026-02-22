import React from 'react';
import { useWizardStore } from '../store/wizardStore';
import type { WizardStep } from '../store/wizardStore';
import { Upload, Settings, Play, FileText, CheckCircle2, Archive, Plus } from 'lucide-react';

const STEPS: { key: WizardStep; label: string; icon: React.ReactNode }[] = [
  { key: 'upload', label: '1. Upload', icon: <Upload size={18} /> },
  { key: 'configure', label: '2. Configure', icon: <Settings size={18} /> },
  { key: 'processing', label: '3. Processing', icon: <Play size={18} /> },
  { key: 'results', label: '4. Results', icon: <FileText size={18} /> },
];

export const Sidebar: React.FC = () => {
  const activeStep = useWizardStore((state) => state.step);
  const view = useWizardStore((state) => state.view);
  const setView = useWizardStore((state) => state.setView);
  const setStep = useWizardStore((state) => state.setStep);
  const resetWizard = useWizardStore((state) => state.resetWizard);

  const getStepStatus = (stepKey: WizardStep) => {
    if (view === 'history') return 'pending';
    const stepOrder: WizardStep[] = ['upload', 'configure', 'processing', 'results'];
    const activeIndex = stepOrder.indexOf(activeStep);
    const currentIndex = stepOrder.indexOf(stepKey);

    if (currentIndex < activeIndex) return 'complete';
    if (currentIndex === activeIndex) return 'active';
    return 'pending';
  };

  const handleStepClick = (stepKey: WizardStep) => {
    // Only allow navigating back to upload or configure — never to processing or results via sidebar
    if (stepKey === 'processing' || stepKey === 'results') return;
    const status = getStepStatus(stepKey);
    if (status === 'complete') {
      setStep(stepKey);
    }
  };

  const handleShowArchive = () => {
    setView('history');
  };

  const handleNewBatch = () => {
    resetWizard();
    setView('wizard');
  };

  return (
    <aside className="w-64 border-r border-parchment-dark overflow-y-auto shrink-0 p-4 flex flex-col gap-2">
      <div className="text-xs uppercase font-bold text-archive-sepia/50 mb-4 px-2 tracking-widest">Workflow</div>

      {STEPS.map((step) => {
        const status = getStepStatus(step.key);
        const isActive = status === 'active';
        const isComplete = status === 'complete';
        const isClickable = isComplete && step.key !== 'processing' && step.key !== 'results';

        return (
          <div
            key={step.key}
            onClick={isClickable ? () => handleStepClick(step.key) : undefined}
            className={`
              flex items-center gap-3 px-3 py-4 rounded transition-all duration-300
              ${isActive ? 'bg-parchment-dark text-archive-ink parchment-shadow' : 'text-archive-ink/40'}
              ${isComplete ? 'text-archive-ink/70' : ''}
              ${isClickable ? 'cursor-pointer hover:bg-parchment-dark/40 hover:text-archive-ink' : 'cursor-default'}
            `}
          >
            <div className={`
              w-6 h-6 rounded-full flex items-center justify-center transition-colors
              ${isActive ? 'bg-archive-sepia text-parchment' : 'bg-parchment-dark/50'}
              ${isComplete ? 'bg-green-700/20 text-green-700' : ''}
            `}>
              {isComplete ? <CheckCircle2 size={14} /> : step.icon}
            </div>
            <span className={`font-medium ${isActive ? 'translate-x-1' : ''} transition-transform`}>
              {step.label}
            </span>
          </div>
        );
      })}

      {/* Divider */}
      <div className="border-t border-parchment-dark/40 mt-2 pt-3 flex flex-col gap-1">
        {/* Batch Archive link */}
        <button
          onClick={handleShowArchive}
          className={`
            flex items-center gap-3 px-3 py-3 rounded transition-all duration-200 w-full text-left
            ${view === 'history'
              ? 'bg-parchment-dark text-archive-ink parchment-shadow'
              : 'text-archive-ink/50 hover:text-archive-ink/80 hover:bg-parchment-dark/20'
            }
          `}
        >
          <div className={`
            w-6 h-6 rounded-full flex items-center justify-center transition-colors
            ${view === 'history' ? 'bg-archive-sepia text-parchment' : 'bg-parchment-dark/50'}
          `}>
            <Archive size={14} />
          </div>
          <span className="font-medium text-sm">Batch Archive</span>
        </button>

        {/* New Batch link — visible when in history view */}
        {view === 'history' && (
          <button
            onClick={handleNewBatch}
            className="flex items-center gap-3 px-3 py-3 rounded transition-all duration-200 w-full text-left text-archive-ink/50 hover:text-archive-ink/80 hover:bg-parchment-dark/20"
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-parchment-dark/50">
              <Plus size={14} />
            </div>
            <span className="font-medium text-sm">New Batch</span>
          </button>
        )}
      </div>

      <div className="mt-auto border-t border-parchment-dark pt-6 px-2">
        <div className="text-[10px] text-archive-ink/30 italic uppercase tracking-tighter">
          Archive-Ready Solution
        </div>
      </div>
    </aside>
  );
};
