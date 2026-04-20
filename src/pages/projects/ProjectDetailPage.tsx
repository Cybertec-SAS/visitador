import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { projectsApi, progressReportsApi } from '@/api/projects';
import type { Project, ProgressReport } from '@/types/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { sileo } from 'sileo';
import {
  HiOutlineChevronLeft,
  HiOutlinePencil,
  HiOutlineCalendar,
  HiOutlineTrendingUp,
  HiOutlineClipboardList,
} from 'react-icons/hi';

const STATUS_LABEL: Record<string, string> = {
  draft: 'Borrador', active: 'Activo', paused: 'Pausado',
  completed: 'Completado', cancelled: 'Cancelado',
};
const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-500', active: 'bg-green-50 text-green-700',
  paused: 'bg-amber-50 text-amber-700', completed: 'bg-primary-soft text-primary',
  cancelled: 'bg-red-50 text-red-500',
};

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const [projRes, reportsData] = await Promise.all([
        projectsApi.get(Number(id)),
        progressReportsApi.list(Number(id)),
      ]);
      setProject(projRes.data);
      setReports(Array.isArray(reportsData) ? reportsData : []);
    } catch {
      sileo.error({ title: 'Error al cargar el proyecto' });
      navigate('/projects');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { loadData(); }, [loadData]);

  if (isLoading) return <LoadingSpinner className="mt-12" />;
  if (!project) return null;

  const latestReport = reports[reports.length - 1];

  return (
    <div className="space-y-4 max-w-3xl">
      <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors no-underline">
        <HiOutlineChevronLeft className="w-4 h-4" />
        Volver a proyectos
      </Link>

      {/* Header */}
      <div className="border border-line rounded-section p-4 bg-white flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[project.status]}`}>
              {STATUS_LABEL[project.status]}
            </span>
            {project.code && <span className="text-[11px] text-muted font-mono">{project.code}</span>}
          </div>
          <h2 className="text-[22px] font-bold text-heading m-0">{project.name}</h2>
          <p className="text-[13px] text-muted mt-0.5">
            {project.client?.razon_social} · {project.farm?.nombre}
          </p>
        </div>
        <button
          onClick={() => navigate(`/projects/${project.id}/edit`)}
          className="flex items-center gap-2 rounded-btn px-4 py-2.5 text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none shrink-0"
        >
          <HiOutlinePencil className="w-4 h-4" />
          Editar
        </button>
      </div>

      {/* Info */}
      <div className="grid grid-cols-3 gap-3 max-[640px]:grid-cols-1">
        {project.start_date && (
          <div className="border border-line rounded-section p-4 bg-white flex items-center gap-3">
            <div className="w-9 h-9 rounded-logo bg-primary-soft grid place-items-center shrink-0">
              <HiOutlineCalendar className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <p className="text-[11px] text-muted m-0">Inicio</p>
              <p className="text-[13px] font-semibold text-heading m-0">{new Date(project.start_date).toLocaleDateString('es-CO')}</p>
            </div>
          </div>
        )}
        {project.end_date && (
          <div className="border border-line rounded-section p-4 bg-white flex items-center gap-3">
            <div className="w-9 h-9 rounded-logo bg-primary-soft grid place-items-center shrink-0">
              <HiOutlineCalendar className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <p className="text-[11px] text-muted m-0">Fin estimado</p>
              <p className="text-[13px] font-semibold text-heading m-0">{new Date(project.end_date).toLocaleDateString('es-CO')}</p>
            </div>
          </div>
        )}
        {latestReport && (
          <div className="border border-line rounded-section p-4 bg-white flex items-center gap-3">
            <div className="w-9 h-9 rounded-logo bg-green-50 grid place-items-center shrink-0">
              <HiOutlineTrendingUp className="w-4.5 h-4.5 text-green-600" />
            </div>
            <div>
              <p className="text-[11px] text-muted m-0">Avance real</p>
              <p className="text-[13px] font-semibold text-heading m-0">{latestReport.weighted_progress_percent}%</p>
            </div>
          </div>
        )}
      </div>

      {project.description && (
        <div className="border border-line rounded-section p-4 bg-white">
          <p className="text-[12px] font-semibold text-label mb-2">Descripción</p>
          <p className="text-[13px] text-heading m-0 leading-relaxed">{project.description}</p>
        </div>
      )}

      {/* Progress reports */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-heading m-0 flex items-center gap-2">
            <HiOutlineClipboardList className="w-5 h-5 text-primary" />
            Informes de avance ({reports.length})
          </h3>
        </div>

        {reports.length === 0 ? (
          <div className="border border-dashed border-line rounded-section py-10 flex flex-col items-center gap-2 text-center">
            <HiOutlineClipboardList className="w-8 h-8 text-muted" />
            <p className="text-[13px] text-muted m-0">No hay informes de avance aún</p>
          </div>
        ) : (
          <div className="border border-line rounded-section bg-white overflow-hidden">
            <table className="w-full text-[13px]">
              <thead className="bg-input-bg">
                <tr>
                  <th className="text-left px-4 py-3 font-bold text-[12px] text-label">N°</th>
                  <th className="text-left px-4 py-3 font-bold text-[12px] text-label">Corte</th>
                  <th className="text-right px-4 py-3 font-bold text-[12px] text-label">Programado</th>
                  <th className="text-right px-4 py-3 font-bold text-[12px] text-label">Real</th>
                  <th className="text-right px-4 py-3 font-bold text-[12px] text-label">Diferencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {reports.map((r) => {
                  const diff = Number(r.difference_percent);
                  return (
                    <tr key={r.id} className="hover:bg-primary-soft/20">
                      <td className="px-4 py-3 font-semibold text-heading">#{r.report_number}</td>
                      <td className="px-4 py-3 text-muted">{new Date(r.cutoff_date).toLocaleDateString('es-CO')}</td>
                      <td className="px-4 py-3 text-right text-heading">{r.scheduled_progress_percent}%</td>
                      <td className="px-4 py-3 text-right font-semibold text-heading">{r.weighted_progress_percent}%</td>
                      <td className={`px-4 py-3 text-right font-semibold ${diff >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {diff >= 0 ? '+' : ''}{r.difference_percent}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
