/**
 * Store en memoria para visitas (temporal, hasta que backend publique el
 * endpoint `/visits`). Simula persistencia durante la sesión. Ver
 * `docs/visitas-backend.md` para el contrato de datos definitivo.
 */
import type { Visit, VisitFormData } from '@/types/api';

let seq = 100;
const store: Visit[] = [];

function now(): string {
  return new Date().toISOString();
}

export const visitsMockStore = {
  all(): Visit[] {
    // Orden descendente por fecha de creación (más reciente primero)
    return [...store].sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  find(id: number): Visit | undefined {
    return store.find((v) => v.id === id);
  },

  create(data: VisitFormData): Visit {
    const visit: Visit = {
      ...data,
      id: ++seq,
      status: data.status ?? 'draft',
      created_at: now(),
      updated_at: now(),
    };
    store.push(visit);
    return visit;
  },

  update(id: number, data: Partial<VisitFormData>): Visit | undefined {
    const idx = store.findIndex((v) => v.id === id);
    if (idx === -1) return undefined;
    store[idx] = { ...store[idx], ...data, id, updated_at: now() } as Visit;
    return store[idx];
  },

  remove(id: number): boolean {
    const idx = store.findIndex((v) => v.id === id);
    if (idx === -1) return false;
    store.splice(idx, 1);
    return true;
  },
};
