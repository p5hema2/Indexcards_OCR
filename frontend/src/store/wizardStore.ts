import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WizardStep = 'upload' | 'configure' | 'processing' | 'results';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  preview?: string;
}

export interface MetadataField {
  id: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'enum';
  options?: string[];
}

interface WizardState {
  step: WizardStep;
  files: UploadedFile[];
  fields: MetadataField[];
  sessionId: string | null;
  batchId: string | null;
  setStep: (step: WizardStep) => void;
  setSessionId: (id: string | null) => void;
  resetWizard: () => void;
  updateFiles: (files: UploadedFile[]) => void;
  setBatchId: (id: string | null) => void;
  setFields: (fields: MetadataField[]) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
}

const initialState = {
  step: 'upload' as WizardStep,
  files: [],
  fields: [],
  sessionId: null,
  batchId: null,
};

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      ...initialState,
      setStep: (step) => set({ step }),
      setSessionId: (sessionId) => set({ sessionId }),
      resetWizard: () => set(initialState),
      updateFiles: (files) => set({ files }),
      setBatchId: (batchId) => set({ batchId }),
      setFields: (fields) => set({ fields }),
      removeFile: (id) =>
        set((state) => ({
          files: state.files.filter((file) => file.id !== id),
        })),
      clearFiles: () => set({ files: [] }),
    }),
    {
      name: 'wizard-storage',
    }
  )
);
