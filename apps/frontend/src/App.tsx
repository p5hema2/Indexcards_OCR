import { MainLayout } from './layouts/MainLayout';
import { useWizardStore } from './store/wizardStore';
import { UploadStep } from './features/upload/UploadStep';
import { ConfigureStep } from './features/configure/ConfigureStep';

function App() {
  const step = useWizardStore((state) => state.step);

  const renderStep = () => {
    switch (step) {
      case 'upload':
        return <UploadStep />;
      case 'configure':
        return <ConfigureStep />;
      case 'processing':
        return (
          <div className="p-12 border border-dashed border-parchment-dark rounded flex flex-col items-center justify-center text-archive-ink/40 uppercase tracking-widest italic animate-pulse">
            Processing collection items...
          </div>
        );
      case 'results':
        return (
          <div className="p-12 border border-dashed border-parchment-dark rounded flex flex-col items-center justify-center text-archive-ink/40 uppercase tracking-widest italic animate-pulse">
            Compiling archival results...
          </div>
        );
      default:
        return null;
    }
  };


  return (
    <MainLayout>
      <div className="space-y-6">
        {renderStep()}
      </div>
    </MainLayout>
  )
}

export default App
