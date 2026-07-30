import type { ElementType } from 'react';

export interface SummaryItem {
  label: string;
  value: string;
}

/** Tarjeta de resumen con grid label/valor y botón "Editar" (patrón FarmForm). */
export function SummaryCard({
  icon: Icon,
  title,
  items,
  onEdit,
}: {
  icon: ElementType;
  title: string;
  items: SummaryItem[];
  onEdit?: () => void;
}) {
  return (
    <div className="border border-line rounded-control p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <span className="text-[13px] font-semibold text-heading">{title}</span>
        </div>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="text-[12px] text-primary hover:underline font-medium cursor-pointer border-none bg-transparent"
          >
            Editar
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 max-[480px]:grid-cols-1">
        {items.map(({ label, value }) => (
          <div key={label}>
            <p className="text-[11px] text-muted m-0">{label}</p>
            <p className="text-[13px] font-medium text-heading m-0 break-words">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
