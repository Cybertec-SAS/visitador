import { useFieldArray, useFormContext } from 'react-hook-form';
import { StepHeader, wizardInput } from '@/components/ui/wizard';
import { PillSelect, SubHead, TextArea } from '../fields';
import { PILL_MOMENTO } from '../catalog';
import type { VisitFormValues } from '@/schemas';
import { HiOutlineCube, HiOutlinePlus, HiOutlineX } from 'react-icons/hi';

export function Step11Repuestos() {
  const { control, register } = useFormContext<VisitFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'repuestos_identificados' });

  return (
    <div className="space-y-3">
      <StepHeader
        icon={HiOutlineCube}
        title="Repuestos identificados"
        desc="Repuestos requeridos y el momento recomendado para su instalación"
      />

      {fields.length === 0 ? (
        <div className="border border-dashed border-line rounded-section py-12 text-center text-[13px] text-muted">
          Aún no se han registrado repuestos. Usa el botón de abajo para agregar uno.
        </div>
      ) : (
        <div className="border border-line rounded-section overflow-x-auto">
          <table className="w-full text-sm min-w-[680px]">
            <thead className="bg-input-bg">
              <tr>
                <th className="text-left py-2 pl-3 pr-2 text-[12px] font-semibold text-label w-32">Código</th>
                <th className="text-left py-2 px-2 text-[12px] font-semibold text-label">Repuesto</th>
                <th className="text-left py-2 px-2 text-[12px] font-semibold text-label w-24">Cantidad</th>
                <th className="text-left py-2 px-2 text-[12px] font-semibold text-label w-52">Momento</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr key={field.id} className="border-b border-line last:border-0">
                  <td className="py-2 pl-3 pr-2 align-top">
                    <input
                      {...register(`repuestos_identificados.${index}.codigo`)}
                      placeholder="Código"
                      className={wizardInput}
                    />
                  </td>
                  <td className="py-2 px-2 align-top">
                    <input
                      {...register(`repuestos_identificados.${index}.repuesto`)}
                      placeholder="Nombre del repuesto"
                      className={wizardInput}
                    />
                  </td>
                  <td className="py-2 px-2 align-top">
                    <input
                      type="number"
                      min={0}
                      {...register(`repuestos_identificados.${index}.cantidad`, {
                        setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
                      })}
                      className={wizardInput}
                    />
                  </td>
                  <td className="py-2 px-2 align-top">
                    <PillSelect
                      name={`repuestos_identificados.${index}.momento`}
                      options={PILL_MOMENTO}
                    />
                  </td>
                  <td className="py-2 pr-3 align-top">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      title="Quitar repuesto"
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
        onClick={() =>
          append({
            id: 'r' + Date.now() + Math.random().toString(36).slice(2),
            codigo: '',
            repuesto: '',
            cantidad: null,
            momento: 'programado',
          })
        }
        className="flex items-center gap-2 rounded-btn px-5 py-3 text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none"
      >
        <HiOutlinePlus className="w-4 h-4" />
        Agregar repuesto
      </button>

      <SubHead title="Observaciones generales" />
      <TextArea
        name="observaciones_generales"
        rows={4}
        placeholder="Observaciones generales de la visita..."
      />
    </div>
  );
}
