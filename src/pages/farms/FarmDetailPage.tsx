import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { farmsApi } from '@/api/farms';
import { georreferencesApi } from '@/api/georreferences';
import { farmContactsApi } from '@/api/farmContacts';
import { galponesPorGranjaApi, galponesApi } from '@/api/galpones';
import { galponSystemsApi } from '@/api/galponSystems';
import { systemsCatalogApi } from '@/api/systemsCatalog';
import { FarmGeolocationForm } from '@/components/forms/FarmGeolocationForm';
import { FarmContactForm } from '@/components/forms/FarmContactForm';
import { GalponForm } from '@/components/forms/GalponForm';
import { GalponSystemForm } from '@/components/forms/GalponSystemForm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { sileo } from 'sileo';
import type { Farm, FarmContact, Galpon, GalponSystem, SystemCatalog } from '@/types/api';
import type { GeorreferenceFormValues, FarmContactFormValues, GalponFormValues, GalponSystemFormValues } from '@/schemas';
import axios from 'axios';
import {
  HiOutlineChevronLeft,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineLightningBolt,
  HiOutlineLocationMarker,
  HiOutlineUserGroup,
  HiOutlinePlus,
  HiOutlineBriefcase,
  HiOutlineHeart,
  HiOutlineKey,
  HiOutlineQuestionMarkCircle,
  HiOutlineExternalLink,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineOfficeBuilding,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineChevronDown,
  HiOutlineChevronRight,
  HiOutlineCog,
} from 'react-icons/hi';

const CONTACT_TYPE_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  administrador: { label: 'Administrador', icon: HiOutlineBriefcase, color: 'text-blue-600 bg-blue-50' },
  veterinario:   { label: 'Veterinario',   icon: HiOutlineHeart,    color: 'text-green-600 bg-green-50' },
  encargado:     { label: 'Encargado',      icon: HiOutlineKey,      color: 'text-orange-600 bg-orange-50' },
  otro:          { label: 'Otro',           icon: HiOutlineQuestionMarkCircle, color: 'text-muted bg-input-bg' },
};

