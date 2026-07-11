import { StepHeader } from '@/components/ui/wizard';
import { SubHead, NumberField, TextArea, SegList, PillSelect } from '../fields';
import { PRUEBA_EMERGENCIA_CRITERIOS, MED_AMBIENTALES_CRITERIOS, SEG_SINO, PILL_BRMN } from '../catalog';
import { HiOutlineBeaker } from 'react-icons/hi';

export function Step4Variables() {
  return (
    <div className="space-y-3">
      <StepHeader
        icon={HiOutlineBeaker}
        title="Toma de variables"
        desc="Prueba de emergencia, termostatos y mediciones ambientales"
      />

      <div className="grid grid-cols-3 gap-5 max-[900px]:grid-cols-1">
        {/* Prueba de emergencia */}
        <div className="space-y-3">
          <SubHead title="Prueba de emergencia" />
          <SegList criterios={PRUEBA_EMERGENCIA_CRITERIOS} basePath="variables.prueba_emergencia" options={SEG_SINO} />
          <TextArea
            name="variables.obs_prueba_emergencia"
            label="Observaciones"
            placeholder="Detalles de las pruebas de emergencia realizadas..."
          />
        </div>

        {/* Termostatos */}
        <div className="space-y-3">
          <SubHead title="Termostatos" />
          <div className="grid grid-cols-2 gap-3.5">
            <NumberField name="variables.termostatos.instalados" label="Instalados" min={0} />
            <NumberField name="variables.termostatos.operativos" label="Operativos" min={0} />
          </div>
          <TextArea name="variables.obs_termostatos" label="Observaciones" placeholder="Estado de los termostatos..." />
        </div>

        {/* Mediciones ambientales */}
        <div className="space-y-3">
          <SubHead title="Mediciones ambientales" />
          <div className="space-y-2">
            {MED_AMBIENTALES_CRITERIOS.map((c) => (
              <div key={c.key} className="border border-line rounded-control p-2.5 space-y-2 bg-white">
                <span className="text-[13px] text-heading">{c.label}</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <NumberField
                    name={`variables.med_ambientales.${c.key}.valor`}
                    unit={c.unit}
                    step="0.01"
                    className="w-36"
                  />
                  <PillSelect name={`variables.med_ambientales.${c.key}.estado`} options={PILL_BRMN} />
                </div>
              </div>
            ))}
          </div>
          <TextArea
            name="variables.obs_med_ambientales"
            label="Observaciones"
            placeholder="Observaciones sobre las mediciones ambientales..."
          />
        </div>
      </div>
    </div>
  );
}
