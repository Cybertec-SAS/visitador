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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Visitator</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Inicia sesión para continuar</p>
          </div>
          <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
