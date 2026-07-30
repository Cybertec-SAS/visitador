import type { ElementType } from 'react';
import { HiOutlineCheck } from 'react-icons/hi';

export interface WizardStep {
  title: string;
  description: string;
  icon: ElementType;
}

interface StepIndicatorProps {
  steps: WizardStep[];
  current: number;
  /** Sólo se permite navegar a pasos ya completados (índice < current). */
  onSelect: (index: number) => void;
  progressPct: number;
}

/** Indicador de pasos + barra de progreso (patrón de FarmForm, reutilizable). */
export function StepIndicator({ steps, current, onSelect, progressPct }: StepIndicatorProps) {
  return (
    <div className="border border-line rounded-section p-4 bg-white space-y-3">
      <div className="flex items-center gap-0 overflow-x-auto pb-1 w-full">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === current;
          const isDone = i < current;
          return (
            <div key={i} className="flex items-center shrink-0 last:shrink">
              <button
                type="button"
                onClick={() => {
                  if (isDone) onSelect(i);
                }}
                disabled={!isDone}
                className={`flex items-center gap-2 rounded-control px-2.5 py-2 transition-colors border-none ${
                  isActive
                    ? 'bg-primary-soft cursor-default'
                    : isDone
                      ? 'hover:bg-primary-soft/60 cursor-pointer bg-transparent'
                      : 'opacity-35 cursor-default bg-transparent'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg grid place-items-center shrink-0 transition-colors ${
                    isDone || isActive ? 'bg-primary text-white' : 'bg-input-bg text-muted'
                  }`}
                >
                  {isDone ? <HiOutlineCheck className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                </div>
                <div className="text-left hidden min-[720px]:block">
                  <p
                    className={`text-[12px] font-semibold m-0 ${
                      isActive ? 'text-primary' : isDone ? 'text-heading' : 'text-muted'
                    }`}
                  >
                    {s.title}
                  </p>
                  <p className="text-[11px] text-muted m-0">{s.description}</p>
                </div>
                <span
                  className={`text-[12px] font-bold min-[720px]:hidden ${
                    isActive ? 'text-primary' : isDone ? 'text-heading' : 'text-muted'
                  }`}
                >
                  {i + 1}
                </span>
              </button>

              {i < steps.length - 1 && (
                <div className="w-5 mx-1 shrink-0">
                  <div className="h-0.5 bg-line rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: isDone ? '100%' : '0%' }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] text-muted">
            Paso {current + 1} de {steps.length} — {steps[current].title}
          </span>
          <span className="text-[12px] font-semibold text-primary">{Math.round(progressPct)}%</span>
        </div>
        <div className="h-1.5 bg-line rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
