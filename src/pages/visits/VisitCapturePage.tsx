import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';
import { visitsApi } from '@/api/visits';
import { visitFindingsApi } from '@/api/visitFindings';
import { visitCommitmentsApi } from '@/api/visitCommitments';
import { visitMeasurementsApi } from '@/api/visitMeasurements';
import { visitMaterialRequestsApi } from '@/api/visitMaterialRequests';
import { CaptureSection } from '@/components/visits/CaptureSection';
import { FindingWizard } from '@/components/visits/FindingWizard';
import type {
  Visit,
  VisitFinding,
  VisitCommitment,
  VisitMeasurement,
  VisitMaterialRequest,
  FindingCategory,
  FindingSeverity,
  CommitmentResponsibleType,
} from '@/types/api';

const SEVERITY_COLORS: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};
const SEVERITY_LABELS: Record<string, string> = {
  low: 'Bajo',
  medium: 'Medio',
  high: 'Alto',
  critical: 'Crítico',
};
const CATEGORY_LABELS: Record<string, string> = {
  civil: 'Civil', metallic: 'Metálico', electrical: 'Eléctrico',
  mechanical: 'Mecánico', operational: 'Operacional', commercial: 'Comercial',
  quality: 'Calidad', safety: 'Seguridad', other: 'Otro',
};
const RESPONSIBLE_LABELS: Record<string, string> = {
  insumma: 'Insumma', client: 'Cliente', contractor: 'Contratista', shared: 'Compartido',
};

