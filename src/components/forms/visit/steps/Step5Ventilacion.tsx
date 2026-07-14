import { StepHeader } from '@/components/ui/wizard';
import { SubHead, NumberField, TextField, TextArea, PillSelect, SegToggle, Field } from '../fields';
import { PILL_BRM, PILL_BM, SEG_SINONA } from '../catalog';
import { HiOutlineSparkles } from 'react-icons/hi';
import type { PillOption } from '../catalog';

function EstadoField({ name, label, options }: { name: string; label: string; options: PillOption[] }) {
  return (
    <Field label={label}>
      <PillSelect name={name} options={options} />
    </Field>
  );
}

export function Step5Ventilacion() {
  return (
    <div className="space-y-3">
      <StepHeader
        icon={HiOutlineSparkles}
        title="Sistema de ventilación / entrada de aire / refrigeración"
        desc="Extractores, inlets, nebulización, panel húmedo, túnel y ventiladores"
      />

      <div className="grid grid-cols-3 gap-5 max-[900px]:grid-cols-1">
        {/* Col 1 */}
        <div className="space-y-3">
          <SubHead title="Extractores" />
          <div className="grid grid-cols-[1.4fr_0.8fr] gap-3.5">
            <TextField name="ventilacion.extractores.marca" label="Marca" placeholder="Ej. Munters" />
            <NumberField name="ventilacion.extractores.cantidad" label="Cantidad" min={0} />
          </div>
          <EstadoField name="ventilacion.extractores.estado" label="Estado" options={PILL_BRM} />

          <SubHead title="Panel húmedo" />
          <EstadoField name="ventilacion.panel_humedo.estado_general" label="Estado general" options={PILL_BRM} />
          <Field label="Moja uniforme">
            <SegToggle name="ventilacion.panel_humedo.moja_uniforme" options={SEG_SINONA} />
          </Field>
          <EstadoField name="ventilacion.panel_humedo.estado_bomba" label="Estado de la bomba" options={PILL_BM} />
        </div>

        {/* Col 2 */}
        <div className="space-y-3">
          <SubHead title="Inlets" />
          <div className="grid grid-cols-2 gap-3.5">
            <NumberField name="ventilacion.inlets.velocidad" label="Velocidad de aire" unit="m/s" step="0.1" />
            <NumberField name="ventilacion.inlets.cantidad" label="Cantidad" min={0} />
          </div>
          <EstadoField name="ventilacion.inlets.estado" label="Estado" options={PILL_BRM} />

          <SubHead title="Túnel door / Portón cortina" />
          <div className="grid grid-cols-2 gap-3.5">
            <NumberField name="ventilacion.tunel.n_puertas" label="N° puertas" min={0} />
            <NumberField name="ventilacion.tunel.longitud" label="Longitud" step="0.1" />
          </div>
          <EstadoField name="ventilacion.tunel.estado" label="Estado" options={PILL_BRM} />
        </div>

        {/* Col 3 */}
        <div className="space-y-3">
          <SubHead title="Nebulización" />
          <EstadoField name="ventilacion.nebulizacion.estado" label="Estado" options={PILL_BM} />

          <SubHead title="Ventiladores" />
          <EstadoField name="ventilacion.ventiladores.estado" label="Estado" options={PILL_BM} />
        </div>
      </div>

      <SubHead title="Observaciones" />
      <TextArea
        name="ventilacion.observaciones"
        rows={4}
        placeholder="Hallazgos sobre ventilación, refrigeración y sistemas de entrada de aire..."
      />
    </div>
  );
}
