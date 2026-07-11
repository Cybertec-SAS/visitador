import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { farmsApi } from '@/api/farms';
import { StepHeader, wizardInput } from '@/components/ui/wizard';
import { SubHead, Field, NumberField } from '../fields';
import type { VisitFormValues } from '@/schemas';
import type { Client, Farm } from '@/types/api';
import {
  HiOutlineIdentification,
  HiOutlineOfficeBuilding,
  HiOutlineViewGrid,
  HiOutlineUserGroup,
} from 'react-icons/hi';

/** Compone la ubicación legible desde la georreferencia de la granja. */
function farmLocation(farm: Farm): string {
  const g = farm.georreference;
  if (!g) return '';
  return [g.address, g.town, g.department].filter(Boolean).join(', ');
}

export function Step1General({ clients }: { clients: Client[] }) {
  const { watch, setValue, register, formState } = useFormContext<VisitFormValues>();
  const errors = formState.errors;

  const clientId = watch('client_id');
  const farmId = watch('farm_id');

  const [farms, setFarms] = useState<Farm[]>([]);
  const [farm, setFarm] = useState<Farm | undefined>();
  const [loadingFarms, setLoadingFarms] = useState(false);
  const [loadingFarm, setLoadingFarm] = useState(false);

  // Cargar granjas del cliente seleccionado
  useEffect(() => {
    if (!clientId) {
      setFarms([]);
      return;
    }
    setLoadingFarms(true);
    farmsApi
      .list(1, { client_id: clientId, per_page: 200 })
      .then((res) => setFarms(res.data))
      .catch(() => setFarms([]))
      .finally(() => setLoadingFarms(false));
  }, [clientId]);

  // Cargar detalle de la granja (galpones, contactos, georreferencia)
  useEffect(() => {
    if (!farmId) {
      setFarm(undefined);
      return;
    }
    setLoadingFarm(true);
    farmsApi
      .get(farmId)
      .then((res) => setFarm(res.data))
      .catch(() => setFarm(undefined))
      .finally(() => setLoadingFarm(false));
  }, [farmId]);

  const handleClientChange = (id: number) => {
    setValue('client_id', id, { shouldValidate: true });
    setValue('cliente_nombre', clients.find((c) => c.id === id)?.razon_social ?? null);
    setValue('farm_id', 0);
    setValue('galpon_id', 0);
    setValue('granja_nombre', null);
    setValue('galpon_numero', null);
    setValue('ubicacion', null);
    setValue('total_galpones', null);
    setValue('contacto', {
      adm_nombre: null,
      adm_cel: null,
      vet_nombre: null,
      vet_cel: null,
      correo: null,
    });
  };

  const handleFarmChange = async (id: number) => {
    setValue('farm_id', id, { shouldValidate: true });
    setValue('granja_nombre', farms.find((f) => f.id === id)?.nombre ?? null);
    setValue('galpon_id', 0);
    setValue('galpon_numero', null);
    if (!id) return;
    try {
      const res = await farmsApi.get(id);
      const f = res.data;
      setValue('ubicacion', farmLocation(f) || null);
      setValue('total_galpones', f.total_galpones ?? f.galpones?.length ?? null);
      const adm = f.contacts?.find((c) => c.type === 'administrador');
      const vet = f.contacts?.find((c) => c.type === 'veterinario');
      setValue('contacto', {
        adm_nombre: adm?.name ?? null,
        adm_cel: adm?.phone ?? null,
        vet_nombre: vet?.name ?? null,
        vet_cel: vet?.phone ?? null,
        correo: adm?.email ?? vet?.email ?? f.contacts?.[0]?.email ?? null,
      });
    } catch {
      /* noop */
    }
  };

  const contacto = watch('contacto');
  const ubicacion = watch('ubicacion');
  const totalGalpones = watch('total_galpones');
  const galpones = farm?.galpones ?? [];

  return (
    <div className="space-y-3">
      <StepHeader
        icon={HiOutlineIdentification}
        title="Información general de la granja"
        desc="Datos del cliente, ubicación y contactos"
      />

      <SubHead title="Cliente y granja" tag="Registro" />

      <div className="grid grid-cols-2 gap-3.5 max-[580px]:grid-cols-1">
        <Field label="Cliente / razón social *">
          <div className="relative">
            <HiOutlineUserGroup className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted pointer-events-none" />
            <select
              value={clientId || ''}
              onChange={(e) => handleClientChange(Number(e.target.value))}
              className={`${wizardInput} pl-10 appearance-none`}
            >
              <option value="">Seleccionar cliente...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.razon_social} — {c.nit}
                </option>
              ))}
            </select>
          </div>
          {errors.client_id && <p className="text-[12px] text-danger mt-1.5">{errors.client_id.message}</p>}
        </Field>

        <Field label="Fecha de la visita *">
          <input type="date" {...register('fecha')} className={wizardInput} />
          {errors.fecha && <p className="text-[12px] text-danger mt-1.5">{errors.fecha.message}</p>}
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-3.5 max-[720px]:grid-cols-1">
        <Field label="Granja *">
          <div className="relative">
            <HiOutlineOfficeBuilding className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted pointer-events-none" />
            <select
              value={farmId || ''}
              disabled={!clientId || loadingFarms}
              onChange={(e) => handleFarmChange(Number(e.target.value))}
              className={`${wizardInput} pl-10 appearance-none disabled:opacity-60`}
            >
              <option value="">
                {!clientId ? 'Selecciona un cliente primero...' : loadingFarms ? 'Cargando...' : 'Selecciona una granja...'}
              </option>
              {farms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nombre}
                </option>
              ))}
            </select>
          </div>
          {errors.farm_id && <p className="text-[12px] text-danger mt-1.5">{errors.farm_id.message}</p>}
        </Field>

        <Field label="Galpón N° *">
          <div className="relative">
            <HiOutlineViewGrid className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted pointer-events-none" />
            <select
              {...register('galpon_id', {
                setValueAs: (v) => (v === '' ? 0 : Number(v)),
                onChange: (e) => {
                  const gp = galpones.find((p) => p.id === Number(e.target.value));
                  setValue('galpon_numero', gp?.name ?? null);
                },
              })}
              disabled={!farmId || loadingFarm}
              className={`${wizardInput} pl-10 appearance-none disabled:opacity-60`}
            >
              <option value="">
                {!farmId ? 'Selecciona una granja primero...' : loadingFarm ? 'Cargando...' : 'Selecciona un galpón...'}
              </option>
              {galpones.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          {errors.galpon_id && <p className="text-[12px] text-danger mt-1.5">{errors.galpon_id.message}</p>}
        </Field>

        <NumberField name="num_aves" label="Número de aves (lote actual)" min={0} placeholder="Ej. 30000" />
      </div>

      <div className="grid grid-cols-3 gap-3.5 max-[720px]:grid-cols-1">
        <NumberField name="dia_lote" label="Día de lote" min={0} placeholder="Ej. 18" />
        <Field label="Ubicación de la granja">
          <input value={ubicacion ?? ''} readOnly placeholder="—" className={`${wizardInput} bg-input-bg text-muted`} />
        </Field>
        <Field label="Total de galpones en la granja">
          <input value={totalGalpones ?? ''} readOnly placeholder="—" className={`${wizardInput} bg-input-bg text-muted`} />
        </Field>
      </div>

      <SubHead title="Contacto de la granja" tag="Auto-completado" />
      <div className="grid grid-cols-2 gap-3.5 max-[580px]:grid-cols-1">
        <Field label="Nombre del administrador">
          <input value={contacto?.adm_nombre ?? ''} readOnly placeholder="—" className={`${wizardInput} bg-input-bg text-muted`} />
        </Field>
        <Field label="Número celular">
          <input value={contacto?.adm_cel ?? ''} readOnly placeholder="—" className={`${wizardInput} bg-input-bg text-muted`} />
        </Field>
        <Field label="Nombre del veterinario">
          <input value={contacto?.vet_nombre ?? ''} readOnly placeholder="—" className={`${wizardInput} bg-input-bg text-muted`} />
        </Field>
        <Field label="Número celular">
          <input value={contacto?.vet_cel ?? ''} readOnly placeholder="—" className={`${wizardInput} bg-input-bg text-muted`} />
        </Field>
        <Field label="Correo electrónico" className="col-span-2 max-[580px]:col-span-1">
          <input value={contacto?.correo ?? ''} readOnly placeholder="—" className={`${wizardInput} bg-input-bg text-muted`} />
        </Field>
      </div>
    </div>
  );
}
