import { useFieldArray, useFormContext } from 'react-hook-form';
import { StepHeader, wizardInput } from '@/components/ui/wizard';
import type { VisitFormValues } from '@/schemas';
import { HiOutlineExclamation, HiOutlinePlus, HiOutlineX } from 'react-icons/hi';

export function Step9Hallazgos() {
  const { control, register } = useFormContext<VisitFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'hallazgos' });

  return (
    <div className="space-y-3">
      <StepHeader
        icon={HiOutlineExclamation}
        title="Hallazgos principales"
        desc="Registra los hallazgos identificados durante la visita por sistema"
      />

      {fields.length === 0 ? (
        <div className="border border-dashed border-line rounded-section py-12 text-center text-[13px] text-muted">
          Aún no se han registrado hallazgos. Usa el botón de abajo para agregar uno.
        </div>
      ) : (
        <div className="border border-line rounded-section overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]">
            <thead className="bg-input-bg">
              <tr>
                <th className="text-left py-2 pl-3 pr-2 text-[12px] font-semibold text-label w-1/3">Sistema</th>
                <th className="text-left py-2 px-2 text-[12px] font-semibold text-label">Hallazgo</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr key={field.id} className="border-b border-line last:border-0">
                  <td className="py-2 pl-3 pr-2 align-top">
                    <input
                      {...register(`hallazgos.${index}.sistema`)}
                      placeholder="Sistema"
                      className={wizardInput}
                    />
                  </td>
                  <td className="py-2 px-2 align-top">
                    <textarea
                      {...register(`hallazgos.${index}.hallazgo`)}
                      rows={2}
                      placeholder="Describe el hallazgo..."
                      className={`${wizardInput} resize-none`}
                    />
                  </td>
                  <td className="py-2 pr-3 align-top">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      title="Quitar hallazgo"
                      className="w-7 h-7 rounded-full grid place-items-center text-danger border border-line hover:bg-danger hover:text-white transition-colors cursor-pointer"
                    >
                      <HiOutlineX className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        type="button"
        onClick={() => append({ id: 'h' + Date.now() + Math.random().toString(36).slice(2), sistema: '', hallazgo: '' })}
        className="flex items-center gap-2 rounded-btn px-5 py-3 text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none"
      >
        <HiOutlinePlus className="w-4 h-4" />
        Agregar hallazgo
      </button>
    </div>
  );
}
