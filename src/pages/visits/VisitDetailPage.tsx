import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { visitsApi } from '@/api/visits';
import { visitFindingsApi } from '@/api/visitFindings';
import { visitCommitmentsApi } from '@/api/visitCommitments';
import { visitParticipantsApi } from '@/api/visitParticipants';
import { visitMeasurementsApi } from '@/api/visitMeasurements';
import { visitMaterialRequestsApi } from '@/api/visitMaterialRequests';
import { visitSystemReviewsApi, systemsCatalogApi } from '@/api/visitSystemReviews';
import { generatedReportsApi } from '@/api/generatedReports';
import type { GeneratedReport } from '@/api/generatedReports';
import type {
  Visit,
  VisitStatus,
  VisitFinding,
  VisitCommitment,
  VisitParticipant,
  VisitMeasurement,
  VisitMaterialRequest,
  VisitSystemReview,
  SystemCatalog,
} from '@/types/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { sileo } from 'sileo';
import {
  HiOutlineChevronLeft,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineUsers,
  HiOutlineBeaker,
  HiOutlineShoppingCart,
  HiOutlineInformationCircle,
  HiOutlineRefresh,
  HiOutlineDocumentText,
  HiOutlineDownload,
  HiOutlineChevronDown,
} from 'react-icons/hi';

// ── helpers ───────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  draft: 'Borrador', scheduled: 'Programada', in_progress: 'En progreso',
  completed: 'Completada', signed: 'Firmada', closed: 'Cerrada', cancelled: 'Cancelada',
};
const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-500', scheduled: 'bg-blue-50 text-blue-600',
  in_progress: 'bg-amber-50 text-amber-700', completed: 'bg-green-50 text-green-700',
  signed: 'bg-primary-soft text-primary', closed: 'bg-gray-200 text-gray-600',
  cancelled: 'bg-red-50 text-red-500',
};

// Valid transitions per status
const STATUS_TRANSITIONS: Record<string, VisitStatus[]> = {
  draft:       ['scheduled', 'in_progress', 'cancelled'],
  scheduled:   ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed:   ['signed', 'cancelled'],
  signed:      ['closed'],
  closed:      [],
  cancelled:   [],
};

const SEVERITY_COLOR: Record<string, string> = {
  low: 'bg-blue-50 text-blue-600', medium: 'bg-amber-50 text-amber-700',
  high: 'bg-orange-50 text-orange-700', critical: 'bg-red-50 text-red-600',
};
const SEVERITY_LABEL: Record<string, string> = {
  low: 'Baja', medium: 'Media', high: 'Alta', critical: 'Crítica',
};
const REVIEW_STATUS_COLOR: Record<string, string> = {
  ok: 'bg-green-50 text-green-700', warning: 'bg-amber-50 text-amber-700',
  critical: 'bg-red-50 text-red-600', not_applicable: 'bg-gray-100 text-gray-500',
};
const REVIEW_STATUS_LABEL: Record<string, string> = {
  ok: 'OK', warning: 'Advertencia', critical: 'Crítico', not_applicable: 'N/A',
};
const COMMITMENT_STATUS_LABEL: Record<string, string> = {
  open: 'Abierto', in_progress: 'En progreso', completed: 'Completado', cancelled: 'Cancelado',
};
const COMMITMENT_STATUS_COLOR: Record<string, string> = {
  open: 'bg-blue-50 text-blue-600', in_progress: 'bg-amber-50 text-amber-700',
  completed: 'bg-green-50 text-green-700', cancelled: 'bg-gray-100 text-gray-400',
};

const TABS = [
  { key: 'info',         label: 'Información',   icon: HiOutlineInformationCircle },
  { key: 'participants', label: 'Participantes',  icon: HiOutlineUsers },
  { key: 'findings',     label: 'Hallazgos',      icon: HiOutlineExclamationCircle },
  { key: 'commitments',  label: 'Compromisos',    icon: HiOutlineCheckCircle },
  { key: 'systems',      label: 'Sistemas',       icon: HiOutlineRefresh },
  { key: 'measurements', label: 'Mediciones',     icon: HiOutlineBeaker },
  { key: 'materials',    label: 'Materiales',     icon: HiOutlineShoppingCart },
  { key: 'documents',    label: 'Documentos',     icon: HiOutlineDocumentText },
] as const;

type TabKey = typeof TABS[number]['key'];

// ── inline form helpers ───────────────────────────────────────────────────────

function InlineInput({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-label mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-line rounded-control px-3 py-2 text-[13px] text-heading focus:outline-none focus:border-primary"
      />
    </div>
  );
}

function InlineSelect({ label, value, onChange, options }: {
  label: string; value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-label mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-line rounded-control px-3 py-2 text-[13px] text-heading bg-white focus:outline-none focus:border-primary"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function InlineTextarea({ label, value, onChange, rows = 2 }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number;
}) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-label mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full border border-line rounded-control px-3 py-2 text-[13px] text-heading focus:outline-none focus:border-primary resize-none"
      />
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="py-8 flex flex-col items-center gap-2 text-center">
      <Icon className="w-8 h-8 text-muted" />
      <p className="text-[13px] text-muted">{message}</p>
    </div>
  );
}

