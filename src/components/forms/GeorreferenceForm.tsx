import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { georreferenceSchema, type GeorreferenceFormValues } from '@/schemas';
import type { FarmGeorreference } from '@/types/api';
import { useColombiaLocation } from '@/hooks/useColombiaLocation';
import { MapPicker } from './MapPicker';
import {
  HiOutlineLocationMarker,
  HiOutlineMap,
  HiOutlineGlobe,
  HiOutlineExternalLink,
  HiOutlineCheck,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineOfficeBuilding,
  HiOutlineRefresh,
} from 'react-icons/hi';

interface GeorreferenceFormProps {
  farmId: number;
  onSubmit: (data: GeorreferenceFormValues) => Promise<void>;
  defaultValues?: FarmGeorreference;
  isLoading: boolean;
}

const STEPS = [
  { title: 'Dirección', description: 'Ubicación física', icon: HiOutlineLocationMarker },
  { title: 'Mapa', description: 'Referencia digital', icon: HiOutlineMap },
];

function coordsToGoogleMapsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
}

function extractCoordsFromUrl(url: string): { lat: number; lng: number } | null {
  if (!url) return null;
  // Matches: ?q=4.123,-74.456 or @4.123,-74.456 or place/4.123,-74.456
  const patterns = [
    /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
    /@(-?\d+\.?\d*),(-?\d+\.?\d*)/,
    /place\/(-?\d+\.?\d*),(-?\d+\.?\d*)/,
    /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) {
      const lat = parseFloat(m[1]);
      const lng = parseFloat(m[2]);
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
    }
  }
  return null;
}

