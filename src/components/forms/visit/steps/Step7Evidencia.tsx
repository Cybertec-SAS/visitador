import { useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { StepHeader, wizardInput } from '@/components/ui/wizard';
import { SubHead } from '../fields';
import type { VisitFormValues } from '@/schemas';
import type { VisitFoto } from '@/types/api';
import { HiOutlineCamera, HiOutlineUpload, HiOutlineX } from 'react-icons/hi';

export function Step7Evidencia() {
  const { watch, setValue } = useFormContext<VisitFormValues>();
  const fotos = watch('evidencia.fotos') ?? [];
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList) => {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const nueva: VisitFoto = {
          id: 'f' + Date.now() + Math.random().toString(36).slice(2),
          url: ev.target?.result as string,
          descripcion: '',
        };
        setValue('evidencia.fotos', [...(watch('evidencia.fotos') ?? []), nueva], { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFoto = (id: string) => {
    setValue(
      'evidencia.fotos',
      (watch('evidencia.fotos') ?? []).filter((f) => f.id !== id),
      { shouldDirty: true },
    );
  };

  const updateDesc = (id: string, descripcion: string) => {
    setValue(
      'evidencia.fotos',
      (watch('evidencia.fotos') ?? []).map((f) => (f.id === id ? { ...f, descripcion } : f)),
      { shouldDirty: true },
    );
  };

  return (
    <div className="space-y-3">
      <StepHeader
        icon={HiOutlineCamera}
        title="Evidencia fotográfica"
        desc="Sube fotografías de la visita y describe qué muestra cada una"
      />

      <SubHead title="Fotografías" />

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 rounded-btn px-5 py-3 text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none"
      >
        <HiOutlineUpload className="w-4 h-4" />
        Agregar fotografías
      </button>

      {fotos.length === 0 ? (
        <div className="border border-dashed border-line rounded-section py-12 text-center text-[13px] text-muted">
          Aún no se han agregado fotografías. Usa el botón de arriba para subir imágenes de la visita.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3.5 max-[720px]:grid-cols-2 max-[480px]:grid-cols-1">
          {fotos.map((f) => (
            <div key={f.id} className="border border-line rounded-control overflow-hidden bg-white relative">
              <button
                type="button"
                onClick={() => removeFoto(f.id)}
                title="Quitar fotografía"
                className="absolute top-2 right-2 w-7 h-7 rounded-full grid place-items-center bg-white/90 text-danger border border-line hover:bg-danger hover:text-white transition-colors cursor-pointer z-10"
              >
                <HiOutlineX className="w-3.5 h-3.5" />
              </button>
              <img src={f.url} alt="" className="w-full h-32 object-cover" />
              <div className="p-2">
                <textarea
                  value={f.descripcion ?? ''}
                  onChange={(e) => updateDesc(f.id, e.target.value)}
                  rows={2}
                  placeholder="Describe qué muestra esta fotografía..."
                  className={`${wizardInput} resize-none min-h-9 py-2 text-[12px]`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
