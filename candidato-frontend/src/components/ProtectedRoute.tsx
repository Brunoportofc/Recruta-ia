import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  console.log('🔒 [PROTECTED ROUTE] Verificando acesso...');
  console.log('🔒 [PROTECTED ROUTE] isLoading:', isLoading);
  console.log('🔒 [PROTECTED ROUTE] isAuthenticated:', isAuthenticated);
  console.log('🔒 [PROTECTED ROUTE] user:', user);
  console.log('🔒 [PROTECTED ROUTE] Token no localStorage:', localStorage.getItem('recruta_ai_token') ? 'EXISTE' : 'NÃO EXISTE');
  console.log('🔒 [PROTECTED ROUTE] Usuário no localStorage:', localStorage.getItem('recruta_ai_user') ? 'EXISTE' : 'NÃO EXISTE');

  if (isLoading) {
    console.log('⏳ [PROTECTED ROUTE] Carregando...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('❌ [PROTECTED ROUTE] Não autenticado! Redirecionando para /login');
    return <Navigate to="/login" replace />;
  }

  console.log('✅ [PROTECTED ROUTE] Autenticado! Renderizando conteúdo protegido');
  return <AppLayout>{children}</AppLayout>;
}

