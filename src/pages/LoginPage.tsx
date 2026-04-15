import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoginForm } from '@/components/forms/LoginForm';
import { sileo } from 'sileo';
import type { LoginFormValues } from '@/schemas';
import axios from 'axios';

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      sileo.success({ title: 'Bienvenido' });
      navigate('/');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors).flat()[0] as string;
        sileo.error({ title: firstError || 'Credenciales inválidas' });
      } else {
        sileo.error({ title: 'Error al iniciar sesión' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center p-6 max-[640px]:p-3.5">
      <div className="w-full max-w-md self-center">
        <div className="bg-surface border border-line rounded-panel shadow-panel p-[26px]">
          <div className="text-center mb-8">
            <div className="w-11 h-11 rounded-logo bg-primary text-white grid place-items-center font-extrabold text-lg mx-auto mb-3">V</div>
            <h1 className="text-xl font-bold text-heading">Visitador</h1>
            <p className="text-sm text-muted mt-1">Inicia sesión para continuar</p>
          </div>
          <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
