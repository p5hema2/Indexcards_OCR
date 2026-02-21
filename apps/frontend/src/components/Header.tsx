import React from 'react';
import { useWizardStore } from '../store/wizardStore';
import { RotateCcw } from 'lucide-react';

export const Header: React.FC = () => {
  const resetWizard = useWizardStore((state) => state.resetWizard);

  return (
    <header className="h-16 border-b border-parchment-dark flex items-center justify-between px-6 bg-parchment/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-archive-sepia rounded-sm flex items-center justify-center">
          <span className="text-parchment text-lg font-bold">I</span>
        </div>
        <h1 className="text-xl tracking-tight uppercase">Indexcards OCR</h1>
      </div>
      
      <button 
        onClick={resetWizard}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-archive-sepia hover:bg-parchment-dark/30 rounded transition-colors border border-transparent hover:border-parchment-dark"
      >
        <RotateCcw size={16} />
        Start Fresh
      </button>
    </header>
  );
};