export function VisitCapturePage() {
  const { id } = useParams<{ id: string }>();
  const visitId = Number(id);
  const navigate = useNavigate();

  const [visit, setVisit] = useState<Visit | null>(null);
  const [findings, setFindings] = useState<VisitFinding[]>([]);
  const [commitments, setCommitments] = useState<VisitCommitment[]>([]);
  const [measurements, setMeasurements] = useState<VisitMeasurement[]>([]);
  const [materials, setMaterials] = useState<VisitMaterialRequest[]>([]);

  // Narrative state
  const [context, setContext] = useState('');
  const [development, setDevelopment] = useState('');
  const [observations, setObservations] = useState('');
  const [conclusions, setConclusions] = useState('');
  const [savingNarrative, setSavingNarrative] = useState(false);

  // UI state
  const [showFindingWizard, setShowFindingWizard] = useState(false);
  const [expandedFinding, setExpandedFinding] = useState<number | null>(null);
  const [finishing, setFinishing] = useState(false);

  // Inline commitment form
  const [showCommitmentForm, setShowCommitmentForm] = useState(false);
  const [cDesc, setCDesc] = useState('');
  const [cResponsible, setCResponsible] = useState<CommitmentResponsibleType>('insumma');
  const [cDueDate, setCDueDate] = useState('');
  const [cResponsibleName, setCResponsibleName] = useState('');
  const [savingCommitment, setSavingCommitment] = useState(false);

  // Inline measurement form
  const [showMeasurementForm, setShowMeasurementForm] = useState(false);
  const [mLabel, setMLabel] = useState('');
  const [mValue, setMValue] = useState('');
  const [mUnit, setMUnit] = useState('');
  const [mType, setMType] = useState('voltage');
  const [savingMeasurement, setSavingMeasurement] = useState(false);

  // Inline material form
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [matDesc, setMatDesc] = useState('');
  const [matQty, setMatQty] = useState('');
  const [matUnit, setMatUnit] = useState('');
  const [savingMaterial, setSavingMaterial] = useState(false);

  useEffect(() => {
    if (!visitId) return;
    Promise.all([
      visitsApi.get(visitId),
      visitFindingsApi.list(visitId),
      visitCommitmentsApi.list(visitId),
      visitMeasurementsApi.list(visitId),
      visitMaterialRequestsApi.list(visitId),
    ]).then(([v, f, c, m, mat]) => {
      const visitData = v?.data ?? (v as unknown as Visit);
      setVisit(visitData);
      setFindings(f);
      setCommitments(c);
      setMeasurements(m);
      setMaterials(mat);
      setContext(visitData?.context ?? '');
      setDevelopment(visitData?.development ?? '');
      setObservations(visitData?.general_observations ?? '');
      setConclusions(visitData?.conclusions ?? '');
    });
  }, [visitId]);

  const handleSaveFinding = async (data: {
    category: FindingCategory;
    severity: FindingSeverity;
    title: string;
    description: string;
    recommendation: string;
  }) => {
    const res = await visitFindingsApi.create(visitId, {
      category: data.category,
      severity: data.severity,
      title: data.title,
      description: data.description,
      recommendation: data.recommendation || null,
      sort_order: findings.length + 1,
    });
    setFindings((prev) => [...prev, res.data]);
    setShowFindingWizard(false);
  };

  const handleDeleteFinding = async (fId: number) => {
    await visitFindingsApi.delete(fId);
    setFindings((prev) => prev.filter((f) => f.id !== fId));
  };

  const handleSaveCommitment = async () => {
    if (!cDesc.trim()) return;
    setSavingCommitment(true);
    try {
      const res = await visitCommitmentsApi.create(visitId, {
        description: cDesc.trim(),
        responsible_type: cResponsible,
        responsible_name: cResponsibleName.trim() || null,
        due_date: cDueDate || null,
        status: 'open',
      });
      setCommitments((prev) => [...prev, res.data]);
      setCDesc(''); setCResponsibleName(''); setCDueDate('');
      setShowCommitmentForm(false);
    } finally {
      setSavingCommitment(false);
    }
  };

  const handleSaveMeasurement = async () => {
    if (!mLabel.trim() || !mValue.trim()) return;
    setSavingMeasurement(true);
    try {
      const res = await visitMeasurementsApi.create(visitId, {
        measurement_type: mType,
        label: mLabel.trim(),
        value: Number(mValue),
        unit: mUnit.trim() || '',
      });
      setMeasurements((prev) => [...prev, res.data]);
      setMLabel(''); setMValue(''); setMUnit('');
      setShowMeasurementForm(false);
    } finally {
      setSavingMeasurement(false);
    }
  };

  const handleSaveMaterial = async () => {
    if (!matDesc.trim()) return;
    setSavingMaterial(true);
    try {
      const res = await visitMaterialRequestsApi.create(visitId, {
        description: matDesc.trim(),
        unit: matUnit.trim() || 'und',
        requested_quantity: Number(matQty.trim()) || 1,
      });
      setMaterials((prev) => [...prev, res.data]);
      setMatDesc(''); setMatQty(''); setMatUnit('');
      setShowMaterialForm(false);
    } finally {
      setSavingMaterial(false);
    }
  };

  const handleSaveNarrative = async () => {
    setSavingNarrative(true);
    try {
      await visitsApi.update(visitId, {
        context: context || null,
        development: development || null,
        general_observations: observations || null,
        conclusions: conclusions || null,
      });
    } finally {
      setSavingNarrative(false);
    }
  };

  const handleFinish = async () => {
    setFinishing(true);
    try {
      await visitsApi.updateStatus(visitId, 'completed');
      navigate(`/visits/${visitId}`);
    } finally {
      setFinishing(false);
    }
  };

  const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  if (!visit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Cargando visita...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link to={`/visits/${visitId}`} className="p-1.5 text-gray-400 hover:text-gray-600 shrink-0">
              <FiArrowLeft size={18} />
            </Link>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 truncate">
                {visit.farm?.nombre ?? 'Granja'} · {visit.visit_type?.name ?? 'Visita'}
              </p>
              <p className="text-sm font-semibold text-gray-800 truncate">{visit.title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleFinish}
            disabled={finishing}
            className="shrink-0 flex items-center gap-1.5 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            <FiCheckCircle size={15} />
            {finishing ? 'Finalizando...' : 'Finalizar'}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-3">

        {/* ── HALLAZGOS ── */}
        <CaptureSection
          title="Hallazgos"
          count={findings.length}
          defaultOpen={true}
          onAdd={() => setShowFindingWizard(true)}
          addLabel="+ Agregar hallazgo"
        >
          {findings.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">
              Sin hallazgos aún. Toca el botón para agregar el primero.
            </p>
          )}
          {findings.map((f, idx) => (
            <div key={f.id} className="border border-gray-100 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedFinding(expandedFinding === f.id ? null : f.id)}
                className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50"
              >
                <span className="shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mt-0.5">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{f.title}</p>
                  <div className="flex gap-1.5 mt-1">
                    <span className="text-xs text-gray-500">{CATEGORY_LABELS[f.category]}</span>
                    {f.severity && (
                      <span className={`text-xs px-1.5 rounded-full font-medium ${SEVERITY_COLORS[f.severity]}`}>
                        {SEVERITY_LABELS[f.severity]}
                      </span>
                    )}
                  </div>
                </div>
                {expandedFinding === f.id ? (
                  <FiChevronUp size={14} className="text-gray-400 shrink-0 mt-1" />
                ) : (
                  <FiChevronDown size={14} className="text-gray-400 shrink-0 mt-1" />
                )}
              </button>

              {expandedFinding === f.id && (
                <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 space-y-2">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{f.description}</p>
                  {f.recommendation && (
                    <div className="bg-blue-50 border border-blue-100 rounded p-2">
                      <p className="text-xs font-medium text-blue-700 mb-0.5">Recomendación</p>
                      <p className="text-xs text-blue-800">{f.recommendation}</p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteFinding(f.id)}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                  >
                    <FiTrash2 size={12} /> Eliminar hallazgo
                  </button>
                </div>
              )}
            </div>
          ))}
        </CaptureSection>

        {/* ── COMPROMISOS ── */}
        <CaptureSection
          title="Compromisos"
          count={commitments.length}
          defaultOpen={false}
          onAdd={() => setShowCommitmentForm(true)}
          addLabel="+ Agregar compromiso"
        >
          {commitments.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">Sin compromisos registrados.</p>
          )}
          {commitments.map((c) => (
            <div key={c.id} className="border border-gray-100 rounded-lg px-4 py-3 space-y-1">
              <p className="text-sm text-gray-800">{c.description}</p>
              <div className="flex gap-3 text-xs text-gray-400">
                <span>{RESPONSIBLE_LABELS[c.responsible_type]}</span>
                {c.responsible_name && <span>· {c.responsible_name}</span>}
                {c.due_date && <span>· {c.due_date}</span>}
              </div>
            </div>
          ))}

          {showCommitmentForm && (
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 space-y-3">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Nuevo compromiso</p>
              <textarea
                value={cDesc}
                onChange={(e) => setCDesc(e.target.value)}
                placeholder="Descripción del compromiso..."
                rows={3}
                className={inputClass + ' resize-none'}
                autoFocus
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={cResponsible}
                  onChange={(e) => setCResponsible(e.target.value as CommitmentResponsibleType)}
                  className={inputClass}
                >
                  <option value="insumma">Insumma</option>
                  <option value="client">Cliente</option>
                  <option value="contractor">Contratista</option>
                  <option value="shared">Compartido</option>
                </select>
                <input
                  type="text"
                  value={cResponsibleName}
                  onChange={(e) => setCResponsibleName(e.target.value)}
                  placeholder="Nombre (opcional)"
                  className={inputClass}
                />
              </div>
              <input
                type="date"
                value={cDueDate}
                onChange={(e) => setCDueDate(e.target.value)}
                className={inputClass}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCommitmentForm(false)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-white"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!cDesc.trim() || savingCommitment}
                  onClick={handleSaveCommitment}
                  className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-xs font-medium hover:bg-blue-700 disabled:opacity-40"
                >
                  {savingCommitment ? 'Guardando...' : 'Guardar compromiso'}
                </button>
              </div>
            </div>
          )}
        </CaptureSection>

        {/* ── MEDICIONES ── */}
        <CaptureSection
          title="Mediciones"
          count={measurements.length}
          defaultOpen={false}
          onAdd={() => setShowMeasurementForm(true)}
          addLabel="+ Agregar medición"
        >
          {measurements.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">Sin mediciones registradas.</p>
          )}
          {measurements.map((m) => (
            <div key={m.id} className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">{m.label}</p>
                <p className="text-xs text-gray-400">{m.measurement_type}</p>
              </div>
              <span className="text-lg font-semibold text-blue-700">
                {m.value} <span className="text-sm font-normal text-gray-500">{m.unit}</span>
              </span>
            </div>
          ))}

          {showMeasurementForm && (
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 space-y-3">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Nueva medición</p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={mType}
                  onChange={(e) => setMType(e.target.value)}
                  placeholder="Tipo (ej: voltaje)"
                  className={inputClass}
                  autoFocus
                />
                <input
                  type="text"
                  value={mLabel}
                  onChange={(e) => setMLabel(e.target.value)}
                  placeholder="Etiqueta *"
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={mValue}
                  onChange={(e) => setMValue(e.target.value)}
                  placeholder="Valor *"
                  className={inputClass}
                />
                <input
                  type="text"
                  value={mUnit}
                  onChange={(e) => setMUnit(e.target.value)}
                  placeholder="Unidad (V, °C...)"
                  className={inputClass}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowMeasurementForm(false)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-white"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!mLabel.trim() || !mValue.trim() || savingMeasurement}
                  onClick={handleSaveMeasurement}
                  className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-xs font-medium hover:bg-blue-700 disabled:opacity-40"
                >
                  {savingMeasurement ? 'Guardando...' : 'Guardar medición'}
                </button>
              </div>
            </div>
          )}
        </CaptureSection>

        {/* ── MATERIALES ── */}
        <CaptureSection
          title="Materiales solicitados"
          count={materials.length}
          defaultOpen={false}
          onAdd={() => setShowMaterialForm(true)}
          addLabel="+ Agregar material"
        >
          {materials.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">Sin materiales solicitados.</p>
          )}
          {materials.map((m) => (
            <div key={m.id} className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3">
              <p className="text-sm text-gray-800">{m.description}</p>
              <span className="text-sm font-medium text-gray-600 shrink-0 ml-3">
                {m.requested_quantity} {m.unit}
              </span>
            </div>
          ))}

          {showMaterialForm && (
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 space-y-3">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Nuevo material</p>
              <input
                type="text"
                value={matDesc}
                onChange={(e) => setMatDesc(e.target.value)}
                placeholder="Descripción del material *"
                className={inputClass}
                autoFocus
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={matQty}
                  onChange={(e) => setMatQty(e.target.value)}
                  placeholder="Cantidad"
                  className={inputClass}
                />
                <input
                  type="text"
                  value={matUnit}
                  onChange={(e) => setMatUnit(e.target.value)}
                  placeholder="Unidad (und, mt...)"
                  className={inputClass}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowMaterialForm(false)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-white"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!matDesc.trim() || savingMaterial}
                  onClick={handleSaveMaterial}
                  className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-xs font-medium hover:bg-blue-700 disabled:opacity-40"
                >
                  {savingMaterial ? 'Guardando...' : 'Guardar material'}
                </button>
              </div>
            </div>
          )}
        </CaptureSection>

        {/* ── NARRATIVA ── */}
        <CaptureSection title="Narrativa del informe" defaultOpen={false}>
          <div className="space-y-3">
            {[
              { label: 'Contexto', value: context, setter: setContext, placeholder: '¿Por qué se realizó la visita?' },
              { label: 'Desarrollo', value: development, setter: setDevelopment, placeholder: '¿Qué actividades se realizaron?' },
              { label: 'Observaciones generales', value: observations, setter: setObservations, placeholder: 'Observaciones adicionales...' },
              { label: 'Conclusiones', value: conclusions, setter: setConclusions, placeholder: 'Resumen y conclusiones...' },
            ].map(({ label, value, setter, placeholder }) => (
              <div key={label}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <textarea
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={placeholder}
                  rows={3}
                  className={inputClass + ' resize-none'}
                />
              </div>
            ))}
            <button
              type="button"
              disabled={savingNarrative}
              onClick={handleSaveNarrative}
              className="w-full bg-gray-800 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-900 disabled:opacity-50"
            >
              {savingNarrative ? 'Guardando...' : 'Guardar narrativa'}
            </button>
          </div>
        </CaptureSection>

        {/* Finish button (bottom) */}
        <button
          type="button"
          onClick={handleFinish}
          disabled={finishing}
          className="w-full flex items-center justify-center gap-2 bg-green-600 text-white rounded-xl py-3.5 text-base font-semibold hover:bg-green-700 disabled:opacity-50 shadow-sm"
        >
          <FiCheckCircle size={18} />
          {finishing ? 'Finalizando visita...' : 'Finalizar visita'}
        </button>

        <p className="text-center text-xs text-gray-400 pb-4">
          Al finalizar, la visita cambia a estado "Completada" y podrás generar el informe PDF.
        </p>
      </div>

      {/* Finding wizard overlay */}
      {showFindingWizard && (
        <FindingWizard
          findingNumber={findings.length + 1}
          onSave={handleSaveFinding}
          onCancel={() => setShowFindingWizard(false)}
        />
      )}
    </div>
  );
}
