import apiClient from './client';

export interface FormResponse {
  id: number;
  form_field_id: number;
  value_text: string | null;
  value_number: number | null;
  value_boolean: boolean | null;
  value_date: string | null;
  value_json: unknown;
}

export interface FormResponseInput {
  form_field_id: number;
  value_text?: string | null;
  value_number?: number | null;
  value_boolean?: boolean | null;
  value_date?: string | null;
  value_json?: unknown;
}

export interface FormTemplate {
  id: number;
  visit_type_id: number;
  name: string;
  version: string;
  is_active: boolean;
  sections: FormTemplateSection[];
}

export interface FormTemplateSection {
  id: number;
  key: string;
  label: string;
  sort_order: number;
  fields: FormTemplateField[];
}

export interface FormTemplateField {
  id: number;
  key: string;
  label: string;
  field_type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'date' | 'multiselect' | 'file';
  is_required: boolean;
  config_json: { options?: { value: string; label: string }[]; min?: number; max?: number } | null;
}

export const visitFormResponsesApi = {
  list(visitId: number, grouped = false): Promise<FormResponse[]> {
    return apiClient.get(`/visits/${visitId}/form-responses`, { params: grouped ? { grouped: 1 } : {} }).then((r) => r.data);
  },

  create(visitId: number, data: FormResponseInput): Promise<{ data: FormResponse }> {
    return apiClient.post(`/visits/${visitId}/form-responses`, data).then((r) => r.data);
  },

  bulkUpdate(visitId: number, responses: FormResponseInput[]): Promise<void> {
    return apiClient.put(`/visits/${visitId}/form-responses/bulk`, { responses }).then(() => undefined);
  },
};

export const formTemplatesApi = {
  list(params?: { visit_type_id?: number; is_active?: boolean }): Promise<FormTemplate[]> {
    return apiClient.get('/form-templates', { params }).then((r) => r.data);
  },

  get(id: number): Promise<{ data: FormTemplate }> {
    return apiClient.get(`/form-templates/${id}`).then((r) => r.data);
  },
};
