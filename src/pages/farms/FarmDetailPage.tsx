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

  useEffect(() => {
    fetchFarm();
  }, [fetchFarm]);

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

  const contactTypeLabels: Record<string, string> = {
    administrador: 'Administrador',
    veterinario: 'Veterinario',
    encargado: 'Encargado',
    otro: 'Otro',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <Link to="/farms" className="text-sm text-primary hover:underline">
            ← Volver a granjas
          </Link>
          <h2 className="text-[28px] font-bold text-heading m-0 mt-1 max-[640px]:text-2xl">{farm.nombre}</h2>
          {farm.client && (
            <Link to={`/clients/${farm.client.id}`} className="text-sm text-muted hover:underline">
              Cliente: {farm.client.name}
            </Link>
          )}
        </div>
        <button
          onClick={() => navigate(`/farms/${farm.id}/edit`)}
          className="rounded-btn px-4.5 py-3.5 text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none"
        >
          Editar
        </button>
      </div>

      {/* Farm details */}
      <div className="border border-line rounded-section p-4.5 bg-white mb-5">
        <h3 className="text-base font-semibold text-heading mb-3.5">Detalles</h3>
        <dl className="grid grid-cols-2 gap-3.5 text-sm max-[640px]:grid-cols-1">
          <div>
            <dt className="text-[13px] text-muted">Voltaje</dt>
            <dd className="font-medium text-heading">{farm.farm_voltage ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-muted">Corriente</dt>
            <dd className="font-medium text-heading">{farm.farm_electric_current ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-muted">Cap. transformador (KVA)</dt>
            <dd className="font-medium text-heading">{farm.transformator_capacity_kva ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-muted">Transformador propio</dt>
            <dd className="font-medium text-heading">{farm.have_own_transformator === null ? '—' : farm.have_own_transformator ? 'Sí' : 'No'}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-muted">Vías de acceso</dt>
            <dd className="font-medium text-heading">{farm.access_ways ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-muted">Acceso para tráiler</dt>
            <dd className="font-medium text-heading">{farm.have_easy_access_for_trailer === null ? '—' : farm.have_easy_access_for_trailer ? 'Sí' : 'No'}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-muted">Personal disponible</dt>
            <dd className="font-medium text-heading">{farm.staff_availability === null ? '—' : farm.staff_availability ? 'Sí' : 'No'}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-muted">Bodegas</dt>
            <dd className="font-medium text-heading">{farm.has_storage_warehouse ? `Sí (${farm.how_many_warehouses ?? 0})` : farm.has_storage_warehouse === false ? 'No' : '—'}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-muted">Dist. lindero vecino (m)</dt>
            <dd className="font-medium text-heading">{farm.distance_to_neighbor_boundary_m ?? '—'}</dd>
          </div>
        </dl>
        {farm.observations && (
          <div className="mt-3.5">
            <dt className="text-[13px] text-muted">Observaciones</dt>
            <dd className="mt-1 text-sm text-heading">{farm.observations}</dd>
          </div>
        )}
      </div>

      {/* Georreference */}
      <div className="border border-line rounded-section p-4.5 bg-white mb-5">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-base font-semibold text-heading">Georreferencia</h3>
          <button
            onClick={() => setShowGeoForm(!showGeoForm)}
            className="text-sm text-primary hover:underline"
          >
            {farm.georreference ? 'Editar' : 'Agregar'}
          </button>
        </div>

        {showGeoForm ? (
          <GeorreferenceForm
            farmId={farm.id}
            onSubmit={handleGeoSubmit}
            defaultValues={farm.georreference ?? undefined}
            isLoading={savingGeo}
          />
        ) : farm.georreference ? (
          <dl className="grid grid-cols-2 gap-3.5 text-sm max-[640px]:grid-cols-1">
            <div>
              <dt className="text-[13px] text-muted">Dirección</dt>
              <dd className="font-medium text-heading">{farm.georreference.address ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-[13px] text-muted">Municipio</dt>
              <dd className="font-medium text-heading">{farm.georreference.town ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-[13px] text-muted">Departamento</dt>
              <dd className="font-medium text-heading">{farm.georreference.department ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-[13px] text-muted">URL mapa</dt>
              <dd className="font-medium text-heading">
                {farm.georreference.map_url_reference ? (
                  <a href={farm.georreference.map_url_reference} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Ver mapa
                  </a>
                ) : '—'}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-muted">Sin georreferencia registrada.</p>
        )}
      </div>

      {/* Contacts */}
      <div className="border border-line rounded-section p-4.5 bg-white">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-base font-semibold text-heading">Contactos</h3>
          <button
            onClick={() => {
              setEditingContact(undefined);
              setShowContactForm(!showContactForm);
            }}
            className="text-sm text-primary hover:underline"
          >
            + Agregar contacto
          </button>
        </div>

        {showContactForm && (
          <div className="mb-3.5 p-4 border border-line rounded-action">
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
          <div className="grid gap-3">
            {farm.contacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-3.5 border border-line rounded-action">
                <div>
                  <div className="font-medium text-heading">{contact.name}</div>
                  <div className="text-[13px] text-muted">
                    <span className="inline-block px-2 py-0.5 rounded-btn bg-primary-soft text-primary text-xs mr-2">
                      {contactTypeLabels[contact.type] ?? contact.type}
                    </span>
                    {contact.email && <span className="mr-2">{contact.email}</span>}
                    {contact.phone && <span>{contact.phone}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingContact(contact);
                      setShowContactForm(true);
                    }}
                    className="text-sm text-primary hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setDeleteContactTarget(contact)}
                    className="text-sm text-danger hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !showContactForm && <p className="text-sm text-muted">Sin contactos registrados.</p>
        )}
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
