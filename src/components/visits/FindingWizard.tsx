import { useState } from 'react';
import { FiX, FiCamera, FiArrowLeft, FiArrowRight, FiCheck } from 'react-icons/fi';
import type { FindingCategory, FindingSeverity, VisitFinding } from '@/types/api';

const CATEGORIES: { value: FindingCategory; label: string }[] = [
  { value: 'civil', label: 'Civil' },
  { value: 'metallic', label: 'Metálico' },
  { value: 'electrical', label: 'Eléctrico' },
  { value: 'mechanical', label: 'Mecánico' },
  { value: 'operational', label: 'Operacional' },
  { value: 'commercial', label: 'Comercial' },
  { value: 'quality', label: 'Calidad' },
  { value: 'safety', label: 'Seguridad' },
  { value: 'other', label: 'Otro' },
];

const SEVERITIES: { value: FindingSeverity; label: string; color: string }[] = [
  { value: 'low', label: 'Bajo', color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'medium', label: 'Medio', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'high', label: 'Alto', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { value: 'critical', label: 'Crítico', color: 'bg-red-100 text-red-700 border-red-300' },
];

interface FindingDraft {
  category: FindingCategory;
  severity: FindingSeverity;
  title: string;
  description: string;
  recommendation: string;
}

interface FindingWizardProps {
  findingNumber: number;
  onSave: (data: Omit<FindingDraft, never>) => Promise<void>;
  onCancel: () => void;
}

const STEPS = ['Categoría', 'Descripción', 'Recomendación'];

export function FindingWizard({ findingNumber, onSave, onCancel }: FindingWizardProps) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<FindingDraft>({
    category: 'civil',
    severity: 'medium',
    title: '',
    description: '',
    recommendation: '',
  });

  const canGoNext = () => {
    if (step === 0) return true;
    if (step === 1) return draft.title.trim().length > 0 && draft.description.trim().length > 0;
    return true;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(draft);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              Hallazgo #{findingNumber}
            </p>
            <h3 className="font-semibold text-gray-800">
              {STEPS[step]}
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex px-5 pt-4 gap-2">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="px-5 py-5 min-h-[280px]">
          {step === 0 && (
            <div className="space-y-4">
              {/* Photo placeholder */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-2 text-gray-400">
                <FiCamera size={28} />
                <span className="text-sm">Foto (próximamente)</span>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setDraft((d) => ({ ...d, category: c.value }))}
                      className={`py-2 px-3 rounded-lg text-sm border transition-colors ${
                        draft.category === c.value
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Severidad</label>
                <div className="flex gap-2">
                  {SEVERITIES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setDraft((d) => ({ ...d, severity: s.value }))}
                      className={`flex-1 py-2 rounded-lg text-sm border font-medium transition-all ${
                        draft.severity === s.value
                          ? s.color + ' border-current ring-2 ring-offset-1 ring-current'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                  placeholder="Ej: Platina base de malacate desnivelada"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={draft.description}
                  onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                  placeholder="Describe el hallazgo con detalle..."
                  rows={5}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recomendación
                </label>
                <textarea
                  value={draft.recommendation}
                  onChange={(e) => setDraft((d) => ({ ...d, recommendation: e.target.value }))}
                  placeholder="¿Qué acción se debe tomar? (opcional)"
                  rows={6}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  autoFocus
                />
              </div>

              {/* Summary preview */}
              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
                <p>
                  <span className="font-medium text-gray-700">Categoría:</span>{' '}
                  {CATEGORIES.find((c) => c.value === draft.category)?.label}
                  {' · '}
                  <span className="font-medium text-gray-700">Severidad:</span>{' '}
                  {SEVERITIES.find((s) => s.value === draft.severity)?.label}
                </p>
                <p className="font-medium text-gray-700">{draft.title}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 px-5 pb-6">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              <FiArrowLeft size={14} /> Anterior
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
          )}

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              disabled={!canGoNext()}
              onClick={() => setStep((s) => s + 1)}
              className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente <FiArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              disabled={saving || !canGoNext()}
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? (
                'Guardando...'
              ) : (
                <>
                  <FiCheck size={14} /> Guardar hallazgo
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
