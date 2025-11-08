import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { curriculoService } from '@/services/curriculoService';
import { Loader2 } from 'lucide-react';

export default function HomeRedirect() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    async function checkUserProfile() {
      if (!isAuthenticated) {
        console.log('🔍 [HOME REDIRECT] Não autenticado, redirecionando para login');
        setRedirectTo('/login');
        setCheckingProfile(false);
        return;
      }

      try {
        console.log('🔍 [HOME REDIRECT] Verificando status do perfil do candidato...');
        
        const curriculo = await curriculoService.buscarCurriculo();
        
        if (!curriculo) {
          console.log('📝 [HOME REDIRECT] Nenhum currículo encontrado, redirecionando para formulário');
          setRedirectTo('/formulario-curriculo');
          setCheckingProfile(false);
          return;
        }

        console.log('✅ [HOME REDIRECT] Currículo encontrado:', {
          perfilCompleto: curriculo.perfilCompleto,
          temExperiencias: curriculo.experiencias?.length > 0,
          temFormacoes: curriculo.formacoes?.length > 0
        });

        // Se o perfil está completo, redireciona para área do candidato
        if (curriculo.perfilCompleto) {
          console.log('✅ [HOME REDIRECT] Perfil completo! Redirecionando para área do candidato');
          setRedirectTo('/area-candidato');
        } else {
          console.log('📝 [HOME REDIRECT] Perfil incompleto, redirecionando para formulário');
          setRedirectTo('/formulario-curriculo');
        }
      } catch (error) {
        console.error('❌ [HOME REDIRECT] Erro ao verificar perfil:', error);
        // Em caso de erro, redireciona para formulário
        setRedirectTo('/formulario-curriculo');
      } finally {
        setCheckingProfile(false);
      }
    }

    if (!authLoading) {
      checkUserProfile();
    }
  }, [isAuthenticated, authLoading]);

  // Mostra loading enquanto verifica autenticação ou perfil
  if (authLoading || checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redireciona para o destino apropriado
  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  // Fallback (não deveria chegar aqui)
  return <Navigate to="/login" replace />;
}

