import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

export interface Template {
  id: string;
  name: string;
  fields: string[];
}

const fetchTemplates = async (): Promise<Template[]> => {
  const response = await axios.get<Template[]>('/api/v1/templates/');
  return response.data;
};

export const useTemplatesQuery = () => {
  return useQuery({
    queryKey: ['templates'],
    queryFn: fetchTemplates,
  });
};
