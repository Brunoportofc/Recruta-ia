import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
  nome?: string;
  cnpj?: string;
  telefone?: string;
  
  // Dados do LinkedIn
  avatar?: string;         // URL da foto de perfil
  logo?: string;           // URL do logo da Company Page
  headline?: string;       // Descrição/slogan
  description?: string;    // Descrição completa da empresa
  industry?: string;       // Setor/indústria
  location?: string;       // Localização
  website?: string;        // Site da empresa
  employeeCount?: string;  // Número de funcionários
  
  // Status da conexão Unipile
  unipileConnected?: boolean;
  unipileConnectedAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithLinkedIn: (empresa: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Verifica se há um usuário salvo no localStorage ao carregar
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulação de login - em produção, isso seria uma chamada à API
    // Por enquanto, aceita qualquer email e senha não vazia
    if (email && password) {
      const newUser: User = { id: 'temp-id', email };
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      return true;
    }
    return false;
  };

  const loginWithLinkedIn = (empresa: User) => {
    // Login automático com dados da empresa vindos do LinkedIn/Unipile
    console.log('✅ [AUTH] Login automático com LinkedIn:', empresa);
    setUser(empresa);
    localStorage.setItem("user", JSON.stringify(empresa));
  };

  const logout = () => {
    console.log('👋 [AUTH] Fazendo logout...');
    setUser(null);
    // Remove apenas o user, mantém empresaId para reconexão automática
    localStorage.removeItem("user");
    console.log('✅ [AUTH] Logout concluído (empresaId mantido)');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        loginWithLinkedIn,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}

