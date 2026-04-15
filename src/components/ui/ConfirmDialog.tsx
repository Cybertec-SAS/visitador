interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-surface border border-line rounded-panel shadow-panel p-6.5 w-full max-w-md mx-4">
        <h3 className="text-lg font-bold text-heading">{title}</h3>
        <p className="mt-2 text-sm text-muted">{message}</p>
        <div className="mt-6 flex gap-3 flex-wrap">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-btn px-4.5 py-3.5 text-sm font-bold bg-white text-heading border border-line hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-btn px-4.5 py-3.5 text-sm font-bold bg-danger text-white hover:bg-danger-hover disabled:opacity-50 transition-colors cursor-pointer border-none"
          >
            {isLoading ? 'Eliminando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
