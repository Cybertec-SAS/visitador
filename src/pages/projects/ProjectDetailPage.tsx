import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { projectsApi, progressReportsApi } from '@/api/projects';
import { structuresApi } from '@/api/structures';
import type { Project, ProgressReport, Structure } from '@/types/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { sileo } from 'sileo';
import {
  HiOutlineChevronLeft,
  HiOutlinePencil,
  HiOutlineCalendar,
  HiOutlineTrendingUp,
  HiOutlineClipboardList,
  HiOutlineOfficeBuilding,
  HiOutlinePlus,
  HiOutlineInformationCircle,
  HiOutlineChevronDown,
} from 'react-icons/hi';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_LABEL: Record<string, string> = {
  draft: 'Borrador', active: 'Activo', paused: 'Pausado',
  completed: 'Completado', cancelled: 'Cancelado',
};
const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-500', active: 'bg-green-50 text-green-700',
  paused: 'bg-amber-50 text-amber-700', completed: 'bg-primary-soft text-primary',
  cancelled: 'bg-red-50 text-red-500',
};

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'info', label: 'Información', icon: HiOutlineInformationCircle },
  { key: 'structures', label: 'Estructuras', icon: HiOutlineOfficeBuilding },
  { key: 'reports', label: 'Informes', icon: HiOutlineClipboardList },
];

// ─── Add Report Form ──────────────────────────────────────────────────────────
interface ReportFormState {
  cutoff_date: string;
  start_date: string;
  end_date: string;
  scheduled_progress_percent: string;
  weighted_progress_percent: string;
  contract_days: string;
  elapsed_days: string;
  remaining_days: string;
  notes: string;
}

const EMPTY_REPORT: ReportFormState = {
  cutoff_date: '', start_date: '', end_date: '',
  scheduled_progress_percent: '', weighted_progress_percent: '',
  contract_days: '', elapsed_days: '', remaining_days: '', notes: '',
};

