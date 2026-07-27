import { Link, useNavigate } from 'react-router-dom';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import type { ElementType } from 'react';
import {
  HiOutlineClipboardCheck,
  HiOutlineLocationMarker,
  HiOutlineCurrencyDollar,
  HiOutlineCube,
  HiOutlineArrowRight,
} from 'react-icons/hi';

interface VisitTypeDef {
  key: string;
  label: string;
  description: string;
  icon: ElementType;
  to?: string;
  enabled: boolean;
}

const VISIT_TYPES: VisitTypeDef[] = [
  {
    key: 'diagnostico_tecnico',
    label: 'Diagnóstico técnico / Mantenimiento',
    description:
      'Inspección completa de control, tablero, ventilación y sistemas mecánicos de un galpón, con generación de informe.',
    icon: HiOutlineClipboardCheck,
    to: '/visits/new/diagnostico',
    enabled: true,
  },
  {
    key: 'instalacion',
    label: 'Instalación / Puesta en marcha',
    description: 'Registro de instalación y puesta en marcha de equipos en la granja.',
    icon: HiOutlineCube,
    enabled: false,
  },
  {
    key: 'comercial',
    label: 'Visita comercial',
    description: 'Levantamiento comercial y de oportunidades en el cliente.',
    icon: HiOutlineCurrencyDollar,
    enabled: false,
  },
  {
    key: 'seguimiento',
    label: 'Seguimiento',
    description: 'Verificación de acciones correctivas de una visita anterior.',
    icon: HiOutlineLocationMarker,
    enabled: false,
  },
];

export function VisitTypePage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 max-w-3xl">
      <Breadcrumb items={[{ label: 'Visitas', to: '/visits' }, { label: 'Nueva visita' }]} />

      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-logo grid place-items-center bg-field-soft shrink-0">
          <HiOutlineLocationMarker className="w-6 h-6 text-field" />
        </div>
        <div>
          <h2 className="text-[22px] font-bold text-heading m-0">Nueva visita</h2>
          <p className="text-[13px] text-muted m-0">Selecciona el tipo de visita que vas a realizar</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5 max-[640px]:grid-cols-1">
        {VISIT_TYPES.map((t) => {
          const Icon = t.icon;
          if (t.enabled && t.to) {
            return (
              <button
                key={t.key}
                onClick={() => navigate(t.to!)}
                className="text-left border border-line rounded-section p-4 bg-white hover:border-primary hover:shadow-panel transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-logo grid place-items-center bg-primary-soft shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-bold text-heading m-0">{t.label}</h3>
                    <p className="text-[12px] text-muted mt-1 mb-0 leading-relaxed">{t.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-1.5 mt-3 text-[13px] font-bold text-primary group-hover:gap-2.5 transition-all">
                  Comenzar
                  <HiOutlineArrowRight className="w-4 h-4" />
                </div>
              </button>
            );
          }
          return (
            <div
              key={t.key}
              className="border border-line rounded-section p-4 bg-input-bg/40 opacity-70 cursor-not-allowed"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-logo grid place-items-center bg-input-bg shrink-0">
                  <Icon className="w-5 h-5 text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] font-bold text-muted m-0">{t.label}</h3>
                    <span className="text-[10px] font-black uppercase tracking-wide text-muted bg-white border border-line rounded-full px-2 py-0.5">
                      Pronto
                    </span>
                  </div>
                  <p className="text-[12px] text-muted mt-1 mb-0 leading-relaxed">{t.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border border-line rounded-control p-3.5 bg-white flex items-center justify-between gap-3 flex-wrap">
        <span className="text-[13px] text-muted">¿Ya iniciaste una visita antes?</span>
        <Link to="/visits" className="text-[13px] font-bold text-primary hover:underline no-underline">
          Ver mis visitas →
        </Link>
      </div>
    </div>
  );
}
