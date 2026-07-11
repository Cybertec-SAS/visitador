import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { StepHeader } from '@/components/ui/wizard';
import { VisitReport, type VisitReportCtx } from '../VisitReport';
import { collectCriteria, criteriaCounts, defaultNarrative } from '../report';
import { narrativeKeys } from '../catalog';
import type { VisitFormValues } from '@/schemas';
import { HiOutlineClipboardList } from 'react-icons/hi';

export function Step8Informe({ ctx }: { ctx: VisitReportCtx }) {
  const { getValues, setValue, watch } = useFormContext<VisitFormValues>();

  // Auto-genera la narrativa por defecto para los campos aún vacíos (una vez al entrar).
  useEffect(() => {
    const values = getValues();
    const counts = criteriaCounts(collectCriteria(values).combined);
    const generated = defaultNarrative(values, counts, {
      granja: ctx.granjaNombre,
      galponNumero: ctx.galponNumero,
    });
    narrativeKeys.forEach((k) => {
      if (!values.informe[k]) {
        setValue(`informe.${k}` as const, generated[k], { shouldDirty: false });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const values = watch();

  return (
    <div className="space-y-3">
      <StepHeader
        icon={HiOutlineClipboardList}
        title="Resumen e informe"
        desc="Revisa el informe generado; la narrativa es editable antes de guardar"
      />
      <VisitReport values={values} ctx={ctx} editableNarrative />
    </div>
  );
}
