import type {
  Visit,
  VisitFormData,
  PaginatedResponse,
  SingleResponse,
} from '@/types/api';
import { visitsMockStore } from './_visitsMockStore';

/**
 * API de visitas. Implementada hoy contra un store en memoria porque el
 * endpoint `/visits` aún no existe. Cada método deja anotado el `// TODO(backend)`
 * con la llamada real equivalente: al conectar, reemplazar el cuerpo por la
 * línea comentada (misma forma que `farmsApi`). Ver `docs/visitas-backend.md`.
 */
export const visitsApi = {
  list: async (page = 1, extra?: { per_page?: number }): Promise<PaginatedResponse<Visit>> => {
    // TODO(backend): return (await apiClient.get('/visits', { params: { page, ...extra } })).data;
    const perPage = extra?.per_page ?? 15;
    const all = visitsMockStore.all();
    const total = all.length;
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const data = all.slice((page - 1) * perPage, page * perPage);
    return {
      data,
      links: { first: '', last: '', prev: null, next: null },
      meta: { current_page: page, last_page: lastPage, per_page: perPage, total },
    };
  },

  get: async (id: number): Promise<SingleResponse<Visit>> => {
    // TODO(backend): return (await apiClient.get(`/visits/${id}`)).data;
    const visit = visitsMockStore.find(id);
    if (!visit) throw new Error('Visita no encontrada');
    return { data: visit };
  },

  create: async (data: VisitFormData): Promise<SingleResponse<Visit>> => {
    // TODO(backend): return (await apiClient.post('/visits', normalizePayload(data))).data;
    return { data: visitsMockStore.create(data) };
  },

  update: async (id: number, data: Partial<VisitFormData>): Promise<SingleResponse<Visit>> => {
    // TODO(backend): return (await apiClient.patch(`/visits/${id}`, normalizePayload(data))).data;
    const visit = visitsMockStore.update(id, data);
    if (!visit) throw new Error('Visita no encontrada');
    return { data: visit };
  },

  delete: async (id: number): Promise<void> => {
    // TODO(backend): await apiClient.delete(`/visits/${id}`);
    visitsMockStore.remove(id);
  },
};
