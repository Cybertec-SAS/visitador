import { StepHeader } from '@/components/ui/wizard';
import { SubHead, NumberField, TextField, TextArea, PillSelect, SegToggle, Field } from '../fields';
import { PILL_BRM, SEG_SINO } from '../catalog';
import { HiOutlineCog } from 'react-icons/hi';

export function Step8ProcesosOperativos() {
  return (
    <div className="space-y-3">
      <StepHeader
        icon={HiOutlineCog}
        title="Procesos operativos"
        desc="Falso techo, cortina lateral, aislamiento, turbo calefactores, pesaje, iluminación y comunicación"
      />

      <div className="grid grid-cols-2 gap-5 max-[900px]:grid-cols-1">
        {/* Falso techo */}
        <div className="space-y-3">
          <SubHead title="Falso techo" />
          <div className="grid grid-cols-2 gap-3.5">
            <TextField name="procesos_operativos.falso_techo.color" label="Color" />
            <TextField name="procesos_operativos.falso_techo.tipo_cortina" label="Tipo de cortina" />
          </div>
          <Field label="Estado">
            <PillSelect name="procesos_operativos.falso_techo.estado" options={PILL_BRM} />
          </Field>
          <TextArea
            name="procesos_operativos.falso_techo.observaciones"
            label="Observaciones"
            rows={2}
          />
        </div>

        {/* Cortina lateral */}
        <div className="space-y-3">
          <SubHead title="Cortina lateral" />
          <div className="grid grid-cols-2 gap-3.5">
            <TextField name="procesos_operativos.cortina_lateral.suspension" label="Suspensión" />
            <TextField name="procesos_operativos.cortina_lateral.cortavientos" label="Cortavientos" />
            <TextField name="procesos_operativos.cortina_lateral.sellamiento" label="Sellamiento" />
            <TextField name="procesos_operativos.cortina_lateral.cortina" label="Cortina" />
          </div>
          <Field label="Estado">
            <PillSelect name="procesos_operativos.cortina_lateral.estado" options={PILL_BRM} />
          </Field>
          <TextArea
            name="procesos_operativos.cortina_lateral.observaciones"
            label="Observaciones"
            rows={2}
          />
        </div>

        {/* Aislamiento */}
        <div className="space-y-3">
          <SubHead title="Aislamiento" />
          <div className="grid grid-cols-2 gap-3.5 items-start">
            <Field label="Puntos calientes">
              <SegToggle name="procesos_operativos.aislamiento.puntos_calientes" options={SEG_SINO} />
            </Field>
            <TextField name="procesos_operativos.aislamiento.tipo" label="Tipo" />
          </div>
          <Field label="Estado">
            <PillSelect name="procesos_operativos.aislamiento.estado" options={PILL_BRM} />
          </Field>
          <TextArea
            name="procesos_operativos.aislamiento.observaciones"
            label="Observaciones"
            rows={2}
          />
        </div>

        {/* Turbo calefactores */}
        <div className="space-y-3">
          <SubHead title="Turbo calefactores" />
          <NumberField name="procesos_operativos.turbo_calefactores.cantidad" label="Cantidad" min={0} />
          <Field label="Estado">
            <PillSelect name="procesos_operativos.turbo_calefactores.estado" options={PILL_BRM} />
          </Field>
          <TextArea
            name="procesos_operativos.turbo_calefactores.observaciones"
            label="Observaciones"
            rows={2}
          />
        </div>

        {/* Sistema de pesaje */}
        <div className="space-y-3">
          <SubHead title="Sistema de pesaje" />
          <div className="grid grid-cols-2 gap-3.5 items-start">
            <Field label="Operativo">
              <SegToggle name="procesos_operativos.sistema_pesaje.operativo" options={SEG_SINO} />
            </Field>
            <Field label="Celdas de pesaje">
              <PillSelect name="procesos_operativos.sistema_pesaje.celdas_pesaje" options={PILL_BRM} />
            </Field>
            <Field label="RSW">
              <SegToggle name="procesos_operativos.sistema_pesaje.rsw" options={SEG_SINO} />
            </Field>
            <Field label="RSU">
              <SegToggle name="procesos_operativos.sistema_pesaje.rsu" options={SEG_SINO} />
            </Field>
          </div>
          <TextArea
            name="procesos_operativos.sistema_pesaje.observaciones"
            label="Observaciones"
            rows={2}
          />
        </div>

        {/* Iluminación */}
        <div className="space-y-3">
          <SubHead title="Iluminación" />
          <div className="grid grid-cols-2 gap-3.5 items-start">
            <Field label="Dimerizable">
              <SegToggle name="procesos_operativos.iluminacion.dimerizable" options={SEG_SINO} />
            </Field>
            <TextField
              name="procesos_operativos.iluminacion.referencia_bombillo"
              label="Referencia de bombillo"
            />
          </div>
          <TextField
            name="procesos_operativos.iluminacion.iluminarias_operativas"
            label="Iluminarias operativas"
          />
          <TextArea
            name="procesos_operativos.iluminacion.observaciones"
            label="Observaciones"
            rows={2}
          />
        </div>
      </div>

      <SubHead title="Sistema de comunicación" />
      <div className="grid grid-cols-2 gap-3.5 max-[580px]:grid-cols-1 items-start">
        <Field label="Operativo">
          <SegToggle name="procesos_operativos.sistema_comunicacion.operativo" options={SEG_SINO} />
        </Field>
        <TextArea
          name="procesos_operativos.sistema_comunicacion.observaciones"
          label="Observaciones"
          rows={2}
        />
      </div>
    </div>
  );
}
