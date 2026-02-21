import React from 'react';
import { useWizardStore } from '../store/wizardStore';
import type { WizardStep } from '../store/wizardStore';
import { Upload, Settings, Play, FileText, CheckCircle2 } from 'lucide-react';

const STEPS: { key: WizardStep; label: string; icon: React.ReactNode }[] = [
  { key: 'upload', label: '1. Upload', icon: <Upload size={18} /> },
  { key: 'configure', label: '2. Configure', icon: <Settings size={18} /> },
  { key: 'processing', label: '3. Processing', icon: <Play size={18} /> },
  { key: 'results', label: '4. Results', icon: <FileText size={18} /> },
];

export const Sidebar: React.FC = () => {
  const activeStep = useWizardStore((state) => state.step);
  
  const getStepStatus = (stepKey: WizardStep) => {
    const stepOrder: WizardStep[] = ['upload', 'configure', 'processing', 'results'];
    const activeIndex = stepOrder.indexOf(activeStep);
    const currentIndex = stepOrder.indexOf(stepKey);
    
    if (currentIndex < activeIndex) return 'complete';
    if (currentIndex === activeIndex) return 'active';
    return 'pending';
  };

  return (
    <aside className="w-64 border-r border-parchment-dark h-[calc(100vh-4rem)] p-4 flex flex-col gap-2">
      <div className="text-xs uppercase font-bold text-archive-sepia/50 mb-4 px-2 tracking-widest">Workflow</div>
      
      {STEPS.map((step) => {
        const status = getStepStatus(step.key);
        const isActive = status === 'active';
        const isComplete = status === 'complete';
        
        return (
          <div
            key={step.key}
            className={`
              flex items-center gap-3 px-3 py-4 rounded transition-all duration-300
              ${isActive ? 'bg-parchment-dark text-archive-ink parchment-shadow' : 'text-archive-ink/40'}
              ${isComplete ? 'text-archive-ink/70' : ''}
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

      <div className="mt-auto border-t border-parchment-dark pt-6 px-2">
        <div className="text-[10px] text-archive-ink/30 italic uppercase tracking-tighter">
          Archive-Ready Solution
        </div>
      </div>
    </aside>
  );
};
