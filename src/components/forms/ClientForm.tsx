import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientSchema, type ClientFormValues } from '@/schemas';
import type { Client } from '@/types/api';

interface ClientFormProps {
  onSubmit: (data: ClientFormValues) => Promise<void>;
  defaultValues?: Client;
  isLoading: boolean;
}

export function ClientForm({ onSubmit, defaultValues, isLoading }: ClientFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: defaultValues
      ? {
          razon_social: defaultValues.razon_social,
          nit: defaultValues.nit,
          email: defaultValues.email,
          phone_number: defaultValues.phone_number,
        }
      : undefined,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4.5">
      <section className="border border-line rounded-section p-4.5 bg-white">
        <h3 className="text-base font-semibold text-heading m-0 mb-3.5">Datos del cliente</h3>
        <div className="grid grid-cols-2 gap-3.5 max-[640px]:grid-cols-1">
          <div className="grid gap-2">
            <label className="text-[13px] font-bold text-label">Razón Social</label>
            <input
              {...register('razon_social')}
              className="w-full min-h-12.5 border border-line rounded-control px-3.75 py-3.5 bg-input-bg text-sm text-heading outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-placeholder"
            />
            {errors.razon_social && <p className="text-[13px] text-danger">{errors.razon_social.message}</p>}
          </div>

          <div className="grid gap-2">
            <label className="text-[13px] font-bold text-label">NIT</label>
            <input
              {...register('nit')}
              className="w-full min-h-12.5 border border-line rounded-control px-3.75 py-3.5 bg-input-bg text-sm text-heading outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-placeholder"
            />
            {errors.nit && <p className="text-[13px] text-danger">{errors.nit.message}</p>}
          </div>

          <div className="grid gap-2">
            <label className="text-[13px] font-bold text-label">Email</label>
            <input
              type="email"
              {...register('email')}
              className="w-full min-h-12.5 border border-line rounded-control px-3.75 py-3.5 bg-input-bg text-sm text-heading outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-placeholder"
            />
            {errors.email && <p className="text-[13px] text-danger">{errors.email.message}</p>}
          </div>

          <div className="grid gap-2">
            <label className="text-[13px] font-bold text-label">Teléfono</label>
            <input
              {...register('phone_number')}
              className="w-full min-h-12.5 border border-line rounded-control px-3.75 py-3.5 bg-input-bg text-sm text-heading outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-placeholder"
            />
            {errors.phone_number && <p className="text-[13px] text-danger">{errors.phone_number.message}</p>}
          </div>
        </div>
      </section>

      <div className="flex gap-3 flex-wrap max-[640px]:flex-col">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-btn px-4.5 py-3.5 text-sm font-bold bg-primary text-white hover:bg-primary-hover disabled:opacity-50 transition-colors cursor-pointer border-none"
        >
          {isLoading ? 'Guardando...' : defaultValues ? 'Actualizar' : 'Guardar cliente'}
        </button>
      </div>
    </form>
  );
}
