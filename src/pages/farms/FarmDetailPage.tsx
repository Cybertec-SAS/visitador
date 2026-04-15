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
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/farms" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
            ← Volver a granjas
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{farm.nombre}</h1>
          {farm.client && (
            <Link to={`/clients/${farm.client.id}`} className="text-sm text-gray-500 hover:underline dark:text-gray-400">
              Cliente: {farm.client.name}
            </Link>
          )}
        </div>
        <button
          onClick={() => navigate(`/farms/${farm.id}/edit`)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          Editar
        </button>
      </div>

      {/* Farm details */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Detalles</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Voltaje</dt>
            <dd className="font-medium text-gray-900 dark:text-gray-100">{farm.farm_voltage ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Corriente</dt>
            <dd className="font-medium text-gray-900 dark:text-gray-100">{farm.farm_electric_current ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Cap. transformador (KVA)</dt>
            <dd className="font-medium text-gray-900 dark:text-gray-100">{farm.transformator_capacity_kva ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Transformador propio</dt>
            <dd className="font-medium text-gray-900 dark:text-gray-100">{farm.have_own_transformator === null ? '—' : farm.have_own_transformator ? 'Sí' : 'No'}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Vías de acceso</dt>
            <dd className="font-medium text-gray-900 dark:text-gray-100">{farm.access_ways ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Acceso para tráiler</dt>
            <dd className="font-medium text-gray-900 dark:text-gray-100">{farm.have_easy_access_for_trailer === null ? '—' : farm.have_easy_access_for_trailer ? 'Sí' : 'No'}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Personal disponible</dt>
            <dd className="font-medium text-gray-900 dark:text-gray-100">{farm.staff_availability === null ? '—' : farm.staff_availability ? 'Sí' : 'No'}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Bodegas</dt>
            <dd className="font-medium text-gray-900 dark:text-gray-100">{farm.has_storage_warehouse ? `Sí (${farm.how_many_warehouses ?? 0})` : farm.has_storage_warehouse === false ? 'No' : '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Dist. lindero vecino (m)</dt>
            <dd className="font-medium text-gray-900 dark:text-gray-100">{farm.distance_to_neighbor_boundary_m ?? '—'}</dd>
          </div>
        </dl>
        {farm.observations && (
          <div className="mt-4">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Observaciones</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{farm.observations}</dd>
          </div>
        )}
      </div>

      {/* Georreference */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Georreferencia</h2>
          <button
            onClick={() => setShowGeoForm(!showGeoForm)}
            className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
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
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Dirección</dt>
              <dd className="font-medium text-gray-900 dark:text-gray-100">{farm.georreference.address ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Municipio</dt>
              <dd className="font-medium text-gray-900 dark:text-gray-100">{farm.georreference.town ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Departamento</dt>
              <dd className="font-medium text-gray-900 dark:text-gray-100">{farm.georreference.department ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">URL mapa</dt>
              <dd className="font-medium text-gray-900 dark:text-gray-100">
                {farm.georreference.map_url_reference ? (
                  <a href={farm.georreference.map_url_reference} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline dark:text-indigo-400">
                    Ver mapa
                  </a>
                ) : '—'}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">Sin georreferencia registrada.</p>
        )}
      </div>

      {/* Contacts */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Contactos</h2>
          <button
            onClick={() => {
              setEditingContact(undefined);
              setShowContactForm(!showContactForm);
            }}
            className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
          >
            + Agregar contacto
          </button>
        </div>

        {showContactForm && (
          <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
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
          <div className="space-y-3">
            {farm.contacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{contact.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="inline-block px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs mr-2">
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
                    className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setDeleteContactTarget(contact)}
                    className="text-sm text-red-600 hover:underline dark:text-red-400"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !showContactForm && <p className="text-sm text-gray-500 dark:text-gray-400">Sin contactos registrados.</p>
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
