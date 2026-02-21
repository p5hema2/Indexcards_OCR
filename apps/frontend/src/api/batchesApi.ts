import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

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
