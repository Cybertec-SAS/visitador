import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormValues } from '@/schemas';

interface LoginFormProps {
  onSubmit: (data: LoginFormValues) => Promise<void>;
  isLoading: boolean;
}

export function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-[14px]">
      <div className="grid gap-2">
        <label htmlFor="email" className="text-[13px] font-bold text-label">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register('email')}
          className="w-full min-h-[50px] border border-line rounded-control px-[15px] py-3.5 bg-input-bg text-sm text-heading outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-placeholder"
          placeholder="admin@visitador.com"
        />
        {errors.email && <p className="text-[13px] text-danger">{errors.email.message}</p>}
      </div>

      <div className="grid gap-2">
        <label htmlFor="password" className="text-[13px] font-bold text-label">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register('password')}
          className="w-full min-h-[50px] border border-line rounded-control px-[15px] py-3.5 bg-input-bg text-sm text-heading outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-placeholder"
        />
        {errors.password && <p className="text-[13px] text-danger">{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-1.5 border-none bg-primary text-white p-3.5 rounded-[12px] font-bold cursor-pointer hover:bg-primary-hover disabled:opacity-50 transition-colors"
      >
        {isLoading ? 'Ingresando...' : 'Iniciar sesión'}
      </button>
    </form>
  );
}
