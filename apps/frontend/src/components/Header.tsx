import React from 'react';
import { useWizardStore } from '../store/wizardStore';
import { RotateCcw, BookOpen, Plus } from 'lucide-react';

export const Header: React.FC = () => {
  const resetWizard = useWizardStore((state) => state.resetWizard);
  const view = useWizardStore((state) => state.view);
  const setView = useWizardStore((state) => state.setView);

  const handleShowArchive = () => {
    setView('history');
  };

  const handleNewBatch = () => {
    resetWizard();
    setView('wizard');
  };

  return (
    <header className="h-16 border-b border-parchment-dark flex items-center justify-between px-6 bg-parchment sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-archive-sepia rounded-sm flex items-center justify-center">
          <span className="text-parchment text-lg font-bold">I</span>
        </div>
        <h1 className="text-xl tracking-tight uppercase">Indexcards OCR</h1>
      </div>

      <div className="flex items-center gap-2">
        {view === 'wizard' ? (
          <>
            <button
              onClick={handleShowArchive}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-archive-sepia hover:bg-parchment-dark/30 rounded transition-colors border border-transparent hover:border-parchment-dark"
            >
              <BookOpen size={16} />
              Batch Archive
            </button>
            <button
              onClick={resetWizard}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-archive-sepia hover:bg-parchment-dark/30 rounded transition-colors border border-transparent hover:border-parchment-dark"
            >
              <RotateCcw size={16} />
              Start Fresh
            </button>
          </>
        ) : (
          <button
            onClick={handleNewBatch}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-archive-sepia hover:bg-parchment-dark/30 rounded transition-colors border border-transparent hover:border-parchment-dark"
          >
            <Plus size={16} />
            New Batch
          </button>
        )}
      </div>
    </header>
  );
};
