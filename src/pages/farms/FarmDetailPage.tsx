import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { farmsApi } from '@/api/farms';
import { georreferencesApi } from '@/api/georreferences';
import { farmContactsApi } from '@/api/farmContacts';
import { GeorreferenceForm } from '@/components/forms/GeorreferenceForm';
import { FarmContactForm } from '@/components/forms/FarmContactForm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { sileo } from 'sileo';
import type { Farm, FarmContact } from '@/types/api';
import type { GeorreferenceFormValues, FarmContactFormValues } from '@/schemas';
import axios from 'axios';
import {
  HiOutlineChevronLeft,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineLightningBolt,
  HiOutlineHome,
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
  const [isLoading, setIsLoading] = useState(true);
  const [showGeoForm, setShowGeoForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState<FarmContact | undefined>();
  const [savingGeo, setSavingGeo] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [deleteContactTarget, setDeleteContactTarget] = useState<FarmContact | null>(null);
  const [isDeletingContact, setIsDeletingContact] = useState(false);
  const navigate = useNavigate();

  const fetchFarm = useCallback(async () => {
    if (!id) return;
    try {
      const res = await farmsApi.get(Number(id));
      setFarm(res.data);
    } catch {
      sileo.error({ title: 'Granja no encontrada' });
      navigate('/farms');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchFarm(); }, [fetchFarm]);

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

  if (isLoading) return <LoadingSpinner className="mt-12" />;
  if (!farm) return null;

  const voltageLabel: Record<string, string> = { '110V': '110V', '220V': '220V' };
  const currentLabel: Record<string, string> = {
    monophase: 'Monofásica',
    biphase: 'Bifásica',
    triphase: 'Trifásica',
  };

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

      {/* ── Detalles eléctricos ── */}
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
        icon={HiOutlineHome}
        title="Acceso e infraestructura"
        count={[farm.access_ways, farm.distance_to_neighbor_boundary_m].filter((v) => v != null).length}
      >
        <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 max-[580px]:grid-cols-1">
          <InfoRow label="Vías de acceso" value={farm.access_ways ?? '—'} />
          <InfoRow label="Distancia a lindero (m)" value={farm.distance_to_neighbor_boundary_m != null ? `${farm.distance_to_neighbor_boundary_m} m` : '—'} />
          <InfoRow label="Notas vecinos" value={farm.neighboring_properties_notes ?? '—'} />
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
            <GeorreferenceForm
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

        {/* Inline contact form */}
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

        {/* Contact list */}
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

      {/* Structures quick access */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-base font-semibold text-heading m-0 flex items-center gap-2">
            <HiOutlineHome className="w-5 h-5 text-primary" />
            Estructuras
          </h3>
          <Link
            to={`/structures?farm_id=${farm.id}`}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:text-primary-hover transition-colors no-underline"
          >
            Ver todas
            <HiOutlineExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
        <Link
          to={`/structures?farm_id=${farm.id}`}
          className="flex items-center gap-3 border border-dashed border-line rounded-action p-4 hover:border-primary/40 hover:bg-primary-soft/20 transition-colors no-underline group"
        >
          <div className="w-10 h-10 rounded-logo grid place-items-center bg-primary-soft shrink-0">
            <HiOutlineHome className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-heading m-0 text-[14px]">Gestionar estructuras</p>
            <p className="text-[12px] text-muted mt-0.5 m-0">Galpones, silos, extractores y más</p>
          </div>
          <HiOutlineChevronLeft className="w-4 h-4 text-muted rotate-180 group-hover:text-primary transition-colors" />
        </Link>
      </div>

      <ConfirmDialog
        open={!!deleteContactTarget}
        title="Eliminar contacto"
        message={`¿Estás seguro de eliminar a "${deleteContactTarget?.name}"?`}
        onConfirm={handleDeleteContact}
        onCancel={() => setDeleteContactTarget(null)}
        isLoading={isDeletingContact}
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
