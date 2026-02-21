import { MainLayout } from './layouts/MainLayout';
import { useWizardStore } from './store/wizardStore';
import { UploadStep } from './features/upload/UploadStep';
import { ConfigureStep } from './features/configure/ConfigureStep';
import { ProcessingStep } from './features/processing/ProcessingStep';
import { ResultsStep } from './features/results/ResultsStep';

function App() {
  const step = useWizardStore((state) => state.step);

  const renderStep = () => {
    switch (step) {
      case 'upload':
        return <UploadStep />;
      case 'configure':
        return <ConfigureStep />;
      case 'processing':
        return <ProcessingStep />;
      case 'results':
        return <ResultsStep />;
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
