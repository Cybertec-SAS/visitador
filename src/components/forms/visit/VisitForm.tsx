import { useState } from 'react';
import { useForm, FormProvider, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { visitSchema, type VisitFormValues } from '@/schemas';
import { StepIndicator, type WizardStep } from '@/components/ui/wizard';
import { createEmptyVisit, visitToFormValues } from './defaults';
import type { Client, Visit } from '@/types/api';
import type { VisitReportCtx } from './VisitReport';
import { Step1General } from './steps/Step1General';
import { Step2Control } from './steps/Step2Control';
import { Step3Tablero } from './steps/Step3Tablero';
import { Step4Variables } from './steps/Step4Variables';
import { Step5Ventilacion } from './steps/Step5Ventilacion';
import { Step6Mecanicos } from './steps/Step6Mecanicos';
import { Step7Evidencia } from './steps/Step7Evidencia';
import { Step8ProcesosOperativos } from './steps/Step8ProcesosOperativos';
import { Step9Hallazgos } from './steps/Step9Hallazgos';
import { Step10Actividades } from './steps/Step10Actividades';
import { Step11Repuestos } from './steps/Step11Repuestos';
import { Step12Informe } from './steps/Step12Informe';
import {
  HiOutlineIdentification,
  HiOutlineChip,
  HiOutlineLightningBolt,
  HiOutlineBeaker,
  HiOutlineSparkles,
  HiOutlineCog,
  HiOutlineCamera,
  HiOutlineViewGrid,
  HiOutlineExclamation,
  HiOutlineClipboardCheck,
  HiOutlineCube,
  HiOutlineClipboardList,
  HiOutlineCheck,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlinePrinter,
} from 'react-icons/hi';

const STEPS: (WizardStep & { requiredFields: (keyof VisitFormValues)[] })[] = [
  { title: 'Información general', description: 'Cliente y granja', icon: HiOutlineIdentification, requiredFields: ['client_id', 'farm_id', 'galpon_id', 'fecha'] },
  { title: 'Control y automatización', description: 'Sensores y lecturas', icon: HiOutlineChip, requiredFields: [] },
  { title: 'Tablero potencia', description: 'Eléctrico y termografía', icon: HiOutlineLightningBolt, requiredFields: [] },
  { title: 'Toma de variables', description: 'Emergencia y ambiente', icon: HiOutlineBeaker, requiredFields: [] },
  { title: 'Ventilación', description: 'Extractores e inlets', icon: HiOutlineSparkles, requiredFields: [] },
  { title: 'Sistemas mecánicos', description: 'Comederos y bebederos', icon: HiOutlineCog, requiredFields: [] },
  { title: 'Evidencia', description: 'Fotografías', icon: HiOutlineCamera, requiredFields: [] },
  { title: 'Procesos operativos', description: 'Techo, cortinas, pesaje e iluminación', icon: HiOutlineViewGrid, requiredFields: [] },
  { title: 'Hallazgos principales', description: 'Sistemas con novedades', icon: HiOutlineExclamation, requiredFields: [] },
  { title: 'Actividades recomendadas', description: 'Prioridad de intervención', icon: HiOutlineClipboardCheck, requiredFields: [] },
  { title: 'Repuestos identificados', description: 'Repuestos y momento de instalación', icon: HiOutlineCube, requiredFields: [] },
  { title: 'Resumen e informe', description: 'Vista presentable', icon: HiOutlineClipboardList, requiredFields: [] },
];

interface VisitFormProps {
  onSubmit: (data: VisitFormValues) => Promise<void>;
  clients: Client[];
  defaultValues?: Visit;
  preselectedClientId?: number;
  isLoading: boolean;
}

export function VisitForm({ onSubmit, clients, defaultValues, preselectedClientId, isLoading }: VisitFormProps) {
  const [step, setStep] = useState(0);
  const isEdit = !!defaultValues;

  const methods = useForm<VisitFormValues>({
    resolver: zodResolver(visitSchema) as Resolver<VisitFormValues>,
    mode: 'onTouched',
    defaultValues: defaultValues
      ? visitToFormValues(defaultValues)
      : createEmptyVisit({ client_id: preselectedClientId }),
  });

  const { handleSubmit, trigger, watch } = methods;

  const handleNext = async () => {
    const fields = STEPS[step].requiredFields;
    const valid = fields.length === 0 ? true : await trigger(fields);
    if (valid) setStep((s) => s + 1);
  };

  const finalize = handleSubmit((data) => onSubmit({ ...data, status: 'completed' }));

  const ctx: VisitReportCtx = {
    clienteNombre: watch('cliente_nombre') ?? '',
    granjaNombre: watch('granja_nombre') ?? '',
    galponNumero: watch('galpon_numero') ?? '',
  };

  const progressPct = (step / (STEPS.length - 1)) * 100;
  const isLast = step === STEPS.length - 1;

  return (
    <FormProvider {...methods}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-3.5">
        <StepIndicator steps={STEPS} current={step} onSelect={setStep} progressPct={progressPct} />

        <div className="border border-line rounded-section p-4 bg-white">
          {step === 0 && <Step1General clients={clients} />}
          {step === 1 && <Step2Control />}
          {step === 2 && <Step3Tablero />}
          {step === 3 && <Step4Variables />}
          {step === 4 && <Step5Ventilacion />}
          {step === 5 && <Step6Mecanicos />}
          {step === 6 && <Step7Evidencia />}
          {step === 7 && <Step8ProcesosOperativos />}
          {step === 8 && <Step9Hallazgos />}
          {step === 9 && <Step10Actividades />}
          {step === 10 && <Step11Repuestos />}
          {step === 11 && <Step12Informe ctx={ctx} />}
        </div>

        {/* Navegación */}
        <div className="flex items-center justify-between gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-2 rounded-btn px-4 py-3 text-sm font-semibold text-muted hover:text-heading border border-line bg-white hover:bg-input-bg transition-colors cursor-pointer"
            >
              <HiOutlineChevronLeft className="w-4 h-4" />
              Volver
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {isLast && (
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 rounded-btn px-4 py-3 text-sm font-semibold text-heading border border-line bg-white hover:bg-input-bg transition-colors cursor-pointer print:hidden"
              >
                <HiOutlinePrinter className="w-4 h-4" />
                Imprimir / PDF
              </button>
            )}

            {!isLast ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 rounded-btn px-5 py-3 text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none"
              >
                Continuar
                <HiOutlineChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isLoading}
                onClick={finalize}
                className="flex items-center gap-2 rounded-btn px-5 py-3 text-sm font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors cursor-pointer border-none"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <HiOutlineCheck className="w-4 h-4" />
                    {isEdit ? 'Actualizar visita' : 'Finalizar visita'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
