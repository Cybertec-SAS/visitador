import apiClient from './client';

export interface GeneratedReport {
  id: number;
  version: string;
  file_url: string;
  generated_at: string;
  generated_by: { name: string };
}

export const generatedReportsApi = {
  list(visitId: number): Promise<GeneratedReport[]> {
    return apiClient.get(`/visits/${visitId}/generated-reports`).then((r) => r.data.data ?? r.data);
  },

  generate(visitId: number, reportTemplateId: number): Promise<{ message: string; job_id: string }> {
    return apiClient.post(`/visits/${visitId}/generate-report`, { report_template_id: reportTemplateId }).then((r) => r.data);
  },
};
