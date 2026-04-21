import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiArrowLeft, FiArrowRight, FiZap } from 'react-icons/fi';
import { clientsApi } from '@/api/clients';
import { farmsApi } from '@/api/farms';
import { visitTypesApi } from '@/api/visitTypes';
import { visitsApi } from '@/api/visits';
import type { Client, Farm, VisitType } from '@/types/api';

interface StartVisitModalProps {
  onClose: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export function StartVisitModal({ onClose }: StartVisitModalProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data
  const [clients, setClients] = useState<Client[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [visitTypes, setVisitTypes] = useState<VisitType[]>([]);

  // Form state
  const [clientId, setClientId] = useState<number | ''>('');
  const [farmId, setFarmId] = useState<number | ''>('');
  const [visitTypeId, setVisitTypeId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [reportDate, setReportDate] = useState(today());
  const [city, setCity] = useState('');
  const [department, setDepartment] = useState('');

  useEffect(() => {
    clientsApi.list(1, { per_page: 200 }).then((r) => setClients(r.data));
    visitTypesApi.list().then(setVisitTypes);
  }, []);

  useEffect(() => {
    if (!clientId) { setFarms([]); setFarmId(''); return; }
    farmsApi.list(1, { client_id: clientId as number, per_page: 200 }).then((r) => setFarms(r.data));
    setFarmId('');
  }, [clientId]);

  const step0Valid = clientId !== '' && farmId !== '' && visitTypeId !== '' && title.trim().length > 0;
  const step1Valid = reportDate.length > 0;

  const handleSubmit = async () => {
    if (!step0Valid || !step1Valid) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await visitsApi.create({
        client_id: clientId as number,
        farm_id: farmId as number,
        visit_type_id: visitTypeId as number,
        title: title.trim(),
        report_date: reportDate || null,
        city: city.trim() || null,
        department: department.trim() || null,
        status: 'in_progress',
      });
      navigate(`/visits/${res.data.id}/capture`);
    } catch {
      setError('No se pudo crear la visita. Inténtalo de nuevo.');
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FiZap className="text-blue-600" size={18} />
            <h3 className="font-semibold text-gray-800">Iniciar visita</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex px-5 pt-4 gap-2">
          <div className={`h-1 flex-1 rounded-full ${step >= 0 ? 'bg-blue-500' : 'bg-gray-200'}`} />
          <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-gray-200'}`} />
        </div>

        <div className="px-5 pt-5 pb-2 min-h-[300px] space-y-4">
          {step === 0 && (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">¿Dónde?</p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente <span className="text-red-500">*</span>
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value ? Number(e.target.value) : '')}
                  className={inputClass}
                >
                  <option value="">Seleccionar cliente...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.razon_social}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Granja <span className="text-red-500">*</span>
                </label>
                <select
                  value={farmId}
                  onChange={(e) => setFarmId(e.target.value ? Number(e.target.value) : '')}
                  disabled={!clientId}
                  className={inputClass + (!clientId ? ' opacity-50 cursor-not-allowed' : '')}
                >
                  <option value="">
                    {clientId ? 'Seleccionar granja...' : 'Primero selecciona un cliente'}
                  </option>
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de visita <span className="text-red-500">*</span>
                </label>
                <select
                  value={visitTypeId}
                  onChange={(e) => setVisitTypeId(e.target.value ? Number(e.target.value) : '')}
                  className={inputClass}
                >
                  <option value="">Seleccionar tipo...</option>
                  {visitTypes.map((vt) => (
                    <option key={vt.id} value={vt.id}>
                      {vt.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título del informe <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Visita inicial galpón 9 – Granja Morichal"
                  className={inputClass}
                />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">¿Cuándo?</p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha del informe <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ej: Paratebueno"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departamento <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Ej: Cundinamarca"
                  className={inputClass}
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 pb-6 pt-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep(0)}
              className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              <FiArrowLeft size={14} /> Atrás
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
          )}

          {step === 0 ? (
            <button
              type="button"
              disabled={!step0Valid}
              onClick={() => setStep(1)}
              className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente <FiArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              disabled={!step1Valid || submitting}
              onClick={handleSubmit}
              className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creando...' : <><FiZap size={14} /> Iniciar captura</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
