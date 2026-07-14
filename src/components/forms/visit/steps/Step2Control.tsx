import { useFormContext } from 'react-hook-form';
import { StepHeader, wizardInput } from '@/components/ui/wizard';
import { SubHead, TextField, NumberField, TextArea, PillSelect, EstadoList, CoverageGauge } from '../fields';
import { SENSOR_TYPES, ESTADO_CRITERIOS, PILL_BRMN } from '../catalog';
import type { VisitFormValues } from '@/schemas';
import { HiOutlineChip } from 'react-icons/hi';

function SensorRow({ sensorKey, label }: { sensorKey: string; label: string }) {
  const { register, watch, setValue } = useFormContext<VisitFormValues>();
  const base = `control.sensores.${sensorKey}`;
  const inst = Number(watch(`control.sensores.${sensorKey}.instalados` as const)) || 0;
  const det = Number(watch(`control.sensores.${sensorKey}.detectados` as const)) || 0;
  const pct = inst > 0 ? Math.min(100, Math.round((det / inst) * 100)) : 0;

  return (
    <tr className="border-b border-line last:border-0">
      <td className="py-2 pl-3 pr-2 text-[13px] font-medium text-heading">{label}</td>
      <td className="py-2 px-1">
        <input
          type="number"
          min={0}
          {...register(`control.sensores.${sensorKey}.instalados` as const, {
            setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
          })}
          className={`${wizardInput} min-h-9 py-1.5 w-20`}
        />
      </td>
      <td className="py-2 px-1">
        <input
          type="number"
          min={0}
          max={inst || undefined}
          {...register(`control.sensores.${sensorKey}.detectados` as const, {
            setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
            onChange: (e) => {
              const val = Number(e.target.value);
              if (inst > 0 && val > inst) setValue(`control.sensores.${sensorKey}.detectados` as const, inst);
            },
          })}
          className={`${wizardInput} min-h-9 py-1.5 w-20`}
        />
      </td>
      <td className="py-2 px-1">
        <CoverageGauge pct={pct} />
      </td>
      <td className="py-2 pl-1">
        <PillSelect name={`${base}.estado`} options={PILL_BRMN} />
      </td>
    </tr>
  );
}

export function Step2Control() {
  return (
    <div className="space-y-3">
      <StepHeader
        icon={HiOutlineChip}
        title="Control y automatización"
        desc="Controlador, sensores y lecturas tomadas"
      />

      <SubHead title="Controlador" />
      <div className="grid grid-cols-4 gap-3.5 max-[720px]:grid-cols-2 max-[420px]:grid-cols-1">
        <TextField name="control.marca" label="Marca" placeholder="Ej. Rotem" />
        <TextField name="control.modelo" label="Modelo" placeholder="Ej. Pro Series" />
        <TextField name="control.serial" label="Serial" placeholder="Ej. RT-88213" />
        <TextField name="control.version" label="Versión software" placeholder="Ej. v4.2.1" />
      </div>
      <div className="grid grid-cols-2 gap-3.5 max-[420px]:grid-cols-1">
        <NumberField name="control.volt_ac" label="Voltaje AC" unit="V" step="0.1" />
        <NumberField name="control.volt_dc" label="Voltaje DC" unit="V" step="0.1" />
      </div>

      <SubHead title="Sensores instalados y detectados" />
      <div className="border border-line rounded-section overflow-x-auto">
        <table className="w-full text-sm min-w-[520px]">
          <thead className="bg-input-bg">
            <tr className="text-left text-[12px] font-bold text-label">
              <th className="py-2.5 px-3">Tipo de sensor</th>
              <th className="py-2.5 px-1">Instalados</th>
              <th className="py-2.5 px-1">Detectados</th>
              <th className="py-2.5 px-1">Cobertura</th>
              <th className="py-2.5 px-1">Estado</th>
            </tr>
          </thead>
          <tbody>
            {SENSOR_TYPES.map((s) => (
              <SensorRow key={s.key} sensorKey={s.key} label={s.label} />
            ))}
          </tbody>
        </table>
      </div>

      <SubHead title="Lecturas tomadas" />
      <div className="grid grid-cols-3 gap-3.5 max-[720px]:grid-cols-2 max-[420px]:grid-cols-1">
        <NumberField name="control.lecturas.temp" label="Temperatura" unit="°C" step="0.1" />
        <NumberField name="control.lecturas.hum" label="Humedad relativa" unit="%" step="0.1" />
        <NumberField name="control.lecturas.pres" label="Presión estática" unit="in.H2O" step="0.01" />
        <NumberField name="control.lecturas.co2" label="CO2" unit="ppm" step="1" />
        <NumberField name="control.lecturas.amm" label="Amoníaco (NH3)" unit="ppm" step="1" />
      </div>

      <SubHead title="Estado físico del equipo" tag="B · R · M · N/A" />
      <EstadoList criterios={ESTADO_CRITERIOS} basePath="control.estado_fisico" options={PILL_BRMN} />

      <TextArea
        name="control.observaciones"
        label="Observaciones"
        placeholder="Anota hallazgos relevantes, recomendaciones o pendientes de la visita..."
      />
    </div>
  );
}
