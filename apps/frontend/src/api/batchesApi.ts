import axios from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { ExtractionResult } from '../store/wizardStore';

export interface BatchCreate {
  custom_name: string;
  session_id: string;
  fields: string[];
}

export interface BatchResponse {
  batch_name: string;
  status: string;
  files_count: number;
}

const createBatch = async (data: BatchCreate): Promise<BatchResponse> => {
  const response = await axios.post<BatchResponse>('/api/v1/batches/', data);
  return response.data;
};

const startBatch = async (batchName: string): Promise<{ message: string; batch_name: string }> => {
  const response = await axios.post<{ message: string; batch_name: string }>(`/api/v1/batches/${batchName}/start`);
  return response.data;
};

export const cancelBatch = async (batchName: string): Promise<{ message: string; batch_name: string }> => {
  const response = await axios.post<{ message: string; batch_name: string }>(`/api/v1/batches/${batchName}/cancel`);
  return response.data;
};

export const fetchResults = async (batchName: string): Promise<ExtractionResult[]> => {
  const response = await axios.get<ExtractionResult[]>(`/api/v1/batches/${batchName}/results`);
  return response.data;
};

export const retryImage = async (batchName: string, filename: string): Promise<{ message: string }> => {
  const response = await axios.post<{ message: string }>(`/api/v1/batches/${batchName}/retry-image/${filename}`);
  return response.data;
};

export const retryBatch = async (batchName: string): Promise<{ message: string; batch_name: string }> => {
  const response = await axios.post<{ message: string; batch_name: string }>(`/api/v1/batches/${batchName}/retry`);
  return response.data;
};

export const useCreateBatchMutation = () => {
  return useMutation({
    mutationFn: createBatch,
    onSuccess: (data) => {
      toast.success(`Batch "${data.batch_name}" created successfully.`);
    },
    onError: (error: Error & { response?: { data?: { detail?: string } } }) => {
      const errorMessage = error.response?.data?.detail || 'Failed to create batch.';
      toast.error(errorMessage);
    },
  });
};

export const useStartBatchMutation = () => {
  return useMutation({
    mutationFn: startBatch,
    onSuccess: (data) => {
      toast.success(`Processing started for ${data.batch_name}.`);
    },
    onError: (error: Error & { response?: { data?: { detail?: string } } }) => {
      const errorMessage = error.response?.data?.detail || 'Failed to start processing.';
      toast.error(errorMessage);
    },
  });
};

export const useCancelBatchMutation = () => {
  return useMutation({
    mutationFn: cancelBatch,
    onError: (error: Error & { response?: { data?: { detail?: string } } }) => {
      const errorMessage = error.response?.data?.detail || 'Failed to cancel batch.';
      toast.error(errorMessage);
    },
  });
};

export const useRetryImageMutation = () => {
  return useMutation({
    mutationFn: ({ batchName, filename }: { batchName: string; filename: string }) =>
      retryImage(batchName, filename),
    onSuccess: () => {
      toast.success('Image queued for retry.');
    },
    onError: (error: Error & { response?: { data?: { detail?: string } } }) => {
      const errorMessage = error.response?.data?.detail || 'Failed to retry image.';
      toast.error(errorMessage);
    },
  });
};

export const useRetryBatchMutation = () => {
  return useMutation({
    mutationFn: retryBatch,
    onSuccess: (data) => {
      toast.success(`Retry started for ${data.batch_name}.`);
    },
    onError: (error: Error & { response?: { data?: { detail?: string } } }) => {
      const errorMessage = error.response?.data?.detail || 'Failed to retry batch.';
      toast.error(errorMessage);
    },
  });
};

export const useResultsQuery = (batchName: string | null) => {
  return useQuery({
    queryKey: ['results', batchName],
    queryFn: () => fetchResults(batchName!),
    enabled: !!batchName,
  });
};
