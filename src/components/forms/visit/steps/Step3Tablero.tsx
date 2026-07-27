import { StepHeader } from '@/components/ui/wizard';
import { SubHead, NumberField, TextArea, EstadoList, SegToggle, Field } from '../fields';
import { TABLERO_FISICO_CRITERIOS, OTROS_EQUIPOS_ITEMS, PILL_BRM, SEG_SINO } from '../catalog';
import { HiOutlineChip } from 'react-icons/hi';

export function Step3Tablero() {
  return (
    <div className="space-y-3">
      <StepHeader
        icon={HiOutlineChip}
        title="Tablero de potencia y control"
        desc="Estado físico, mediciones eléctricas, termografía y otros equipos"
      />

      <div className="grid grid-cols-2 gap-5 max-[820px]:grid-cols-1">
        {/* Columna izquierda */}
        <div className="space-y-3">
          <SubHead title="Estado físico del tablero" />
          <EstadoList criterios={TABLERO_FISICO_CRITERIOS} basePath="tablero.fisico" options={PILL_BRM} />
          <TextArea name="tablero.obs_fisico" label="Observaciones" placeholder="Limpieza, humedad, corrosión, orden..." />

          <SubHead title="Otros equipos" />
          <EstadoList criterios={OTROS_EQUIPOS_ITEMS} basePath="tablero.otros_equipos" options={PILL_BRM} />
          <TextArea name="tablero.obs_otros_equipos" label="Observaciones" placeholder="Dimmer, RDT-5, RSW/RSU, backup..." />
        </div>

        {/* Columna derecha */}
        <div className="space-y-3">
          <SubHead title="Mediciones eléctricas" />
          <div className="grid grid-cols-2 gap-3.5">
            <NumberField name="tablero.mediciones.l1l2" label="L1 - L2" unit="V" step="0.1" />
            <NumberField name="tablero.mediciones.l2l3" label="L2 - L3" unit="V" step="0.1" />
            <NumberField name="tablero.mediciones.l1l3" label="L1 - L3" unit="V" step="0.1" />
            <NumberField name="tablero.mediciones.l1n" label="L1 - N" unit="V" step="0.1" />
            <NumberField name="tablero.mediciones.l2n" label="L2 - N" unit="V" step="0.1" />
            <NumberField name="tablero.mediciones.l3n" label="L3 - N" unit="V" step="0.1" />
          </div>

          <SubHead title="Termografía" />
          <div className="grid grid-cols-2 gap-3.5 max-[420px]:grid-cols-1">
            <NumberField name="tablero.termografia.temp_max" label="T° máxima encontrada" unit="°C" step="0.1" />
            <Field label="¿Puntos calientes detectados?">
              <SegToggle name="tablero.termografia.puntos_calientes" options={SEG_SINO} />
            </Field>
          </div>
          <TextArea
            name="tablero.termografia.obs"
            label="Observaciones de termografía"
            placeholder="Ubicación y severidad de los puntos calientes encontrados..."
          />
        </div>
      </div>
    </div>
  );
}