// ─── Main component ───────────────────────────────────────────────────────────
export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = Number(id);

  const [project, setProject] = useState<Project | null>(null);
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [farmStructures, setFarmStructures] = useState<Structure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  // Add structure
  const [showAddStructure, setShowAddStructure] = useState(false);
  const [selectedStructureId, setSelectedStructureId] = useState('');
  const [isAddingStructure, setIsAddingStructure] = useState(false);

  // Add report
  const [showAddReport, setShowAddReport] = useState(false);
  const [reportForm, setReportForm] = useState<ReportFormState>(EMPTY_REPORT);
  const [isSavingReport, setIsSavingReport] = useState(false);

  // ── Load data ────────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const projRes = await projectsApi.get(projectId);
      // Handle both { data: Project } and raw Project responses
      const proj = (projRes as { data?: Project }).data ?? (projRes as unknown as Project);
      setProject(proj);
    } catch {
      sileo.error({ title: 'Error al cargar el proyecto' });
      navigate('/projects');
      return;
    } finally {
      setIsLoading(false);
    }
    // Load reports separately so a missing endpoint doesn't block the page
    try {
      const reportsData = await progressReportsApi.list(projectId);
      setReports(Array.isArray(reportsData) ? reportsData : []);
    } catch {
      setReports([]);
    }
  }, [id, projectId, navigate]);

  useEffect(() => { loadData(); }, [loadData]);

  // Load farm structures when tab switches to structures
  useEffect(() => {
    if (activeTab !== 'structures' || !project?.farm_id) return;
    structuresApi.list({ farm_id: project.farm_id }).then((list) => {
      setFarmStructures(Array.isArray(list) ? list : []);
    }).catch(() => {});
  }, [activeTab, project?.farm_id]);

  // ── Add structure ────────────────────────────────────────────────────────────
  const handleAddStructure = async () => {
    if (!selectedStructureId) return;
    setIsAddingStructure(true);
    try {
      await projectsApi.addStructure(projectId, Number(selectedStructureId));
      sileo.success({ title: 'Estructura asociada' });
      setShowAddStructure(false);
      setSelectedStructureId('');
      loadData();
    } catch {
      sileo.error({ title: 'Error al asociar la estructura' });
    } finally {
      setIsAddingStructure(false);
    }
  };

  // ── Add report ───────────────────────────────────────────────────────────────
  const handleSaveReport = async () => {
    if (!reportForm.cutoff_date || !reportForm.scheduled_progress_percent || !reportForm.weighted_progress_percent) {
      sileo.error({ title: 'Completa los campos requeridos' });
      return;
    }
    const diff = (
      Number(reportForm.weighted_progress_percent) - Number(reportForm.scheduled_progress_percent)
    ).toFixed(2);

    setIsSavingReport(true);
    try {
      await progressReportsApi.create(projectId, {
        project_id: projectId,
        report_number: reports.length + 1,
        cutoff_date: reportForm.cutoff_date,
        start_date: reportForm.start_date || reportForm.cutoff_date,
        end_date: reportForm.end_date || reportForm.cutoff_date,
        scheduled_progress_percent: reportForm.scheduled_progress_percent,
        weighted_progress_percent: reportForm.weighted_progress_percent,
        difference_percent: diff,
        contract_days: reportForm.contract_days ? Number(reportForm.contract_days) : null,
        elapsed_days: reportForm.elapsed_days ? Number(reportForm.elapsed_days) : null,
        remaining_days: reportForm.remaining_days ? Number(reportForm.remaining_days) : null,
        notes: reportForm.notes || null,
        visit_id: null,
      } as Omit<ProgressReport, 'id' | 'project' | 'items' | 'curve_points'>);
      sileo.success({ title: 'Informe registrado' });
      setShowAddReport(false);
      setReportForm(EMPTY_REPORT);
      loadData();
    } catch {
      sileo.error({ title: 'Error al guardar el informe' });
    } finally {
      setIsSavingReport(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  if (isLoading) return <LoadingSpinner className="mt-12" />;
  if (!project) return null;

  const latestReport = reports[reports.length - 1];
  const projectStructures = project.structures ?? [];

  // Structures in farm not yet added to project
  const availableStructures = farmStructures.filter(
    (s) => !projectStructures.some((ps) => ps.id === s.id)
  );

  return (
    <div className="space-y-4">
      {/* Back */}
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors no-underline"
      >
        <HiOutlineChevronLeft className="w-4 h-4" />
        Volver a proyectos
      </Link>

      {/* Header card */}
      <div className="border border-line rounded-section p-4 bg-white flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[project.status]}`}>
              {STATUS_LABEL[project.status]}
            </span>
            {project.code && (
              <span className="text-[11px] text-muted font-mono bg-input-bg px-2 py-0.5 rounded">
                {project.code}
              </span>
            )}
          </div>
          <h2 className="text-[22px] font-bold text-heading m-0 leading-tight">{project.name}</h2>
          <p className="text-[13px] text-muted mt-0.5">
            {project.client?.razon_social}
            {project.farm && <> · {project.farm.nombre}</>}
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

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-3 max-[640px]:grid-cols-1">
        {project.start_date && (
          <KpiCard
            icon={<HiOutlineCalendar className="w-4.5 h-4.5 text-primary" />}
            iconBg="bg-primary-soft"
            label="Inicio"
            value={new Date(project.start_date).toLocaleDateString('es-CO')}
          />
        )}
        {project.end_date && (
          <KpiCard
            icon={<HiOutlineCalendar className="w-4.5 h-4.5 text-primary" />}
            iconBg="bg-primary-soft"
            label="Fin estimado"
            value={new Date(project.end_date).toLocaleDateString('es-CO')}
          />
        )}
        <KpiCard
          icon={<HiOutlineTrendingUp className="w-4.5 h-4.5 text-green-600" />}
          iconBg="bg-green-50"
          label="Avance real"
          value={latestReport ? `${latestReport.weighted_progress_percent}%` : '—'}
        />
        <KpiCard
          icon={<HiOutlineOfficeBuilding className="w-4.5 h-4.5 text-amber-600" />}
          iconBg="bg-amber-50"
          label="Estructuras"
          value={String(projectStructures.length)}
        />
        <KpiCard
          icon={<HiOutlineClipboardList className="w-4.5 h-4.5 text-primary" />}
          iconBg="bg-primary-soft"
          label="Informes"
          value={String(reports.length)}
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-line flex gap-0 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-colors cursor-pointer bg-transparent border-t-0 border-l-0 border-r-0 whitespace-nowrap
              ${activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-heading hover:border-line'}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Información */}
      {activeTab === 'info' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
            <InfoField label="Cliente" value={project.client?.razon_social ?? '—'} />
            <InfoField label="Granja" value={project.farm?.nombre ?? '—'} />
            <InfoField label="Estado" value={STATUS_LABEL[project.status] ?? project.status} />
            <InfoField label="Código" value={project.code ?? '—'} />
            <InfoField
              label="Fecha inicio"
              value={project.start_date ? new Date(project.start_date).toLocaleDateString('es-CO') : '—'}
            />
            <InfoField
              label="Fecha fin estimada"
              value={project.end_date ? new Date(project.end_date).toLocaleDateString('es-CO') : '—'}
            />
          </div>
          {project.description && (
            <div className="border border-line rounded-section p-4 bg-white">
              <p className="text-[11px] font-semibold text-label mb-1.5">Descripción</p>
              <p className="text-[13px] text-heading m-0 leading-relaxed whitespace-pre-wrap">
                {project.description}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Estructuras */}
      {activeTab === 'structures' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-muted m-0">{projectStructures.length} estructura(s) asociadas</p>
            <button
              onClick={() => setShowAddStructure((v) => !v)}
              className="flex items-center gap-1.5 rounded-btn px-3.5 py-2 text-[13px] font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none"
            >
              <HiOutlinePlus className="w-4 h-4" />
              Asociar estructura
              <HiOutlineChevronDown className={`w-3.5 h-3.5 transition-transform ${showAddStructure ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showAddStructure && (
            <div className="border border-line rounded-section p-4 bg-white flex items-end gap-3 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[11px] font-semibold text-label mb-1.5">Estructura</label>
                <select
                  value={selectedStructureId}
                  onChange={(e) => setSelectedStructureId(e.target.value)}
                  className="w-full rounded-control border border-line bg-input-bg text-heading px-3 py-2.5 text-[13px] focus:outline-none focus:border-primary"
                >
                  <option value="">Seleccionar estructura...</option>
                  {availableStructures.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowAddStructure(false); setSelectedStructureId(''); }}
                  className="rounded-btn px-4 py-2.5 text-[13px] font-semibold text-muted hover:text-heading bg-input-bg hover:bg-line transition-colors cursor-pointer border-none"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddStructure}
                  disabled={!selectedStructureId || isAddingStructure}
                  className="rounded-btn px-4 py-2.5 text-[13px] font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none disabled:opacity-50"
                >
                  {isAddingStructure ? 'Asociando...' : 'Asociar'}
                </button>
              </div>
            </div>
          )}

          {projectStructures.length === 0 ? (
            <div className="border border-dashed border-line rounded-section py-10 flex flex-col items-center gap-2 text-center">
              <HiOutlineOfficeBuilding className="w-8 h-8 text-muted" />
              <p className="text-[13px] text-muted m-0">No hay estructuras asociadas</p>
            </div>
          ) : (
            <div className="border border-line rounded-section bg-white overflow-hidden">
              <table className="w-full text-[13px]">
                <thead className="bg-input-bg">
                  <tr>
                    <th className="text-left px-4 py-3 font-bold text-[12px] text-label">Nombre</th>
                    <th className="text-left px-4 py-3 font-bold text-[12px] text-label">Tipo</th>
                    <th className="text-left px-4 py-3 font-bold text-[12px] text-label">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {projectStructures.map((s) => (
                    <tr key={s.id} className="hover:bg-primary-soft/20">
                      <td className="px-4 py-3 font-medium text-heading">{s.name}</td>
                      <td className="px-4 py-3 text-muted">{s.structure_type}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          s.status === 'active' ? 'bg-green-50 text-green-700' :
                          s.status === 'inactive' ? 'bg-gray-100 text-gray-500' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {s.status === 'active' ? 'Activa' : s.status === 'inactive' ? 'Inactiva' : s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Informes de avance */}
      {activeTab === 'reports' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-muted m-0">{reports.length} informe(s) registrados</p>
            <button
              onClick={() => setShowAddReport((v) => !v)}
              className="flex items-center gap-1.5 rounded-btn px-3.5 py-2 text-[13px] font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none"
            >
              <HiOutlinePlus className="w-4 h-4" />
              Nuevo informe
              <HiOutlineChevronDown className={`w-3.5 h-3.5 transition-transform ${showAddReport ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showAddReport && (
            <div className="border border-line rounded-section p-4 bg-white space-y-4">
              <p className="text-[13px] font-semibold text-heading m-0">Informe #{reports.length + 1}</p>
              <div className="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
                <FormField label="Fecha de corte *" type="date"
                  value={reportForm.cutoff_date}
                  onChange={(v) => setReportForm((f) => ({ ...f, cutoff_date: v }))}
                />
                <FormField label="Fecha inicio" type="date"
                  value={reportForm.start_date}
                  onChange={(v) => setReportForm((f) => ({ ...f, start_date: v }))}
                />
                <FormField label="Fecha fin" type="date"
                  value={reportForm.end_date}
                  onChange={(v) => setReportForm((f) => ({ ...f, end_date: v }))}
                />
                <FormField label="Avance programado (%) *" type="number" placeholder="0.00"
                  value={reportForm.scheduled_progress_percent}
                  onChange={(v) => setReportForm((f) => ({ ...f, scheduled_progress_percent: v }))}
                />
                <FormField label="Avance real (%) *" type="number" placeholder="0.00"
                  value={reportForm.weighted_progress_percent}
                  onChange={(v) => setReportForm((f) => ({ ...f, weighted_progress_percent: v }))}
                />
                <FormField label="Días contrato" type="number"
                  value={reportForm.contract_days}
                  onChange={(v) => setReportForm((f) => ({ ...f, contract_days: v }))}
                />
                <FormField label="Días transcurridos" type="number"
                  value={reportForm.elapsed_days}
                  onChange={(v) => setReportForm((f) => ({ ...f, elapsed_days: v }))}
                />
                <FormField label="Días restantes" type="number"
                  value={reportForm.remaining_days}
                  onChange={(v) => setReportForm((f) => ({ ...f, remaining_days: v }))}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-label mb-1.5">Notas</label>
                <textarea
                  rows={3}
                  value={reportForm.notes}
                  onChange={(e) => setReportForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Observaciones del informe..."
                  className="w-full rounded-control border border-line bg-input-bg text-heading px-3 py-2.5 text-[13px] resize-none focus:outline-none focus:border-primary"
                />
              </div>
              {reportForm.scheduled_progress_percent && reportForm.weighted_progress_percent && (
                <p className="text-[12px] text-muted">
                  Diferencia calculada:{' '}
                  <span className={`font-semibold ${
                    Number(reportForm.weighted_progress_percent) - Number(reportForm.scheduled_progress_percent) >= 0
                      ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {(Number(reportForm.weighted_progress_percent) - Number(reportForm.scheduled_progress_percent)).toFixed(2)}%
                  </span>
                </p>
              )}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => { setShowAddReport(false); setReportForm(EMPTY_REPORT); }}
                  className="rounded-btn px-4 py-2.5 text-[13px] font-semibold text-muted hover:text-heading bg-input-bg hover:bg-line transition-colors cursor-pointer border-none"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveReport}
                  disabled={isSavingReport}
                  className="rounded-btn px-4 py-2.5 text-[13px] font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none disabled:opacity-50"
                >
                  {isSavingReport ? 'Guardando...' : 'Guardar informe'}
                </button>
              </div>
            </div>
          )}

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
                    <th className="text-right px-4 py-3 font-bold text-[12px] text-label max-[768px]:hidden">Días</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {reports.map((r) => {
                    const diff = Number(r.difference_percent);
                    return (
                      <tr key={r.id} className="hover:bg-primary-soft/20">
                        <td className="px-4 py-3 font-semibold text-heading">#{r.report_number}</td>
                        <td className="px-4 py-3 text-muted">
                          {new Date(r.cutoff_date).toLocaleDateString('es-CO')}
                        </td>
                        <td className="px-4 py-3 text-right text-heading">{r.scheduled_progress_percent}%</td>
                        <td className="px-4 py-3 text-right font-semibold text-heading">{r.weighted_progress_percent}%</td>
                        <td className={`px-4 py-3 text-right font-semibold ${diff >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {diff >= 0 ? '+' : ''}{r.difference_percent}%
                        </td>
                        <td className="px-4 py-3 text-right text-muted max-[768px]:hidden">
                          {r.elapsed_days != null ? `${r.elapsed_days}/${r.contract_days ?? '?'}` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Small helper components ──────────────────────────────────────────────────
function KpiCard({
  icon, iconBg, label, value,
}: {
  icon: React.ReactNode; iconBg: string; label: string; value: string;
}) {
  return (
    <div className="border border-line rounded-section p-4 bg-white flex items-center gap-3">
      <div className={`w-9 h-9 rounded-logo ${iconBg} grid place-items-center shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] text-muted m-0">{label}</p>
        <p className="text-[13px] font-semibold text-heading m-0">{value}</p>
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line rounded-section p-4 bg-white">
      <p className="text-[11px] font-semibold text-label mb-1">{label}</p>
      <p className="text-[13px] text-heading m-0">{value}</p>
    </div>
  );
}

function FormField({
  label, type, placeholder, value, onChange,
}: {
  label: string; type?: string; placeholder?: string; value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-label mb-1.5">{label}</label>
      <input
        type={type ?? 'text'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-control border border-line bg-input-bg text-heading px-3 py-2.5 text-[13px] focus:outline-none focus:border-primary"
      />
    </div>
  );
}
