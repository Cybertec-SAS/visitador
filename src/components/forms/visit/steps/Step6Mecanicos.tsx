import { StepHeader } from '@/components/ui/wizard';
import { SubHead, NumberField, TextField, TextArea, PillSelect, Field } from '../fields';
import { PILL_BRM, PILL_BM } from '../catalog';
import { HiOutlineCog } from 'react-icons/hi';
import type { PillOption } from '../catalog';

function EstadoField({ name, label, options }: { name: string; label: string; options: PillOption[] }) {
  return (
    <Field label={label}>
      <PillSelect name={name} options={options} />
    </Field>
  );
}

export function Step6Mecanicos() {
  return (
    <div className="space-y-3">
      <StepHeader
        icon={HiOutlineCog}
        title="Sistemas mecánicos"
        desc="Comedero automático, bebedero automático y sistema de alimentación"
      />

      <div className="grid grid-cols-3 gap-5 max-[900px]:grid-cols-1">
        {/* Comedero */}
        <div className="space-y-3">
          <SubHead title="Comedero automático" />
          <div className="grid grid-cols-2 gap-3.5">
            <NumberField name="mecanicos.comedero.longitud" label="Longitud" step="0.1" />
            <NumberField name="mecanicos.comedero.n_lineas" label="N° líneas" min={0} />
          </div>
          <EstadoField name="mecanicos.comedero.estado" label="Estado" options={PILL_BRM} />
        </div>

        {/* Bebedero */}
        <div className="space-y-3">
          <SubHead title="Bebedero automático" />
          <div className="grid grid-cols-2 gap-3.5">
            <NumberField name="mecanicos.bebedero.longitud" label="Longitud" step="0.1" />
            <NumberField name="mecanicos.bebedero.n_lineas" label="N° líneas" min={0} />
          </div>
          <EstadoField name="mecanicos.bebedero.estado_panel_hidraulico" label="Estado panel hidráulico" options={PILL_BM} />
          <EstadoField name="mecanicos.bebedero.estado_filtro" label="Estado filtro" options={PILL_BM} />
          <EstadoField name="mecanicos.bebedero.estado_dosatron" label="Estado Dosatron" options={PILL_BM} />
        </div>

        {/* Alimentación */}
        <div className="space-y-3">
          <SubHead title="Sistema de alimentación" />
          <div className="grid grid-cols-2 gap-3.5">
            <NumberField name="mecanicos.alimentacion.n_silos" label="N° silos" min={0} />
            <NumberField name="mecanicos.alimentacion.n_lineas" label="N° líneas" min={0} />
          </div>
          <EstadoField name="mecanicos.alimentacion.estado" label="Estado" options={PILL_BRM} />
        </div>
      </div>

      <SubHead title="Observaciones" />
      <TextArea
        name="mecanicos.observaciones"
        rows={3}
        placeholder="Hallazgos sobre comederos, bebederos y sistema de alimentación..."
      />

      <SubHead title="Cierre de la visita" />
      <div className="grid grid-cols-2 gap-3.5 max-[580px]:grid-cols-1">
        <TextField name="mecanicos.cierre.recibe_nombre" label="Nombre de quien recibe la visita" placeholder="Nombre completo" />
        <TextField name="mecanicos.cierre.realiza_nombre" label="Nombre de quien realiza la visita" placeholder="Nombre completo" />
        <TextField name="mecanicos.cierre.recibe_firma" label="Firma de quien recibe" placeholder="Firma" />
        <TextField name="mecanicos.cierre.realiza_firma" label="Firma de quien realiza" placeholder="Firma" />
      </div>
    </div>
  );
}
