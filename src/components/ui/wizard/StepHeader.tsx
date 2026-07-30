import type { ElementType } from 'react';

/** Encabezado de sección dentro de un paso del wizard. */
export function StepHeader({
  icon: Icon,
  title,
  desc,
  tag,
}: {
  icon: ElementType;
  title: string;
  desc?: string;
  tag?: string;
}) {
  return (
    <div className="flex items-center gap-3 pb-2 border-b border-line">
      <div className="w-9 h-9 rounded-logo grid place-items-center bg-primary-soft shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[15px] font-semibold text-heading m-0">{title}</h3>
        {desc && <p className="text-[13px] text-muted m-0">{desc}</p>}
      </div>
      {tag && (
        <span className="text-[10px] font-black uppercase tracking-wide text-muted bg-input-bg rounded-full px-2.5 py-1 shrink-0">
          {tag}
        </span>
      )}
    </div>
  );
}
