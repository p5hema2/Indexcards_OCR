import React from 'react';
import { Cpu } from 'lucide-react';
import { useWizardStore, type OcrProvider, PROVIDER_DEFAULT_MODELS } from '../../store/wizardStore';

interface ModelOption {
  value: string;
  label: string;
  description: string;
}

const OLLAMA_MODELS: ModelOption[] = [
  { value: 'qwen3-vl:235b',            label: 'Qwen3-VL 235B',         description: 'Flaggschiff · 235B Parameter' },
  { value: 'qwen2.5-vl:72b',           label: 'Qwen2.5-VL 72B',        description: 'Leistungsstark & effizient' },
  { value: 'llama3.2-vision:90b',      label: 'LLaMA 3.2 Vision 90B',  description: 'Meta · Multimodal' },
  { value: 'minicpm-v:8b',             label: 'MiniCPM-V 8B',          description: 'Kompakt & schnell' },
  { value: 'llava:34b',                label: 'LLaVA 34B',             description: 'Klassisches Vision-Modell' },
];

const OPENROUTER_MODELS: ModelOption[] = [
  { value: 'qwen/qwen3-vl-8b-instruct',                 label: 'Qwen3-VL 8B',           description: 'Qwen · Standard' },
  { value: 'qwen/qwen2.5-vl-72b-instruct',              label: 'Qwen2.5-VL 72B',        description: 'Qwen · Leistungsstark' },
  { value: 'anthropic/claude-opus-4',                   label: 'Claude Opus 4',         description: 'Anthropic · Spitzenmodell' },
  { value: 'anthropic/claude-sonnet-4-5',               label: 'Claude Sonnet 4.5',     description: 'Anthropic · Ausgewogen' },
  { value: 'openai/gpt-4o',                             label: 'GPT-4o',                description: 'OpenAI · Multimodal' },
  { value: 'google/gemini-2.5-pro-preview',             label: 'Gemini 2.5 Pro',        description: 'Google · Spitzenmodell' },
  { value: 'google/gemini-2.0-flash-001',               label: 'Gemini 2.0 Flash',      description: 'Google · Schnell' },
  { value: 'meta-llama/llama-3.2-90b-vision-instruct',  label: 'LLaMA 3.2 Vision 90B', description: 'Meta · Open Source' },
  { value: 'mistralai/pixtral-large-2411',              label: 'Pixtral Large',         description: 'Mistral · Multimodal' },
  { value: 'microsoft/phi-4-multimodal-instruct',       label: 'Phi-4 Multimodal',      description: 'Microsoft · Kompakt' },
];

const PROVIDER_MODELS: Record<OcrProvider, ModelOption[]> = {
  openrouter: OPENROUTER_MODELS,
  ollama: OLLAMA_MODELS,
};

const PROVIDERS: { value: OcrProvider; label: string; endpoint: string }[] = [
  { value: 'openrouter', label: 'OpenRouter',      endpoint: 'Cloud · openrouter.ai' },
  { value: 'ollama',     label: 'Ollama FSU Jena', endpoint: 'Lokal · openwebui-workshop.test.uni-jena.de' },
];

export const ProviderSelector: React.FC = () => {
  const { provider, model, setProvider, setModel } = useWizardStore();

  const handleProviderChange = (newProvider: OcrProvider) => {
    setProvider(newProvider);
    setModel(PROVIDER_DEFAULT_MODELS[newProvider]);
  };

  const models = PROVIDER_MODELS[provider];

  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs uppercase tracking-widest text-archive-ink/40 font-semibold flex items-center gap-2">
        <Cpu className="w-3 h-3" />
        OCR-Anbieter &amp; Modell
      </label>

      <div className="flex flex-col gap-2">
        {PROVIDERS.map((p) => (
          <label
            key={p.value}
            className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors ${
              provider === p.value
                ? 'border-archive-sepia/60 bg-archive-sepia/5'
                : 'border-parchment-dark/50 hover:border-archive-sepia/30'
            }`}
          >
            <input
              type="radio"
              name="provider"
              value={p.value}
              checked={provider === p.value}
              onChange={() => handleProviderChange(p.value)}
              className="mt-0.5 accent-archive-sepia"
            />
            <div>
              <p className="text-sm font-serif text-archive-ink font-semibold">{p.label}</p>
              <p className="text-xs text-archive-ink/50 font-mono">{p.endpoint}</p>
            </div>
          </label>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-archive-ink/40 uppercase tracking-widest">Modell</label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full bg-parchment-light/30 border border-parchment-dark/50 rounded px-3 py-2 text-sm font-mono text-archive-ink focus:outline-none focus:border-archive-sepia/50 transition-colors cursor-pointer"
        >
          {models.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label} — {m.description}
            </option>
          ))}
        </select>
        <p className="text-xs text-archive-ink/40 font-mono truncate">{model}</p>
      </div>
    </div>
  );
};
