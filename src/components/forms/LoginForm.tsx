import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormValues } from '@/schemas';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineCheck } from 'react-icons/hi';

interface LoginFormProps {
  onSubmit: (data: LoginFormValues) => Promise<void>;
  isLoading: boolean;
}

export function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const values = watch();

  const inputClass =
    'w-full min-h-12.5 border border-line rounded-control px-3.75 py-3.5 pl-10 bg-input-bg text-sm text-heading outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-placeholder transition-colors';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="email" className="text-[13px] font-semibold text-label block mb-1.5">
          Correo electrónico
        </label>
        <div className="relative">
          <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted pointer-events-none" />
          <input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            {...register('email')}
            className={`${inputClass} ${errors.email ? 'border-danger/50' : values.email && !errors.email ? 'border-primary/40' : ''}`}
            placeholder="admin@visitador.com"
          />
        </div>
        {errors.email && (
          <p className="text-[12px] text-danger mt-1.5">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="text-[13px] font-semibold text-label block mb-1.5">
          Contraseña
        </label>
        <div className="relative">
          <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted pointer-events-none" />
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            className={`${inputClass} ${errors.password ? 'border-danger/50' : values.password && !errors.password ? 'border-primary/40' : ''}`}
            placeholder="••••••••"
          />
        </div>
        {errors.password && (
          <p className="text-[12px] text-danger mt-1.5">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 mt-1.5 border-none bg-primary text-white p-3.5 rounded-xl font-bold cursor-pointer hover:bg-primary-hover disabled:opacity-50 transition-colors"
      >
        {isLoading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Ingresando...
          </>
        ) : (
          <>
            <HiOutlineCheck className="w-4 h-4" />
            Iniciar sesión
          </>
        )}
      </button>
    </form>
  );
}
