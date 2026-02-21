import React from 'react';
import { LayoutGrid, Loader2 } from 'lucide-react';
import { useTemplatesQuery } from '../../api/templatesApi';
import { useWizardStore, MetadataField } from '../../store/wizardStore';
import { toast } from 'sonner';

export const TemplateSelector: React.FC = () => {
  const { setFields } = useWizardStore();
  const { data: templates, isLoading } = useTemplatesQuery();

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    
    if (templateId === 'blank') {
      setFields([]);
      toast.info('Cleared all extraction fields.');
      return;
    }

    const template = templates?.find((t) => t.id === templateId);
    if (template) {
      const newFields: MetadataField[] = template.fields.map((field) => ({
        id: Math.random().toString(36).substring(2, 11),
        label: field,
        type: 'text',
      }));
      setFields(newFields);
      toast.success(`Applied template: ${template.name}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-archive-ink/40 text-sm italic py-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Fetching collection templates...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs uppercase tracking-widest text-archive-ink/40 font-semibold flex items-center gap-2">
        <LayoutGrid className="w-3 h-3" />
        Collection Type
      </label>
      <select
        onChange={handleTemplateChange}
        className="bg-parchment-light/30 border border-parchment-dark/50 rounded px-4 py-2 font-serif text-archive-ink focus:outline-none focus:border-archive-sepia/50 transition-colors"
        defaultValue="blank"
      >
        <option value="blank">Custom / Blank Slate</option>
        {templates?.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
    </div>
  );
};