export function FarmDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [catalog, setCatalog] = useState<SystemCatalog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGeoForm, setShowGeoForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState<FarmContact | undefined>();
  const [savingGeo, setSavingGeo] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [deleteContactTarget, setDeleteContactTarget] = useState<FarmContact | null>(null);
  const [isDeletingContact, setIsDeletingContact] = useState(false);

  // Galpón state
  const [showGalponForm, setShowGalponForm] = useState(false);
  const [editingGalpon, setEditingGalpon] = useState<Galpon | undefined>();
  const [savingGalpon, setSavingGalpon] = useState(false);
  const [deleteGalponTarget, setDeleteGalponTarget] = useState<Galpon | null>(null);
  const [isDeletingGalpon, setIsDeletingGalpon] = useState(false);
  const [expandedGalpones, setExpandedGalpones] = useState<Set<number>>(new Set());

  // Sistema state (per-galpón forms)
  const [addSystemGalponId, setAddSystemGalponId] = useState<number | null>(null);
  const [editingSystem, setEditingSystem] = useState<GalponSystem | undefined>();
  const [savingSystem, setSavingSystem] = useState(false);
  const [deleteSystemTarget, setDeleteSystemTarget] = useState<GalponSystem | null>(null);
  const [isDeletingSystem, setIsDeletingSystem] = useState(false);

  const navigate = useNavigate();

  const fetchFarm = useCallback(async () => {
    if (!id) return;
    try {
      const farmRes = await farmsApi.get(Number(id));
      setFarm(farmRes.data);
    } catch {
      sileo.error({ title: 'Granja no encontrada' });
      navigate('/farms');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchFarm();
    systemsCatalogApi.list().then((res) => {
      setCatalog(res.data.filter((s) => s.is_active));
    }).catch(() => {});
  }, [fetchFarm]);

  // ── Georreferencia ──────────────────────────────────────────────────────────

  const handleGeoSubmit = async (data: GeorreferenceFormValues) => {
    setSavingGeo(true);
    try {
      if (farm?.georreference) {
        await georreferencesApi.update(farm.georreference.id, data);
        sileo.success({ title: 'Georreferencia actualizada' });
      } else {
        await georreferencesApi.create(data);
        sileo.success({ title: 'Georreferencia creada' });
      }
      setShowGeoForm(false);
      fetchFarm();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        sileo.error({ title: 'Error de validación' });
      } else {
        sileo.error({ title: 'Error al guardar georreferencia' });
      }
    } finally {
      setSavingGeo(false);
    }
  };

  // ── Contactos ───────────────────────────────────────────────────────────────

  const handleContactSubmit = async (data: FarmContactFormValues) => {
    setSavingContact(true);
    try {
      if (editingContact) {
        await farmContactsApi.update(editingContact.id, data);
        sileo.success({ title: 'Contacto actualizado' });
      } else {
        await farmContactsApi.create(data);
        sileo.success({ title: 'Contacto creado' });
      }
      setShowContactForm(false);
      setEditingContact(undefined);
      fetchFarm();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        sileo.error({ title: 'Error de validación' });
      } else {
        sileo.error({ title: 'Error al guardar contacto' });
      }
    } finally {
      setSavingContact(false);
    }
  };

  const handleDeleteContact = async () => {
    if (!deleteContactTarget) return;
    setIsDeletingContact(true);
    try {
      await farmContactsApi.delete(deleteContactTarget.id);
      sileo.success({ title: 'Contacto eliminado' });
      setDeleteContactTarget(null);
      fetchFarm();
    } catch {
      sileo.error({ title: 'Error al eliminar contacto' });
    } finally {
      setIsDeletingContact(false);
    }
  };

  // ── Galpones ────────────────────────────────────────────────────────────────

  const handleGalponSubmit = async (data: GalponFormValues) => {
    if (!farm) return;
    setSavingGalpon(true);
    try {
      if (editingGalpon) {
        await galponesApi.update(editingGalpon.id, data);
        sileo.success({ title: 'Galpón actualizado' });
      } else {
        const res = await galponesPorGranjaApi.create(farm.id, data);
        setExpandedGalpones((prev) => new Set(prev).add(res.data.id));
        sileo.success({ title: 'Galpón creado' });
      }
      setShowGalponForm(false);
      setEditingGalpon(undefined);
      fetchFarm();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        sileo.error({ title: 'Error de validación' });
      } else {
        sileo.error({ title: 'Error al guardar galpón' });
      }
    } finally {
      setSavingGalpon(false);
    }
  };

  const handleDeleteGalpon = async () => {
    if (!deleteGalponTarget) return;
    setIsDeletingGalpon(true);
    try {
      await galponesApi.delete(deleteGalponTarget.id);
      sileo.success({ title: 'Galpón eliminado' });
      setDeleteGalponTarget(null);
      fetchFarm();
    } catch {
      sileo.error({ title: 'Error al eliminar galpón' });
    } finally {
      setIsDeletingGalpon(false);
    }
  };

  // ── Sistemas ────────────────────────────────────────────────────────────────

  const handleSystemSubmit = async (data: GalponSystemFormValues) => {
    setSavingSystem(true);
    try {
      if (editingSystem) {
        await galponSystemsApi.update(editingSystem.id, data);
        sileo.success({ title: 'Sistema actualizado' });
      } else if (addSystemGalponId != null) {
        await galponSystemsApi.create(addSystemGalponId, data);
        sileo.success({ title: 'Sistema agregado' });
      }
      setAddSystemGalponId(null);
      setEditingSystem(undefined);
      fetchFarm();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        sileo.error({ title: 'Error de validación' });
      } else {
        sileo.error({ title: 'Error al guardar sistema' });
      }
    } finally {
      setSavingSystem(false);
    }
  };

  const handleDeleteSystem = async () => {
    if (!deleteSystemTarget) return;
    setIsDeletingSystem(true);
    try {
      await galponSystemsApi.delete(deleteSystemTarget.id);
      sileo.success({ title: 'Sistema eliminado' });
      setDeleteSystemTarget(null);
      fetchFarm();
    } catch {
      sileo.error({ title: 'Error al eliminar sistema' });
    } finally {
      setIsDeletingSystem(false);
    }
  };

  const toggleGalpon = (id: number) => {
    setExpandedGalpones((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (isLoading) return <LoadingSpinner className="mt-12" />;
  if (!farm) return null;

  const voltageLabel: Record<string, string> = { '110V': '110V', '220V': '220V', '440V': '440V' };
  const currentLabel: Record<string, string> = {
    monophase: 'Monofásica',
    biphase: 'Bifásica',
    triphase: 'Trifásica',
  };

  const galpones = farm.galpones ?? [];

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Back nav */}
      <Link
        to="/farms"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors no-underline"
      >
        <HiOutlineChevronLeft className="w-4 h-4" />
        Volver a granjas
      </Link>

      {/* Header card */}
      <div className="border border-line rounded-section p-4 bg-white flex items-center gap-4">
        <div className="w-14 h-14 rounded-logo grid place-items-center bg-primary-soft shrink-0">
          <HiOutlineOfficeBuilding className="w-7 h-7 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[22px] font-bold text-heading m-0 truncate">{farm.nombre}</h2>
          {farm.client && (
            <Link
              to={`/clients/${farm.client.id}`}
              className="text-[13px] text-primary hover:underline no-underline"
            >
              {farm.client.razon_social}
            </Link>
          )}
        </div>
        <button
          onClick={() => navigate(`/farms/${farm.id}/edit`)}
          className="flex items-center gap-2 rounded-btn px-4 py-2.5 text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none shrink-0"
        >
          <HiOutlinePencil className="w-4 h-4" />
          Editar
        </button>
      </div>

      {/* ── Sistema eléctrico ── */}
      <Section
        icon={HiOutlineLightningBolt}
        title="Sistema eléctrico"
        count={[farm.farm_voltage, farm.farm_electric_current, farm.transformator_capacity_kva].filter((v) => v != null).length}
      >
        <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 max-[580px]:grid-cols-1">
          <InfoRow label="Voltaje" value={farm.farm_voltage ? voltageLabel[farm.farm_voltage] : '—'} />
          <InfoRow label="Corriente" value={farm.farm_electric_current ? currentLabel[farm.farm_electric_current] : '—'} />
          <InfoRow label="Capacidad transformador" value={farm.transformator_capacity_kva != null ? `${farm.transformator_capacity_kva} KVA` : '—'} />
          <InfoRow label="Instalaciones que alimenta" value={farm.transformator_are_feeding_installations ?? '—'} />
          <BoolRow label="Transformador propio" value={farm.have_own_transformator} />
          <BoolRow label="Alimenta otras instalaciones" value={farm.is_transformator_feeds_other_installations} />
        </div>
      </Section>

      {/* ── Infraestructura ── */}
      <Section
        icon={HiOutlineOfficeBuilding}
        title="Acceso e infraestructura"
        count={[farm.access_ways, farm.total_galpones, farm.galpones_a_cotizar].filter((v) => v != null).length}
      >
        <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 max-[580px]:grid-cols-1">
          <InfoRow label="Vías de acceso" value={farm.access_ways ?? '—'} />
          <InfoRow label="Total galpones" value={farm.total_galpones != null ? String(farm.total_galpones) : '—'} />
          <InfoRow label="Galpones a cotizar" value={farm.galpones_a_cotizar != null ? String(farm.galpones_a_cotizar) : '—'} />
          <InfoRow
            label="Bodegas"
            value={
              farm.has_storage_warehouse == null
                ? '—'
                : farm.has_storage_warehouse
                  ? `Sí (${farm.how_many_warehouses ?? 0})`
                  : 'No'
            }
          />
          <BoolRow label="Acceso fácil para tráiler" value={farm.have_easy_access_for_trailer} />
          <BoolRow label="Personal disponible" value={farm.staff_availability} />
        </div>
        {farm.observations && (
          <div className="mt-4 pt-4 border-t border-line">
            <p className="text-[12px] text-muted uppercase tracking-wide font-semibold m-0 mb-1">Observaciones</p>
            <p className="text-[14px] text-heading m-0 leading-relaxed">{farm.observations}</p>
          </div>
        )}
      </Section>

      {/* ── Georreferencia ── */}
      <div className="border border-line rounded-section p-4 bg-white space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-logo grid place-items-center bg-primary-soft shrink-0">
              <HiOutlineLocationMarker className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-heading m-0">Georreferencia</h3>
              <p className="text-[12px] text-muted m-0">Ubicación física de la granja</p>
            </div>
          </div>
          <button
            onClick={() => setShowGeoForm(!showGeoForm)}
            className={`flex items-center gap-1.5 text-[13px] font-semibold transition-colors cursor-pointer border-none rounded-btn px-3 py-1.5 ${
              showGeoForm
                ? 'text-muted bg-input-bg hover:bg-line'
                : 'text-primary bg-primary-soft hover:bg-primary hover:text-white'
            }`}
          >
            {showGeoForm ? (
              <><HiOutlineX className="w-3.5 h-3.5" /> Cancelar</>
            ) : farm.georreference ? (
              <><HiOutlinePencil className="w-3.5 h-3.5" /> Editar</>
            ) : (
              <><HiOutlinePlus className="w-3.5 h-3.5" /> Agregar</>
            )}
          </button>
        </div>

        {showGeoForm ? (
          <div className="border border-line rounded-control p-4">
            <FarmGeolocationForm
              farmId={farm.id}
              onSubmit={handleGeoSubmit}
              defaultValues={farm.georreference ?? undefined}
              isLoading={savingGeo}
            />
          </div>
        ) : farm.georreference ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 max-[580px]:grid-cols-1">
            <InfoRow label="Dirección" value={farm.georreference.address ?? '—'} />
            <InfoRow label="Municipio" value={farm.georreference.town ?? '—'} />
            <InfoRow label="Departamento" value={farm.georreference.department ?? '—'} />
            <div>
              <p className="text-[12px] text-muted m-0 mb-0.5">Enlace mapa</p>
              {farm.georreference.map_url_reference ? (
                <a
                  href={farm.georreference.map_url_reference}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary hover:underline"
                >
                  <HiOutlineExternalLink className="w-3.5 h-3.5" />
                  Ver en mapa
                </a>
              ) : (
                <span className="text-[13px] font-medium text-heading">—</span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <HiOutlineLocationMarker className="w-8 h-8 text-muted" />
            <p className="text-[13px] text-muted m-0">Sin georreferencia registrada</p>
            <button
              onClick={() => setShowGeoForm(true)}
              className="flex items-center gap-2 rounded-btn px-4 py-2.5 text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none"
            >
              <HiOutlinePlus className="w-4 h-4" />
              Agregar ubicación
            </button>
          </div>
        )}
      </div>

      {/* ── Contactos ── */}
      <div className="border border-line rounded-section p-4 bg-white space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-logo grid place-items-center bg-primary-soft shrink-0">
              <HiOutlineUserGroup className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-heading m-0">
                Contactos{' '}
                {farm.contacts && farm.contacts.length > 0 && (
                  <span className="text-muted font-normal">({farm.contacts.length})</span>
                )}
              </h3>
              <p className="text-[12px] text-muted m-0">Personal asociado a la granja</p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingContact(undefined);
              setShowContactForm(!showContactForm);
            }}
            className={`flex items-center gap-1.5 text-[13px] font-semibold transition-colors cursor-pointer border-none rounded-btn px-3 py-1.5 ${
              showContactForm
                ? 'text-muted bg-input-bg hover:bg-line'
                : 'text-primary bg-primary-soft hover:bg-primary hover:text-white'
            }`}
          >
            {showContactForm ? (
              <><HiOutlineX className="w-3.5 h-3.5" /> Cancelar</>
            ) : (
              <><HiOutlinePlus className="w-3.5 h-3.5" /> Agregar</>
            )}
          </button>
        </div>

        {showContactForm && (
          <div className="border border-primary/20 rounded-control p-4 bg-primary-soft/20">
            <p className="text-[13px] font-semibold text-heading m-0 mb-3">
              {editingContact ? 'Editar contacto' : 'Nuevo contacto'}
            </p>
            <FarmContactForm
              farmId={farm.id}
              onSubmit={handleContactSubmit}
              defaultValues={editingContact}
              isLoading={savingContact}
              onCancel={() => {
                setShowContactForm(false);
                setEditingContact(undefined);
              }}
            />
          </div>
        )}

        {farm.contacts && farm.contacts.length > 0 ? (
          <div className="space-y-2">
            {farm.contacts.map((contact) => {
              const meta = CONTACT_TYPE_META[contact.type] ?? CONTACT_TYPE_META.otro;
              const Icon = meta.icon;
              return (
                <div
                  key={contact.id}
                  className="flex items-center gap-3.5 p-3.5 border border-line rounded-action hover:border-primary/20 hover:bg-primary-soft/20 transition-colors"
                >
                  <div className={`w-9 h-9 rounded-logo grid place-items-center shrink-0 ${meta.color}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[14px] font-semibold text-heading">{contact.name}</span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${meta.color}`}>
                        {meta.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {contact.email && (
                        <span className="flex items-center gap-1 text-[12px] text-muted">
                          <HiOutlineMail className="w-3.5 h-3.5" />
                          {contact.email}
                        </span>
                      )}
                      {contact.phone && (
                        <span className="flex items-center gap-1 text-[12px] text-muted">
                          <HiOutlinePhone className="w-3.5 h-3.5" />
                          {contact.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setEditingContact(contact);
                        setShowContactForm(true);
                      }}
                      title="Editar contacto"
                      className="w-8 h-8 rounded-lg grid place-items-center text-primary bg-primary-soft hover:bg-primary hover:text-white transition-colors cursor-pointer border-none"
                    >
                      <HiOutlinePencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteContactTarget(contact)}
                      title="Eliminar contacto"
                      className="w-8 h-8 rounded-lg grid place-items-center text-danger bg-red-50 hover:bg-danger hover:text-white transition-colors cursor-pointer border-none"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          !showContactForm && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <HiOutlineUserGroup className="w-8 h-8 text-muted" />
              <p className="text-[13px] text-muted m-0">Sin contactos registrados</p>
              <button
                onClick={() => setShowContactForm(true)}
                className="flex items-center gap-2 rounded-btn px-4 py-2.5 text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none"
              >
                <HiOutlinePlus className="w-4 h-4" />
                Agregar primer contacto
              </button>
            </div>
          )
        )}
      </div>

      {/* ── Galpones ── */}
      <div className="border border-line rounded-section p-4 bg-white space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-logo grid place-items-center bg-primary-soft shrink-0">
              <HiOutlineOfficeBuilding className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-heading m-0">
                Galpones{' '}
                {galpones.length > 0 && (
                  <span className="text-muted font-normal">({galpones.length})</span>
                )}
              </h3>
              <p className="text-[12px] text-muted m-0">Estructura interna de la granja</p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingGalpon(undefined);
              setShowGalponForm(!showGalponForm);
            }}
            className={`flex items-center gap-1.5 text-[13px] font-semibold transition-colors cursor-pointer border-none rounded-btn px-3 py-1.5 ${
              showGalponForm
                ? 'text-muted bg-input-bg hover:bg-line'
                : 'text-primary bg-primary-soft hover:bg-primary hover:text-white'
            }`}
          >
            {showGalponForm ? (
              <><HiOutlineX className="w-3.5 h-3.5" /> Cancelar</>
            ) : (
              <><HiOutlinePlus className="w-3.5 h-3.5" /> Agregar</>
            )}
          </button>
        </div>

        {/* Formulario nuevo galpón */}
        {showGalponForm && (
          <div className="border border-primary/20 rounded-control p-4 bg-primary-soft/20">
            <GalponForm
              onSubmit={handleGalponSubmit}
              onCancel={() => setShowGalponForm(false)}
              isLoading={savingGalpon}
            />
          </div>
        )}

        {/* Lista de galpones */}
        {galpones.length > 0 ? (
          <div className="space-y-2">
            {galpones.map((galpon) => {
              const isExpanded = expandedGalpones.has(galpon.id);
              const isEditingThis = editingGalpon?.id === galpon.id;
              const isAddingSystemHere = addSystemGalponId === galpon.id;
              const systems = galpon.systems ?? [];

              return (
                <div key={galpon.id} className="border border-line rounded-control overflow-hidden">
                  {/* Header del galpón */}
                  <div className="flex items-center gap-3 px-4 py-3 bg-input-bg hover:bg-primary-soft/20 transition-colors">
                    <button
                      type="button"
                      onClick={() => toggleGalpon(galpon.id)}
                      className="flex items-center gap-2.5 flex-1 min-w-0 bg-transparent border-none cursor-pointer text-left p-0"
                    >
                      {isExpanded
                        ? <HiOutlineChevronDown className="w-4 h-4 text-muted shrink-0" />
                        : <HiOutlineChevronRight className="w-4 h-4 text-muted shrink-0" />
                      }
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[14px] font-semibold text-heading">{galpon.name}</span>
                          {galpon.code && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary-soft text-primary">
                              {galpon.code}
                            </span>
                          )}
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                              galpon.status === 'active'
                                ? 'bg-green-50 text-green-600'
                                : 'bg-red-50 text-danger'
                            }`}
                          >
                            {galpon.status === 'active' ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                        <p className="text-[12px] text-muted m-0">
                          {systems.length} sistema{systems.length !== 1 ? 's' : ''}
                          {galpon.dimensions_json?.largo_m != null
                            ? ` · ${galpon.dimensions_json.largo_m}×${galpon.dimensions_json.ancho_m}m`
                            : ''}
                        </p>
                      </div>
                    </button>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setEditingGalpon(galpon);
                          setShowGalponForm(false);
                          setExpandedGalpones((prev) => new Set(prev).add(galpon.id));
                        }}
                        title="Editar galpón"
                        className="w-7 h-7 rounded-lg grid place-items-center text-primary bg-primary-soft hover:bg-primary hover:text-white transition-colors cursor-pointer border-none"
                      >
                        <HiOutlinePencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteGalponTarget(galpon)}
                        title="Eliminar galpón"
                        className="w-7 h-7 rounded-lg grid place-items-center text-danger bg-red-50 hover:bg-danger hover:text-white transition-colors cursor-pointer border-none"
                      >
                        <HiOutlineTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Contenido expandido */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3">
                      {/* Formulario edición inline */}
                      {isEditingThis && (
                        <div className="border border-primary/20 rounded-control p-4 bg-primary-soft/20 mt-3">
                          <GalponForm
                            onSubmit={handleGalponSubmit}
                            onCancel={() => setEditingGalpon(undefined)}
                            defaultValues={galpon}
                            isLoading={savingGalpon}
                          />
                        </div>
                      )}

                      {/* Datos del galpón */}
                      {!isEditingThis && (
                        <div className="pt-3 grid grid-cols-2 gap-x-6 gap-y-2.5 max-[480px]:grid-cols-1">
                          {galpon.dimensions_json && (
                            <>
                              <InfoRow label="Largo" value={galpon.dimensions_json.largo_m != null ? `${galpon.dimensions_json.largo_m} m` : '—'} />
                              <InfoRow label="Ancho" value={galpon.dimensions_json.ancho_m != null ? `${galpon.dimensions_json.ancho_m} m` : '—'} />
                              <InfoRow label="Altura canal" value={galpon.dimensions_json.altura_canal_m != null ? `${galpon.dimensions_json.altura_canal_m} m` : '—'} />
                              <InfoRow label="Altura cumbrera" value={galpon.dimensions_json.altura_cumbrera_m != null ? `${galpon.dimensions_json.altura_cumbrera_m} m` : '—'} />
                            </>
                          )}
                          {galpon.technical_attributes_json?.tipo_estructura && (
                            <InfoRow label="Tipo estructura" value={galpon.technical_attributes_json.tipo_estructura} />
                          )}
                          {galpon.technical_attributes_json?.tipo_cubierta && (
                            <InfoRow label="Tipo cubierta" value={galpon.technical_attributes_json.tipo_cubierta} />
                          )}
                          {galpon.observations && (
                            <div className="col-span-2">
                              <p className="text-[12px] text-muted m-0">Observaciones</p>
                              <p className="text-[13px] font-medium text-heading m-0 mt-0.5 leading-relaxed">{galpon.observations}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Sistemas */}
                      <div className="border-t border-line pt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <HiOutlineCog className="w-3.5 h-3.5 text-muted" />
                            <span className="text-[13px] font-semibold text-heading">
                              Sistemas instalados{systems.length > 0 ? ` (${systems.length})` : ''}
                            </span>
                          </div>
                          {!isAddingSystemHere && (
                            <button
                              onClick={() => {
                                setAddSystemGalponId(galpon.id);
                                setEditingSystem(undefined);
                              }}
                              className="flex items-center gap-1 text-[12px] font-semibold text-primary bg-primary-soft hover:bg-primary hover:text-white rounded-btn px-2.5 py-1 transition-colors cursor-pointer border-none"
                            >
                              <HiOutlinePlus className="w-3 h-3" />
                              Agregar
                            </button>
                          )}
                        </div>

                        {/* Formulario nuevo sistema */}
                        {isAddingSystemHere && !editingSystem && (
                          <div className="border border-green-200 rounded-control p-3 bg-green-50/40">
                            <GalponSystemForm
                              onSubmit={handleSystemSubmit}
                              onCancel={() => setAddSystemGalponId(null)}
                              catalog={catalog}
                              isLoading={savingSystem}
                            />
                          </div>
                        )}

                        {/* Lista de sistemas */}
                        {systems.length > 0 ? (
                          <div className="space-y-1.5">
                            {systems.map((sys) => {
                              const isEditingSystem = editingSystem?.id === sys.id;
                              return (
                                <div key={sys.id}>
                                  {isEditingSystem ? (
                                    <div className="border border-primary/20 rounded-control p-3 bg-primary-soft/20">
                                      <GalponSystemForm
                                        onSubmit={handleSystemSubmit}
                                        onCancel={() => setEditingSystem(undefined)}
                                        catalog={catalog}
                                        defaultValues={sys}
                                        isLoading={savingSystem}
                                      />
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-3 p-2.5 border border-line rounded-action bg-white hover:border-primary/20 transition-colors">
                                      <div className="w-7 h-7 rounded-lg grid place-items-center bg-primary-soft shrink-0">
                                        <HiOutlineCog className="w-3.5 h-3.5 text-primary" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <span className="text-[13px] font-semibold text-heading">
                                          {sys.system?.name ?? `Sistema #${sys.system_id}`}
                                        </span>
                                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                          <span className="text-[11px] text-muted">Cantidad: {sys.quantity}</span>
                                          {sys.notes && (
                                            <span className="text-[11px] text-muted truncate max-w-45">{sys.notes}</span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1 shrink-0">
                                        <button
                                          onClick={() => {
                                            setEditingSystem(sys);
                                            setAddSystemGalponId(null);
                                          }}
                                          title="Editar sistema"
                                          className="w-6 h-6 rounded grid place-items-center text-primary bg-primary-soft hover:bg-primary hover:text-white transition-colors cursor-pointer border-none"
                                        >
                                          <HiOutlinePencil className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={() => setDeleteSystemTarget(sys)}
                                          title="Eliminar sistema"
                                          className="w-6 h-6 rounded grid place-items-center text-danger bg-red-50 hover:bg-danger hover:text-white transition-colors cursor-pointer border-none"
                                        >
                                          <HiOutlineTrash className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          !isAddingSystemHere && (
                            <p className="text-[12px] text-muted py-2">Sin sistemas instalados aún.</p>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          !showGalponForm && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <HiOutlineOfficeBuilding className="w-8 h-8 text-muted" />
              <p className="text-[13px] text-muted m-0">Sin galpones registrados</p>
              <button
                onClick={() => setShowGalponForm(true)}
                className="flex items-center gap-2 rounded-btn px-4 py-2.5 text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none"
              >
                <HiOutlinePlus className="w-4 h-4" />
                Agregar primer galpón
              </button>
            </div>
          )
        )}
      </div>

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={!!deleteContactTarget}
        title="Eliminar contacto"
        message={`¿Estás seguro de eliminar a "${deleteContactTarget?.name}"?`}
        onConfirm={handleDeleteContact}
        onCancel={() => setDeleteContactTarget(null)}
        isLoading={isDeletingContact}
      />

      <ConfirmDialog
        open={!!deleteGalponTarget}
        title="Eliminar galpón"
        message={`¿Estás seguro de eliminar "${deleteGalponTarget?.name}"? También se eliminarán sus sistemas.`}
        onConfirm={handleDeleteGalpon}
        onCancel={() => setDeleteGalponTarget(null)}
        isLoading={isDeletingGalpon}
      />

      <ConfirmDialog
        open={!!deleteSystemTarget}
        title="Eliminar sistema"
        message={`¿Estás seguro de eliminar "${deleteSystemTarget?.system?.name ?? 'este sistema'}"?`}
        onConfirm={handleDeleteSystem}
        onCancel={() => setDeleteSystemTarget(null)}
        isLoading={isDeletingSystem}
      />
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function Section({
  icon: Icon,
  title,
  count,
  children,
}: {
  icon: React.ElementType;
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-line rounded-section p-4 bg-white space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-line">
        <div className="w-8 h-8 rounded-logo grid place-items-center bg-primary-soft shrink-0">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="text-[15px] font-semibold text-heading m-0">{title}</h3>
          {count != null && (
            <p className="text-[12px] text-muted m-0">
              {count} campo{count !== 1 ? 's' : ''} completado{count !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[12px] text-muted m-0">{label}</p>
      <p className="text-[14px] font-medium text-heading m-0 mt-0.5">{value}</p>
    </div>
  );
}

function BoolRow({ label, value }: { label: string; value: boolean | null | undefined }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-5 h-5 rounded grid place-items-center shrink-0 ${
          value === true
            ? 'bg-green-100 text-green-600'
            : value === false
              ? 'bg-red-50 text-danger'
              : 'bg-input-bg text-muted'
        }`}
      >
        {value === true ? (
          <HiOutlineCheck className="w-3 h-3" />
        ) : value === false ? (
          <HiOutlineX className="w-3 h-3" />
        ) : (
          <span className="text-[10px]">—</span>
        )}
      </div>
      <p className="text-[13px] text-heading m-0">{label}</p>
    </div>
  );
}
