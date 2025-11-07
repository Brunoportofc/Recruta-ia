import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, ChevronRight } from 'lucide-react';

export default function AppHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Determina o título da página atual
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/welcome') return 'Boas-vindas';
    if (path === '/formulario-curriculo') return 'Completar Currículo';
    if (path === '/teste-comportamental') return 'Teste Comportamental';
    if (path === '/area-candidato') return 'Área do Candidato';
    if (path === '/meu-perfil') return 'Meu Perfil';
    if (path === '/minha-candidatura') return 'Minha Candidatura';
    return 'Recruta.ai';
  };

  // Determina o progresso (etapa atual)
  const getProgress = () => {
    const path = location.pathname;
    if (path === '/welcome') return { step: 1, total: 3, label: 'Passo 1 de 3' };
    if (path === '/formulario-curriculo') return { step: 2, total: 3, label: 'Passo 2 de 3' };
    if (path === '/teste-comportamental') return { step: 3, total: 3, label: 'Passo 3 de 3' };
    return null;
  };

  const progress = getProgress();

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Logo e Título */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                // Se estiver em área do candidato, não faz nada
                // Se estiver no processo, volta para área do candidato ou home
                if (location.pathname !== '/area-candidato' && 
                    location.pathname !== '/meu-perfil' && 
                    location.pathname !== '/minha-candidatura') {
                  navigate('/area-candidato');
                }
              }}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <h1 className="text-2xl font-bold text-primary">Recruta.ai</h1>
            </button>
            
            <ChevronRight className="h-4 w-4 text-gray-400 hidden sm:block" />
            
            <span className="text-sm text-muted-foreground hidden sm:block">
              {getPageTitle()}
            </span>

            {progress && (
              <>
                <ChevronRight className="h-4 w-4 text-gray-400 hidden md:block" />
                <span className="text-sm font-medium text-primary hidden md:block">
                  {progress.label}
                </span>
              </>
            )}
          </div>

          {/* User Info e Logout */}
          <div className="flex items-center gap-3">
            {/* Avatar e Nome */}
            <div className="hidden sm:flex items-center gap-2">
              {user?.avatar && (
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div className="text-sm hidden md:block">
                <p className="font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>

            {/* Botão Sair */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>

        {/* Barra de Progresso (mobile) */}
        {progress && (
          <div className="mt-2 sm:hidden">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>{progress.label}</span>
              <span>{Math.round((progress.step / progress.total) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(progress.step / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

