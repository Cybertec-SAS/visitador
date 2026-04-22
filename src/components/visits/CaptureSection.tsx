import { useState } from 'react';
import type { ReactNode } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface CaptureSectionProps {
  title: string;
  count?: number;
  defaultOpen?: boolean;
  onAdd?: () => void;
  addLabel?: string;
  children: ReactNode;
}

export function CaptureSection({
  title,
  count,
  defaultOpen = false,
  onAdd,
  addLabel = '+ Agregar',
  children,
}: CaptureSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="flex items-center gap-2 font-semibold text-gray-800">
          {title}
          {count !== undefined && (
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </span>
        {open ? (
          <FiChevronUp className="text-gray-400 shrink-0" />
        ) : (
          <FiChevronDown className="text-gray-400 shrink-0" />
        )}
      </button>

      {open && (
        <div className="border-t border-gray-100">
          <div className="px-5 py-4 space-y-3">{children}</div>
          {onAdd && (
            <div className="px-5 pb-4">
              <button
                type="button"
                onClick={onAdd}
                className="w-full border-2 border-dashed border-blue-300 text-blue-600 rounded-lg py-2.5 text-sm font-medium hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                {addLabel}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
