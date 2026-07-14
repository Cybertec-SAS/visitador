import type { ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';
import { wizardInput } from '@/components/ui/wizard';
import type { PillOption, SegOption, EstadoBRMN, CriterioDef } from './catalog';

/* ── Helpers de estilo de estado (mapeados a tokens del proyecto) ──────────── */
const PILL_STYLE: Record<string, { sel: string; idle: string }> = {
  b: { sel: 'bg-field text-white border-field', idle: 'text-field border-line hover:bg-field-soft' },
  r: {
    sel: 'bg-report text-white border-report',
    idle: 'text-report border-line hover:bg-report-soft',
  },
  m: { sel: 'bg-danger text-white border-danger', idle: 'text-danger border-line hover:bg-red-50' },
  n: { sel: 'bg-muted text-white border-muted', idle: 'text-muted border-line hover:bg-input-bg' },
};

/* ── Contenedor de campo con label ─────────────────────────────────────────── */
export function Field({
  label,
  children,
  className = '',
}: {
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && <label className="text-[13px] font-semibold text-label block mb-1.5">{label}</label>}
      {children}
    </div>
  );
}

/* ── Subhead (divisor de sección estilo maqueta) ───────────────────────────── */
export function SubHead({ title, tag }: { title: string; tag?: string }) {
  return (
    <div className="flex items-center gap-3 mt-2 mb-1">
      <h4 className="text-[13px] font-bold text-heading m-0 shrink-0">{title}</h4>
      {tag && (
        <span className="text-[10px] font-black uppercase tracking-wide text-muted bg-input-bg rounded-full px-2 py-0.5 shrink-0">
          {tag}
        </span>
      )}
      <div className="flex-1 h-px bg-line" />
    </div>
  );
}

/* ── Inputs nativos enlazados a RHF ────────────────────────────────────────── */
export function TextField({
  name,
  label,
  placeholder,
  className = '',
}: {
  name: string;
  label?: string;
  placeholder?: string;
  className?: string;
}) {
  const { register } = useFormContext();
  return (
    <Field label={label} className={className}>
      <input {...register(name)} placeholder={placeholder} className={wizardInput} />
    </Field>
  );
}

export function NumberField({
  name,
  label,
  placeholder,
  unit,
  step,
  min,
  className = '',
}: {
  name: string;
  label?: string;
  placeholder?: string;
  unit?: string;
  step?: number | string;
  min?: number;
  className?: string;
}) {
  const { register } = useFormContext();
  return (
    <Field label={label} className={className}>
      <div className="relative">
        <input
          type="number"
          step={step}
          min={min}
          placeholder={placeholder}
          {...register(name, { setValueAs: (v) => (v === '' || v === null ? null : Number(v)) })}
          className={`${wizardInput} ${unit ? 'pr-14' : ''}`}
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-muted pointer-events-none">
            {unit}
          </span>
        )}
      </div>
    </Field>
  );
}

export function TextArea({
  name,
  label,
  placeholder,
  rows = 3,
  className = '',
}: {
  name: string;
  label?: string;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  const { register } = useFormContext();
  return (
    <Field label={label} className={className}>
      <textarea
        {...register(name)}
        rows={rows}
        placeholder={placeholder}
        className={`${wizardInput} resize-none`}
      />
    </Field>
  );
}

/* ── Pill select (BUENO/REGULAR/MALO/N-A) ──────────────────────────────────── */
export function PillSelect({ name, options }: { name: string; options: PillOption[] }) {
  const { watch, setValue } = useFormContext();
  const value = watch(name) as EstadoBRMN | undefined;
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {options.map((o) => {
        const active = value === o.v;
        const st = PILL_STYLE[o.v];
        return (
          <button
            key={o.v}
            type="button"
            onClick={() => setValue(name, o.v, { shouldDirty: true })}
            className={`text-[11px] font-bold rounded-full px-2.5 py-1 border transition-colors cursor-pointer ${
              active ? st.sel : `bg-white ${st.idle}`
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Seg toggle (SÍ/NO/N-A) ────────────────────────────────────────────────── */
export function SegToggle({ name, options }: { name: string; options: SegOption[] }) {
  const { watch, setValue } = useFormContext();
  const value = watch(name) as string | undefined;
  return (
    <div className="inline-flex rounded-control border border-line overflow-hidden bg-white">
      {options.map((o) => {
        const active = value === o.v;
        return (
          <button
            key={o.v}
            type="button"
            onClick={() => setValue(name, o.v, { shouldDirty: true })}
            className={`text-[12px] font-bold px-3.5 py-2 border-none transition-colors cursor-pointer ${
              active ? 'bg-primary text-white' : 'bg-transparent text-muted hover:bg-input-bg'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Lista de criterios con estado (pill o seg) ────────────────────────────── */
export function EstadoList({
  criterios,
  basePath,
  options,
}: {
  criterios: CriterioDef[];
  basePath: string;
  options: PillOption[];
}) {
  return (
    <div className="space-y-1.5">
      {criterios.map((c) => (
        <div
          key={c.key}
          className="flex items-center justify-between gap-3 border border-line rounded-control px-3 py-2 bg-white flex-wrap"
        >
          <span className="text-[13px] text-heading">{c.label}</span>
          <PillSelect name={`${basePath}.${c.key}`} options={options} />
        </div>
      ))}
    </div>
  );
}

export function SegList({
  criterios,
  basePath,
  options,
}: {
  criterios: CriterioDef[];
  basePath: string;
  options: SegOption[];
}) {
  return (
    <div className="space-y-1.5">
      {criterios.map((c) => (
        <div
          key={c.key}
          className="flex items-center justify-between gap-3 border border-line rounded-control px-3 py-2 bg-white flex-wrap"
        >
          <span className="text-[13px] text-heading">{c.label}</span>
          <SegToggle name={`${basePath}.${c.key}`} options={options} />
        </div>
      ))}
    </div>
  );
}

/* ── Medidor circular de cobertura ─────────────────────────────────────────── */
export function CoverageGauge({ pct }: { pct: number }) {
  const r = 12;
  const c = 2 * Math.PI * r;
  const color =
    pct >= 90 ? 'var(--color-field)' : pct >= 60 ? 'var(--color-report)' : 'var(--color-danger)';
  return (
    <div className="flex items-center gap-1.5">
      <svg width="30" height="30" viewBox="0 0 30 30">
        <circle cx="15" cy="15" r={r} fill="none" stroke="var(--color-line)" strokeWidth="3" />
        <circle
          cx="15"
          cy="15"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
          strokeLinecap="round"
          transform="rotate(-90 15 15)"
        />
      </svg>
      <span className="text-[11px] font-semibold text-muted tabular-nums">{pct}%</span>
    </div>
  );
}