// ── StatusDropdown ────────────────────────────────────────────────────────────

function StatusDropdown({ current, onTransition }: { current: VisitStatus; onTransition: (s: VisitStatus) => void }) {
  const [open, setOpen] = useState(false);
  const transitions = STATUS_TRANSITIONS[current] ?? [];
  if (transitions.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-btn px-3 py-2 text-[12px] font-semibold border border-line text-heading hover:bg-input-bg transition-colors cursor-pointer bg-white"
      >
        Cambiar estado
        <HiOutlineChevronDown className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-line rounded-section shadow-panel z-10">
          {transitions.map((s) => (
            <button
              key={s}
              onClick={() => { onTransition(s); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-[13px] text-heading hover:bg-primary-soft/40 transition-colors cursor-pointer border-none bg-transparent"
            >
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${STATUS_COLOR[s]?.split(' ')[0]}`} />
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function VisitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const visitId = Number(id);

  const [visit, setVisit] = useState<Visit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('info');
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  // sub-entity data
  const [findings, setFindings] = useState<VisitFinding[]>([]);
  const [commitments, setCommitments] = useState<VisitCommitment[]>([]);
  const [participants, setParticipants] = useState<VisitParticipant[]>([]);
  const [measurements, setMeasurements] = useState<VisitMeasurement[]>([]);
  const [materials, setMaterials] = useState<VisitMaterialRequest[]>([]);
  const [systemReviews, setSystemReviews] = useState<VisitSystemReview[]>([]);
  const [systemsCatalog, setSystemsCatalog] = useState<SystemCatalog[]>([]);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);

  // delete dialogs
  const [deleteFinding, setDeleteFinding] = useState<VisitFinding | null>(null);
  const [deleteCommitment, setDeleteCommitment] = useState<VisitCommitment | null>(null);
  const [deleteParticipant, setDeleteParticipant] = useState<VisitParticipant | null>(null);
  const [deleteMeasurement, setDeleteMeasurement] = useState<VisitMeasurement | null>(null);
  const [deleteMaterial, setDeleteMaterial] = useState<VisitMaterialRequest | null>(null);
  const [deleteReview, setDeleteReview] = useState<VisitSystemReview | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // inline form states
  const [showFindingForm, setShowFindingForm] = useState(false);
  const [newFinding, setNewFinding] = useState({ category: 'other', severity: 'medium', title: '', description: '', recommendation: '' });

  const [showCommitmentForm, setShowCommitmentForm] = useState(false);
  const [newCommitment, setNewCommitment] = useState({ responsible_type: 'client', description: '', responsible_name: '', due_date: '' });

  const [showParticipantForm, setShowParticipantForm] = useState(false);
  const [newParticipant, setNewParticipant] = useState({ participant_type: 'internal', name: '', role_name: '' });

  const [showMeasurementForm, setShowMeasurementForm] = useState(false);
  const [newMeasurement, setNewMeasurement] = useState({ measurement_type: 'voltaje', label: '', value: '', unit: 'V' });

  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ description: '', unit: 'und', requested_quantity: '', item_code: '' });

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ system_id: '', status: 'ok', summary: '', recommendation: '' });

  // ── load ────────────────────────────────────────────────────────────────────

  const loadAll = useCallback(async () => {
    const [
      visitRes, findingsData, commitmentsData, participantsData,
      measurementsData, materialsData, reviewsData, catalogData, reportsData,
    ] = await Promise.allSettled([
      visitsApi.get(visitId),
      visitFindingsApi.list(visitId),
      visitCommitmentsApi.list(visitId),
      visitParticipantsApi.list(visitId),
      visitMeasurementsApi.list(visitId),
      visitMaterialRequestsApi.list(visitId),
      visitSystemReviewsApi.list(visitId),
      systemsCatalogApi.list(),
      generatedReportsApi.list(visitId),
    ]);

    if (visitRes.status === 'fulfilled') setVisit(visitRes.value.data);
    if (findingsData.status === 'fulfilled') setFindings(findingsData.value);
    if (commitmentsData.status === 'fulfilled') setCommitments(commitmentsData.value);
    if (participantsData.status === 'fulfilled') setParticipants(participantsData.value);
    if (measurementsData.status === 'fulfilled') setMeasurements(measurementsData.value);
    if (materialsData.status === 'fulfilled') setMaterials(materialsData.value);
    if (reviewsData.status === 'fulfilled') setSystemReviews(reviewsData.value);
    if (catalogData.status === 'fulfilled') setSystemsCatalog(catalogData.value);
    if (reportsData.status === 'fulfilled') setGeneratedReports(reportsData.value);
    setIsLoading(false);
  }, [visitId]);

  useEffect(() => {
    loadAll().catch(() => {
      sileo.error({ title: 'Error al cargar la visita' });
      navigate('/visits');
    });
  }, [loadAll, navigate]);

  // ── status transition ───────────────────────────────────────────────────────

  const handleStatusTransition = async (newStatus: VisitStatus) => {
    setIsChangingStatus(true);
    try {
      const res = await visitsApi.updateStatus(visitId, newStatus);
      setVisit(res.data);
      sileo.success({ title: `Estado cambiado a "${STATUS_LABEL[newStatus]}"` });
    } catch {
      sileo.error({ title: 'Error al cambiar el estado' });
    } finally {
      setIsChangingStatus(false);
    }
  };

  // ── add actions ─────────────────────────────────────────────────────────────

  async function addFinding() {
    if (!newFinding.title || !newFinding.description) return sileo.error({ title: 'Título y descripción son requeridos' });
    try {
      await visitFindingsApi.create(visitId, {
        category: newFinding.category as VisitFinding['category'],
        severity: newFinding.severity as VisitFinding['severity'],
        title: newFinding.title,
        description: newFinding.description,
        recommendation: newFinding.recommendation || null,
      });
      sileo.success({ title: 'Hallazgo agregado' });
      setShowFindingForm(false);
      setNewFinding({ category: 'other', severity: 'medium', title: '', description: '', recommendation: '' });
      visitFindingsApi.list(visitId).then(setFindings);
    } catch { sileo.error({ title: 'Error al guardar hallazgo' }); }
  }

  async function addCommitment() {
    if (!newCommitment.description) return sileo.error({ title: 'La descripción es requerida' });
    try {
      await visitCommitmentsApi.create(visitId, {
        description: newCommitment.description,
        responsible_type: newCommitment.responsible_type as VisitCommitment['responsible_type'],
        responsible_name: newCommitment.responsible_name || null,
        due_date: newCommitment.due_date || null,
      });
      sileo.success({ title: 'Compromiso agregado' });
      setShowCommitmentForm(false);
      setNewCommitment({ responsible_type: 'client', description: '', responsible_name: '', due_date: '' });
      visitCommitmentsApi.list(visitId).then(setCommitments);
    } catch { sileo.error({ title: 'Error al guardar compromiso' }); }
  }

  async function addParticipant() {
    if (!newParticipant.name) return sileo.error({ title: 'El nombre es requerido' });
    try {
      await visitParticipantsApi.create(visitId, {
        participant_type: newParticipant.participant_type as VisitParticipant['participant_type'],
        name: newParticipant.name,
        role_name: newParticipant.role_name || null,
      });
      sileo.success({ title: 'Participante agregado' });
      setShowParticipantForm(false);
      setNewParticipant({ participant_type: 'internal', name: '', role_name: '' });
      visitParticipantsApi.list(visitId).then(setParticipants);
    } catch { sileo.error({ title: 'Error al guardar participante' }); }
  }

  async function addMeasurement() {
    if (!newMeasurement.label || !newMeasurement.value) return sileo.error({ title: 'Etiqueta y valor son requeridos' });
    try {
      await visitMeasurementsApi.create(visitId, {
        measurement_type: newMeasurement.measurement_type,
        label: newMeasurement.label,
        value: Number(newMeasurement.value),
        unit: newMeasurement.unit,
      });
      sileo.success({ title: 'Medición agregada' });
      setShowMeasurementForm(false);
      setNewMeasurement({ measurement_type: 'voltaje', label: '', value: '', unit: 'V' });
      visitMeasurementsApi.list(visitId).then(setMeasurements);
    } catch { sileo.error({ title: 'Error al guardar medición' }); }
  }

  async function addMaterial() {
    if (!newMaterial.description || !newMaterial.requested_quantity) return sileo.error({ title: 'Descripción y cantidad son requeridos' });
    try {
      await visitMaterialRequestsApi.create(visitId, {
        description: newMaterial.description,
        unit: newMaterial.unit,
        requested_quantity: Number(newMaterial.requested_quantity),
        item_code: newMaterial.item_code || null,
      });
      sileo.success({ title: 'Material agregado' });
      setShowMaterialForm(false);
      setNewMaterial({ description: '', unit: 'und', requested_quantity: '', item_code: '' });
      visitMaterialRequestsApi.list(visitId).then(setMaterials);
    } catch { sileo.error({ title: 'Error al guardar material' }); }
  }

  async function addReview() {
    if (!newReview.system_id) return sileo.error({ title: 'Selecciona un sistema' });
    try {
      await visitSystemReviewsApi.create(visitId, {
        system_id: Number(newReview.system_id),
        status: newReview.status as VisitSystemReview['status'],
        summary: newReview.summary || null,
        recommendation: newReview.recommendation || null,
      });
      sileo.success({ title: 'Revisión agregada' });
      setShowReviewForm(false);
      setNewReview({ system_id: '', status: 'ok', summary: '', recommendation: '' });
      visitSystemReviewsApi.list(visitId).then(setSystemReviews);
    } catch { sileo.error({ title: 'Error al guardar revisión' }); }
  }

  // ── delete ──────────────────────────────────────────────────────────────────

  async function confirmDelete(type: string) {
    setIsDeleting(true);
    try {
      if (type === 'finding' && deleteFinding) {
        await visitFindingsApi.delete(deleteFinding.id);
        setDeleteFinding(null);
        visitFindingsApi.list(visitId).then(setFindings);
      } else if (type === 'commitment' && deleteCommitment) {
        await visitCommitmentsApi.delete(deleteCommitment.id);
        setDeleteCommitment(null);
        visitCommitmentsApi.list(visitId).then(setCommitments);
      } else if (type === 'participant' && deleteParticipant) {
        await visitParticipantsApi.delete(deleteParticipant.id);
        setDeleteParticipant(null);
        visitParticipantsApi.list(visitId).then(setParticipants);
      } else if (type === 'measurement' && deleteMeasurement) {
        await visitMeasurementsApi.delete(deleteMeasurement.id);
        setDeleteMeasurement(null);
        visitMeasurementsApi.list(visitId).then(setMeasurements);
      } else if (type === 'material' && deleteMaterial) {
        await visitMaterialRequestsApi.delete(deleteMaterial.id);
        setDeleteMaterial(null);
        visitMaterialRequestsApi.list(visitId).then(setMaterials);
      } else if (type === 'review' && deleteReview) {
        await visitSystemReviewsApi.delete(deleteReview.id);
        setDeleteReview(null);
        visitSystemReviewsApi.list(visitId).then(setSystemReviews);
      }
      sileo.success({ title: 'Eliminado correctamente' });
    } catch {
      sileo.error({ title: 'Error al eliminar' });
    } finally {
      setIsDeleting(false);
    }
  }

  // ── render ───────────────────────────────────────────────────────────────────

  if (isLoading) return <LoadingSpinner className="mt-12" />;
  if (!visit) return null;

  return (
    <div className="space-y-4 max-w-4xl">
      <Link to="/visits" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors no-underline">
        <HiOutlineChevronLeft className="w-4 h-4" />
        Volver a visitas
      </Link>

      {/* Header */}
      <div className="border border-line rounded-section p-4 bg-white flex items-start gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[visit.status]}`}>
              {STATUS_LABEL[visit.status]}
            </span>
            {visit.visit_type && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary-soft text-primary">
                {visit.visit_type.name}
              </span>
            )}
          </div>
          <h2 className="text-[20px] font-bold text-heading m-0">{visit.title}</h2>
          <p className="text-[13px] text-muted mt-0.5">
            {visit.client?.razon_social} · {visit.farm?.nombre}
            {visit.report_date && ` · ${new Date(visit.report_date).toLocaleDateString('es-CO')}`}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <StatusDropdown
            current={visit.status as VisitStatus}
            onTransition={isChangingStatus ? () => {} : handleStatusTransition}
          />
          <button
            onClick={() => navigate(`/visits/${visit.id}/edit`)}
            className="flex items-center gap-2 rounded-btn px-4 py-2.5 text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none"
          >
            <HiOutlinePencil className="w-4 h-4" />
            Editar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border border-line rounded-section bg-white overflow-hidden">
        <div className="flex overflow-x-auto border-b border-line">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-[13px] font-semibold whitespace-nowrap cursor-pointer border-none transition-colors ${
                activeTab === tab.key
                  ? 'border-b-2 border-primary text-primary bg-primary-soft/30'
                  : 'text-muted hover:text-heading bg-transparent'
              }`}
            >
              <tab.icon className="w-4 h-4 shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">

          {/* ── INFO ── */}
          {activeTab === 'info' && (
            <div className="space-y-3">
              {[
                { label: 'Ciudad', value: visit.city },
                { label: 'Departamento', value: visit.department },
                { label: 'Asunto', value: visit.subject },
              ].filter((f) => f.value).map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[12px] text-muted m-0">{label}</p>
                  <p className="text-[14px] text-heading font-medium m-0 mt-0.5">{value}</p>
                </div>
              ))}
              {visit.context && (
                <div>
                  <p className="text-[12px] font-semibold text-label m-0 mb-1">Contexto</p>
                  <p className="text-[13px] text-heading m-0 leading-relaxed whitespace-pre-line">{visit.context}</p>
                </div>
              )}
              {visit.development && (
                <div>
                  <p className="text-[12px] font-semibold text-label m-0 mb-1">Desarrollo de actividades</p>
                  <p className="text-[13px] text-heading m-0 leading-relaxed whitespace-pre-line">{visit.development}</p>
                </div>
              )}
              {visit.general_observations && (
                <div>
                  <p className="text-[12px] font-semibold text-label m-0 mb-1">Observaciones generales</p>
                  <p className="text-[13px] text-heading m-0 leading-relaxed whitespace-pre-line">{visit.general_observations}</p>
                </div>
              )}
              {visit.conclusions && (
                <div>
                  <p className="text-[12px] font-semibold text-label m-0 mb-1">Conclusiones</p>
                  <p className="text-[13px] text-heading m-0 leading-relaxed whitespace-pre-line">{visit.conclusions}</p>
                </div>
              )}
              {visit.internal_notes && (
                <div className="border border-amber-200 bg-amber-50 rounded-control p-3">
                  <p className="text-[11px] font-semibold text-amber-700 m-0 mb-1">Notas internas (no se imprimen)</p>
                  <p className="text-[13px] text-amber-900 m-0 whitespace-pre-line">{visit.internal_notes}</p>
                </div>
              )}
              {!visit.context && !visit.development && !visit.general_observations && !visit.conclusions && (
                <EmptyState icon={HiOutlineInformationCircle} message="No hay información narrativa aún. Edita la visita para agregar contexto." />
              )}
            </div>
          )}

          {/* ── PARTICIPANTS ── */}
          {activeTab === 'participants' && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <button onClick={() => setShowParticipantForm(!showParticipantForm)} className="flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer border-none bg-transparent">
                  <HiOutlinePlus className="w-4 h-4" /> Agregar participante
                </button>
              </div>
              {showParticipantForm && (
                <div className="border border-line rounded-control p-4 bg-input-bg space-y-3">
                  <div className="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
                    <InlineSelect label="Tipo" value={newParticipant.participant_type} onChange={(v) => setNewParticipant((p) => ({ ...p, participant_type: v }))}
                      options={[{ value: 'internal', label: 'Interno' }, { value: 'client', label: 'Cliente' }, { value: 'contractor', label: 'Contratista' }, { value: 'other', label: 'Otro' }]} />
                    <InlineInput label="Nombre *" value={newParticipant.name} onChange={(v) => setNewParticipant((p) => ({ ...p, name: v }))} />
                  </div>
                  <InlineInput label="Rol / Cargo" value={newParticipant.role_name} onChange={(v) => setNewParticipant((p) => ({ ...p, role_name: v }))} placeholder="Ej: Administrador, Técnico" />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowParticipantForm(false)} className="rounded-btn px-3 py-1.5 text-[12px] font-semibold text-heading border border-line bg-white cursor-pointer">Cancelar</button>
                    <button onClick={addParticipant} className="rounded-btn px-3 py-1.5 text-[12px] font-bold bg-primary text-white cursor-pointer border-none">Guardar</button>
                  </div>
                </div>
              )}
              {participants.length === 0 ? (
                <EmptyState icon={HiOutlineUsers} message="No hay participantes registrados" />
              ) : (
                <div className="divide-y divide-line border border-line rounded-control overflow-hidden">
                  {participants.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-8 h-8 rounded-full bg-primary-soft grid place-items-center shrink-0">
                        <span className="text-[11px] font-bold text-primary">{p.name[0].toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-heading m-0">{p.name}</p>
                        <p className="text-[11px] text-muted m-0">{p.role_name ?? p.participant_type}</p>
                      </div>
                      <button onClick={() => setDeleteParticipant(p)} className="w-7 h-7 rounded-lg grid place-items-center text-danger bg-red-50 hover:bg-danger hover:text-white transition-colors cursor-pointer border-none">
                        <HiOutlineTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── FINDINGS ── */}
          {activeTab === 'findings' && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <button onClick={() => setShowFindingForm(!showFindingForm)} className="flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer border-none bg-transparent">
                  <HiOutlinePlus className="w-4 h-4" /> Agregar hallazgo
                </button>
              </div>
              {showFindingForm && (
                <div className="border border-line rounded-control p-4 bg-input-bg space-y-3">
                  <div className="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
                    <InlineSelect label="Categoría *" value={newFinding.category} onChange={(v) => setNewFinding((f) => ({ ...f, category: v }))}
                      options={[
                        { value: 'civil', label: 'Civil' }, { value: 'metallic', label: 'Metálico' },
                        { value: 'electrical', label: 'Eléctrico' }, { value: 'mechanical', label: 'Mecánico' },
                        { value: 'operational', label: 'Operacional' }, { value: 'commercial', label: 'Comercial' },
                        { value: 'quality', label: 'Calidad' }, { value: 'safety', label: 'Seguridad' },
                        { value: 'other', label: 'Otro' },
                      ]} />
                    <InlineSelect label="Severidad" value={newFinding.severity} onChange={(v) => setNewFinding((f) => ({ ...f, severity: v }))}
                      options={[{ value: 'low', label: 'Baja' }, { value: 'medium', label: 'Media' }, { value: 'high', label: 'Alta' }, { value: 'critical', label: 'Crítica' }]} />
                  </div>
                  <InlineInput label="Título *" value={newFinding.title} onChange={(v) => setNewFinding((f) => ({ ...f, title: v }))} />
                  <InlineTextarea label="Descripción *" value={newFinding.description} onChange={(v) => setNewFinding((f) => ({ ...f, description: v }))} rows={2} />
                  <InlineTextarea label="Recomendación" value={newFinding.recommendation} onChange={(v) => setNewFinding((f) => ({ ...f, recommendation: v }))} rows={2} />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowFindingForm(false)} className="rounded-btn px-3 py-1.5 text-[12px] font-semibold text-heading border border-line bg-white cursor-pointer">Cancelar</button>
                    <button onClick={addFinding} className="rounded-btn px-3 py-1.5 text-[12px] font-bold bg-primary text-white cursor-pointer border-none">Guardar</button>
                  </div>
                </div>
              )}
              {findings.length === 0 ? (
                <EmptyState icon={HiOutlineExclamationCircle} message="No hay hallazgos registrados" />
              ) : (
                <div className="space-y-2">
                  {findings.map((f) => (
                    <div key={f.id} className="border border-line rounded-control p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {f.severity && <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${SEVERITY_COLOR[f.severity]}`}>{SEVERITY_LABEL[f.severity]}</span>}
                            <span className="text-[11px] text-muted">{f.category}</span>
                          </div>
                          <p className="text-[13px] font-semibold text-heading m-0">{f.title}</p>
                          <p className="text-[12px] text-muted m-0 mt-1">{f.description}</p>
                          {f.recommendation && <p className="text-[12px] text-primary m-0 mt-1.5">→ {f.recommendation}</p>}
                        </div>
                        <button onClick={() => setDeleteFinding(f)} className="w-7 h-7 rounded-lg grid place-items-center text-danger bg-red-50 hover:bg-danger hover:text-white transition-colors cursor-pointer border-none shrink-0">
                          <HiOutlineTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── COMMITMENTS ── */}
          {activeTab === 'commitments' && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <button onClick={() => setShowCommitmentForm(!showCommitmentForm)} className="flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer border-none bg-transparent">
                  <HiOutlinePlus className="w-4 h-4" /> Agregar compromiso
                </button>
              </div>
              {showCommitmentForm && (
                <div className="border border-line rounded-control p-4 bg-input-bg space-y-3">
                  <InlineTextarea label="Descripción *" value={newCommitment.description} onChange={(v) => setNewCommitment((c) => ({ ...c, description: v }))} rows={2} />
                  <div className="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
                    <InlineSelect label="Responsable" value={newCommitment.responsible_type} onChange={(v) => setNewCommitment((c) => ({ ...c, responsible_type: v }))}
                      options={[{ value: 'insumma', label: 'Insumma' }, { value: 'client', label: 'Cliente' }, { value: 'contractor', label: 'Contratista' }, { value: 'shared', label: 'Compartido' }]} />
                    <InlineInput label="Nombre del responsable" value={newCommitment.responsible_name} onChange={(v) => setNewCommitment((c) => ({ ...c, responsible_name: v }))} />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-label mb-1">Fecha límite</label>
                    <input type="date" value={newCommitment.due_date} onChange={(e) => setNewCommitment((c) => ({ ...c, due_date: e.target.value }))}
                      className="border border-line rounded-control px-3 py-2 text-[13px] text-heading focus:outline-none focus:border-primary" />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowCommitmentForm(false)} className="rounded-btn px-3 py-1.5 text-[12px] font-semibold text-heading border border-line bg-white cursor-pointer">Cancelar</button>
                    <button onClick={addCommitment} className="rounded-btn px-3 py-1.5 text-[12px] font-bold bg-primary text-white cursor-pointer border-none">Guardar</button>
                  </div>
                </div>
              )}
              {commitments.length === 0 ? (
                <EmptyState icon={HiOutlineCheckCircle} message="No hay compromisos registrados" />
              ) : (
                <div className="space-y-2">
                  {commitments.map((c) => (
                    <div key={c.id} className="border border-line rounded-control p-4 flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${COMMITMENT_STATUS_COLOR[c.status]}`}>{COMMITMENT_STATUS_LABEL[c.status]}</span>
                          {c.due_date && <span className="text-[11px] text-muted">{new Date(c.due_date).toLocaleDateString('es-CO')}</span>}
                        </div>
                        <p className="text-[13px] text-heading m-0">{c.description}</p>
                        {c.responsible_name && <p className="text-[11px] text-muted m-0 mt-1">Responsable: {c.responsible_name}</p>}
                      </div>
                      <button onClick={() => setDeleteCommitment(c)} className="w-7 h-7 rounded-lg grid place-items-center text-danger bg-red-50 hover:bg-danger hover:text-white transition-colors cursor-pointer border-none shrink-0">
                        <HiOutlineTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── SYSTEMS ── */}
          {activeTab === 'systems' && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <button onClick={() => setShowReviewForm(!showReviewForm)} className="flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer border-none bg-transparent">
                  <HiOutlinePlus className="w-4 h-4" /> Evaluar sistema
                </button>
              </div>
              {showReviewForm && (
                <div className="border border-line rounded-control p-4 bg-input-bg space-y-3">
                  <div className="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
                    <InlineSelect label="Sistema *" value={newReview.system_id} onChange={(v) => setNewReview((r) => ({ ...r, system_id: v }))}
                      options={[{ value: '', label: 'Selecciona un sistema' }, ...systemsCatalog.map((s) => ({ value: String(s.id), label: s.name }))]} />
                    <InlineSelect label="Estado *" value={newReview.status} onChange={(v) => setNewReview((r) => ({ ...r, status: v }))}
                      options={[{ value: 'ok', label: 'OK' }, { value: 'warning', label: 'Advertencia' }, { value: 'critical', label: 'Crítico' }, { value: 'not_applicable', label: 'N/A' }]} />
                  </div>
                  <InlineTextarea label="Resumen" value={newReview.summary} onChange={(v) => setNewReview((r) => ({ ...r, summary: v }))} rows={2} />
                  <InlineTextarea label="Recomendación" value={newReview.recommendation} onChange={(v) => setNewReview((r) => ({ ...r, recommendation: v }))} rows={2} />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowReviewForm(false)} className="rounded-btn px-3 py-1.5 text-[12px] font-semibold text-heading border border-line bg-white cursor-pointer">Cancelar</button>
                    <button onClick={addReview} className="rounded-btn px-3 py-1.5 text-[12px] font-bold bg-primary text-white cursor-pointer border-none">Guardar</button>
                  </div>
                </div>
              )}
              {systemReviews.length === 0 ? (
                <EmptyState icon={HiOutlineRefresh} message="No hay revisiones de sistemas registradas" />
              ) : (
                <div className="divide-y divide-line border border-line rounded-control overflow-hidden">
                  {systemReviews.map((r) => (
                    <div key={r.id} className="flex items-start gap-3 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[13px] font-semibold text-heading">{r.system?.name ?? `Sistema ${r.system_id}`}</span>
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${REVIEW_STATUS_COLOR[r.status]}`}>{REVIEW_STATUS_LABEL[r.status]}</span>
                        </div>
                        {r.summary && <p className="text-[12px] text-muted m-0">{r.summary}</p>}
                        {r.recommendation && <p className="text-[12px] text-primary m-0 mt-1">→ {r.recommendation}</p>}
                      </div>
                      <button onClick={() => setDeleteReview(r)} className="w-7 h-7 rounded-lg grid place-items-center text-danger bg-red-50 hover:bg-danger hover:text-white transition-colors cursor-pointer border-none shrink-0">
                        <HiOutlineTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── MEASUREMENTS ── */}
          {activeTab === 'measurements' && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <button onClick={() => setShowMeasurementForm(!showMeasurementForm)} className="flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer border-none bg-transparent">
                  <HiOutlinePlus className="w-4 h-4" /> Agregar medición
                </button>
              </div>
              {showMeasurementForm && (
                <div className="border border-line rounded-control p-4 bg-input-bg space-y-3">
                  <div className="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
                    <InlineInput label="Tipo (ej: voltaje)" value={newMeasurement.measurement_type} onChange={(v) => setNewMeasurement((m) => ({ ...m, measurement_type: v }))} />
                    <InlineInput label="Etiqueta *" value={newMeasurement.label} onChange={(v) => setNewMeasurement((m) => ({ ...m, label: v }))} placeholder="Ej: Voltaje fase L1-L2" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <InlineInput label="Valor *" value={newMeasurement.value} onChange={(v) => setNewMeasurement((m) => ({ ...m, value: v }))} />
                    <InlineInput label="Unidad *" value={newMeasurement.unit} onChange={(v) => setNewMeasurement((m) => ({ ...m, unit: v }))} placeholder="V, A, °C, bar" />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowMeasurementForm(false)} className="rounded-btn px-3 py-1.5 text-[12px] font-semibold text-heading border border-line bg-white cursor-pointer">Cancelar</button>
                    <button onClick={addMeasurement} className="rounded-btn px-3 py-1.5 text-[12px] font-bold bg-primary text-white cursor-pointer border-none">Guardar</button>
                  </div>
                </div>
              )}
              {measurements.length === 0 ? (
                <EmptyState icon={HiOutlineBeaker} message="No hay mediciones registradas" />
              ) : (
                <div className="divide-y divide-line border border-line rounded-control overflow-hidden">
                  {measurements.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-heading m-0">{m.label}</p>
                        <p className="text-[11px] text-muted m-0">{m.measurement_type}</p>
                      </div>
                      <span className="text-[14px] font-bold text-primary">{m.value} <span className="text-[11px] font-normal text-muted">{m.unit}</span></span>
                      <button onClick={() => setDeleteMeasurement(m)} className="w-7 h-7 rounded-lg grid place-items-center text-danger bg-red-50 hover:bg-danger hover:text-white transition-colors cursor-pointer border-none">
                        <HiOutlineTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── MATERIALS ── */}
          {activeTab === 'materials' && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <button onClick={() => setShowMaterialForm(!showMaterialForm)} className="flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer border-none bg-transparent">
                  <HiOutlinePlus className="w-4 h-4" /> Agregar material
                </button>
              </div>
              {showMaterialForm && (
                <div className="border border-line rounded-control p-4 bg-input-bg space-y-3">
                  <InlineInput label="Descripción *" value={newMaterial.description} onChange={(v) => setNewMaterial((m) => ({ ...m, description: v }))} />
                  <div className="grid grid-cols-3 gap-3 max-[640px]:grid-cols-1">
                    <InlineInput label="Código" value={newMaterial.item_code} onChange={(v) => setNewMaterial((m) => ({ ...m, item_code: v }))} />
                    <InlineInput label="Cantidad *" value={newMaterial.requested_quantity} onChange={(v) => setNewMaterial((m) => ({ ...m, requested_quantity: v }))} />
                    <InlineInput label="Unidad *" value={newMaterial.unit} onChange={(v) => setNewMaterial((m) => ({ ...m, unit: v }))} placeholder="und, mt, kg" />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowMaterialForm(false)} className="rounded-btn px-3 py-1.5 text-[12px] font-semibold text-heading border border-line bg-white cursor-pointer">Cancelar</button>
                    <button onClick={addMaterial} className="rounded-btn px-3 py-1.5 text-[12px] font-bold bg-primary text-white cursor-pointer border-none">Guardar</button>
                  </div>
                </div>
              )}
              {materials.length === 0 ? (
                <EmptyState icon={HiOutlineShoppingCart} message="No hay materiales solicitados" />
              ) : (
                <div className="border border-line rounded-control overflow-hidden">
                  <table className="w-full text-[13px]">
                    <thead className="bg-input-bg">
                      <tr>
                        <th className="text-left px-4 py-2.5 font-bold text-[12px] text-label">Descripción</th>
                        <th className="text-left px-4 py-2.5 font-bold text-[12px] text-label">Código</th>
                        <th className="text-right px-4 py-2.5 font-bold text-[12px] text-label">Cant.</th>
                        <th className="text-left px-4 py-2.5 font-bold text-[12px] text-label">Unidad</th>
                        <th className="px-2 py-2.5" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {materials.map((m) => (
                        <tr key={m.id} className="hover:bg-primary-soft/20">
                          <td className="px-4 py-2.5 text-heading">{m.description}</td>
                          <td className="px-4 py-2.5 text-muted">{m.item_code ?? '—'}</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-heading">{m.requested_quantity}</td>
                          <td className="px-4 py-2.5 text-muted">{m.unit}</td>
                          <td className="px-2 py-2.5">
                            <button onClick={() => setDeleteMaterial(m)} className="w-7 h-7 rounded-lg grid place-items-center text-danger bg-red-50 hover:bg-danger hover:text-white transition-colors cursor-pointer border-none">
                              <HiOutlineTrash className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── DOCUMENTS ── */}
          {activeTab === 'documents' && (
            <div className="space-y-3">
              <p className="text-[12px] text-muted">Los PDFs se generan en segundo plano. Actualiza la página para ver los nuevos documentos.</p>
              {generatedReports.length === 0 ? (
                <EmptyState icon={HiOutlineDocumentText} message="No hay documentos generados aún" />
              ) : (
                <div className="divide-y divide-line border border-line rounded-control overflow-hidden">
                  {generatedReports.map((r) => (
                    <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-9 h-9 rounded-logo bg-red-50 grid place-items-center shrink-0">
                        <HiOutlineDocumentText className="w-4.5 h-4.5 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-heading m-0">Versión {r.version}</p>
                        <p className="text-[11px] text-muted m-0">
                          {new Date(r.generated_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          {r.generated_by && ` · ${r.generated_by.name}`}
                        </p>
                      </div>
                      <a
                        href={r.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-btn px-3 py-2 text-[12px] font-semibold text-primary bg-primary-soft hover:bg-primary hover:text-white transition-colors no-underline"
                      >
                        <HiOutlineDownload className="w-3.5 h-3.5" />
                        Descargar
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Delete dialogs */}
      <ConfirmDialog open={!!deleteFinding} title="Eliminar hallazgo" message={`¿Eliminar "${deleteFinding?.title}"?`} onConfirm={() => confirmDelete('finding')} onCancel={() => setDeleteFinding(null)} isLoading={isDeleting} />
      <ConfirmDialog open={!!deleteCommitment} title="Eliminar compromiso" message="¿Eliminar este compromiso?" onConfirm={() => confirmDelete('commitment')} onCancel={() => setDeleteCommitment(null)} isLoading={isDeleting} />
      <ConfirmDialog open={!!deleteParticipant} title="Eliminar participante" message={`¿Eliminar a "${deleteParticipant?.name}"?`} onConfirm={() => confirmDelete('participant')} onCancel={() => setDeleteParticipant(null)} isLoading={isDeleting} />
      <ConfirmDialog open={!!deleteMeasurement} title="Eliminar medición" message={`¿Eliminar "${deleteMeasurement?.label}"?`} onConfirm={() => confirmDelete('measurement')} onCancel={() => setDeleteMeasurement(null)} isLoading={isDeleting} />
      <ConfirmDialog open={!!deleteMaterial} title="Eliminar material" message={`¿Eliminar "${deleteMaterial?.description}"?`} onConfirm={() => confirmDelete('material')} onCancel={() => setDeleteMaterial(null)} isLoading={isDeleting} />
      <ConfirmDialog open={!!deleteReview} title="Eliminar revisión" message="¿Eliminar esta revisión de sistema?" onConfirm={() => confirmDelete('review')} onCancel={() => setDeleteReview(null)} isLoading={isDeleting} />
    </div>
  );
}