export function GeorreferenceForm({
  farmId,
  onSubmit,
  defaultValues,
  isLoading,
}: GeorreferenceFormProps) {
  const [step, setStep] = useState(0);
  const [geolocating, setGeolocating] = useState(false);
  const [pickedCoords, setPickedCoords] = useState<{ lat: number; lng: number } | null>(() => {
    if (!defaultValues?.map_url_reference) return null;
    return extractCoordsFromUrl(defaultValues.map_url_reference);
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GeorreferenceFormValues>({
    resolver: zodResolver(georreferenceSchema),
    mode: 'onTouched',
    defaultValues: defaultValues
      ? {
          farm_id: defaultValues.farm_id,
          address: defaultValues.address ?? undefined,
          town: defaultValues.town ?? undefined,
          department: defaultValues.department ?? undefined,
          map_url_reference: defaultValues.map_url_reference ?? undefined,
        }
      : { farm_id: farmId },
  });

  const values = watch();

  const {
    departments,
    cities,
    loadingDepartments,
    loadingCities,
    selectedDepartmentId,
    setSelectedDepartmentId,
  } = useColombiaLocation(defaultValues?.department ?? undefined);

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value) || null;
    const dept = departments.find((d) => d.id === id);
    setSelectedDepartmentId(id);
    setValue('department', dept?.name ?? '');
    setValue('town', '');
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue('town', e.target.value);
  };

  const handleMapPick = (lat: number, lng: number) => {
    setPickedCoords({ lat, lng });
    setValue('map_url_reference', coordsToGoogleMapsUrl(lat, lng));
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    setGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        handleMapPick(coords.latitude, coords.longitude);
        setGeolocating(false);
      },
      () => setGeolocating(false),
      { timeout: 10000 },
    );
  };

  // If user types a URL manually, try to extract coords to sync the map marker
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setValue('map_url_reference', url);
    const coords = extractCoordsFromUrl(url);
    if (coords) setPickedCoords(coords);
  };

  const filled = [values.address, values.town, values.department, values.map_url_reference].filter(
    Boolean,
  ).length;
  const progressPct = (filled / 4) * 100;

  const inputClass =
    'w-full min-h-12.5 border border-line rounded-control px-3.75 py-3.5 bg-input-bg text-sm text-heading outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-placeholder transition-colors';

  const isValidUrl = (url?: string) => {
    if (!url) return false;
    try { new URL(url); return true; } catch { return false; }
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
      <input type="hidden" {...register('farm_id', { setValueAs: (v) => Number(v) })} />
      {errors.farm_id && (
        <p className="text-[12px] text-danger">{errors.farm_id.message}</p>
      )}

      {/* Step tabs + progress */}
      <div className="space-y-3">
        <div className="flex items-center gap-0 w-fit">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isDone = i < step;
            return (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <button
                  type="button"
                  onClick={() => { if (isDone) setStep(i); }}
                  disabled={!isDone}
                  className={`flex items-center gap-2 rounded-control px-2.5 py-1.5 border-none transition-colors ${
                    isActive ? 'bg-primary-soft cursor-default' : isDone ? 'hover:bg-primary-soft/60 cursor-pointer bg-transparent' : 'opacity-40 cursor-default bg-transparent'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg grid place-items-center shrink-0 transition-colors ${isDone || isActive ? 'bg-primary text-white' : 'bg-input-bg text-muted'}`}>
                    {isDone ? <HiOutlineCheck className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                  </div>
                  <span className={`text-[12px] font-semibold ${isActive ? 'text-primary' : isDone ? 'text-heading' : 'text-muted'}`}>
                    {s.title}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 mx-2 h-0.5 bg-line rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: isDone ? '100%' : '0%' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-[11px] text-muted">Campos completados</span>
            <span className="text-[11px] font-semibold text-primary">{Math.round(progressPct)}%</span>
          </div>
          <div className="h-1 bg-line rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      {/* Step 0 – Dirección */}
      {step === 0 && (
        <div className="space-y-3">
          <div>
            <label className="text-[13px] font-semibold text-label block mb-1.5">Dirección</label>
            <div className="relative">
              <HiOutlineLocationMarker className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
              <input
                {...register('address')}
                autoFocus
                placeholder="Ej: Km 5 vía Bogotá-Chía"
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 max-[480px]:grid-cols-1">
            <div>
              <label className="text-[13px] font-semibold text-label block mb-1.5">Departamento</label>
              <div className="relative">
                <HiOutlineGlobe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                <select
                  value={selectedDepartmentId ?? ''}
                  onChange={handleDepartmentChange}
                  disabled={loadingDepartments}
                  className={`${inputClass} pl-10 appearance-none`}
                >
                  <option value="">
                    {loadingDepartments ? 'Cargando...' : 'Selecciona departamento'}
                  </option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[13px] font-semibold text-label block mb-1.5">Municipio</label>
              <div className="relative">
                <HiOutlineOfficeBuilding className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                <select
                  value={values.town ?? ''}
                  onChange={handleCityChange}
                  disabled={!selectedDepartmentId || loadingCities}
                  className={`${inputClass} pl-10 appearance-none disabled:opacity-50`}
                >
                  <option value="">
                    {loadingCities
                      ? 'Cargando...'
                      : !selectedDepartmentId
                      ? 'Primero selecciona departamento'
                      : 'Selecciona municipio'}
                  </option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 1 – Mapa */}
      {step === 1 && (
        <div className="space-y-3">
          {/* Botón usar mi ubicación */}
          <button
            type="button"
            onClick={handleGeolocate}
            disabled={geolocating}
            className="w-full flex items-center justify-center gap-2 border border-primary/40 rounded-control py-2.5 text-sm font-semibold text-primary hover:bg-primary-soft transition-colors disabled:opacity-50"
          >
            {geolocating ? (
              <>
                <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                Obteniendo ubicación...
              </>
            ) : (
              <>
                <HiOutlineRefresh className="w-4 h-4" />
                Usar mi ubicación actual
              </>
            )}
          </button>

          {/* Mapa interactivo */}
          <MapPicker
            lat={pickedCoords?.lat}
            lng={pickedCoords?.lng}
            onChange={handleMapPick}
          />

          {/* Campo URL — se autocompleta al hacer clic en el mapa */}
          <div>
            <label className="text-[13px] font-semibold text-label block mb-1.5">
              Link del mapa
              <span className="ml-1.5 text-[11px] font-normal text-muted">(se genera al marcar en el mapa)</span>
            </label>
            <div className="relative">
              <HiOutlineMap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
              <input
                value={values.map_url_reference ?? ''}
                onChange={handleUrlChange}
                placeholder="https://maps.google.com/..."
                className={`${inputClass} pl-10 ${pickedCoords ? 'border-primary/50 bg-primary-soft/20' : ''}`}
              />
            </div>
            {errors.map_url_reference && (
              <p className="text-[12px] text-danger mt-1.5">{errors.map_url_reference.message}</p>
            )}
          </div>

          {/* Link externo para verificar */}
          {isValidUrl(values.map_url_reference) && (
            <a
              href={values.map_url_reference}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 border border-primary/30 rounded-control bg-primary-soft no-underline hover:bg-primary-soft/60 transition-colors"
            >
              <HiOutlineExternalLink className="w-4 h-4 text-primary shrink-0" />
              <span className="text-[13px] text-primary font-medium truncate">
                Abrir en Google Maps para verificar
              </span>
            </a>
          )}

          {/* Resumen de dirección */}
          {(values.address || values.town || values.department) && (
            <div className="border border-line rounded-control p-3 bg-input-bg space-y-0.5">
              <p className="text-[11px] font-semibold text-muted uppercase tracking-wide m-0">Dirección registrada</p>
              {values.address && <p className="text-[13px] text-heading m-0">{values.address}</p>}
              {(values.town || values.department) && (
                <p className="text-[13px] text-muted m-0">
                  {[values.town, values.department].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3 pt-1">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep(0)}
            className="flex items-center gap-1.5 rounded-btn px-3.5 py-2.5 text-sm font-semibold text-muted border border-line bg-white hover:bg-input-bg transition-colors cursor-pointer"
          >
            <HiOutlineChevronLeft className="w-4 h-4" />
            Anterior
          </button>
        ) : (
          <div />
        )}

        {step === 0 ? (
          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex items-center gap-1.5 rounded-btn px-4 py-2.5 text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none"
          >
            Siguiente
            <HiOutlineChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleSubmit(onSubmit)()}
            className="flex items-center gap-2 rounded-btn px-4 py-2.5 text-sm font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors cursor-pointer border-none"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <HiOutlineCheck className="w-4 h-4" />
                {defaultValues ? 'Actualizar' : 'Guardar ubicación'}
              </>
            )}
          </button>
        )}
      </div>
    </form>
  );
}
