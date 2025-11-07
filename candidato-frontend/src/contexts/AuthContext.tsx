import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithLinkedIn: () => Promise<void>;
  refreshUser: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verifica se há usuário logado ao carregar
    console.log('🔄 [AUTH CONTEXT] Inicializando AuthProvider...');
    const currentUser = authService.getCurrentUser();
    console.log('🔄 [AUTH CONTEXT] Usuário inicial:', currentUser);
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    console.log('🔄 [AUTH CONTEXT] Estado do usuário mudou:', user);
    console.log('🔄 [AUTH CONTEXT] isAuthenticated:', !!user);
  }, [user]);

  const loginWithLinkedIn = async () => {
    console.log('🔐 [AUTH CONTEXT] Iniciando login com LinkedIn...');
    setIsLoading(true);
    try {
      const user = await authService.loginWithLinkedIn();
      console.log('✅ [AUTH CONTEXT] Login bem-sucedido:', user);
      setUser(user);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = () => {
    // Atualiza o usuário do localStorage
    console.log('🔄 [AUTH CONTEXT] Atualizando usuário do localStorage...');
    const currentUser = authService.getCurrentUser();
    console.log('✅ [AUTH CONTEXT] Usuário atualizado:', currentUser);
    setUser(currentUser);
  };

  const logout = async () => {
    console.log('🚪 [AUTH CONTEXT] Fazendo logout...');
    setIsLoading(true);
    try {
      await authService.logout();
      console.log('✅ [AUTH CONTEXT] Logout concluído');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    loginWithLinkedIn,
    refreshUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

