import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  nome: string;
  cnpj?: string;
  telefone?: string;
  ramoAtuacao?: string;
  tamanhoEmpresa?: string;
  website?: string;
  localizacao?: string;
  descricao?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verifica se há um token salvo e valida ele ao carregar
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔍 [AUTH] Verificando token salvo...');
        const response = await fetch('http://localhost:3001/empresa/verify-token', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (data.success && data.empresa) {
          console.log('✅ [AUTH] Token válido, usuário autenticado');
          setUser(data.empresa);
        } else {
          console.log('❌ [AUTH] Token inválido, limpando dados');
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("❌ [AUTH] Erro ao verificar token:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 [AUTH] Tentando fazer login...');
      
      const response = await fetch('http://localhost:3001/empresa/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success && data.empresa && data.token) {
        console.log('✅ [AUTH] Login realizado com sucesso!');
        
        // Salvar token e dados do usuário
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.empresa));
        localStorage.setItem("empresaId", data.empresa.id);
        
        setUser(data.empresa);
        return true;
      } else {
        console.log('❌ [AUTH] Credenciais inválidas');
        return false;
      }
    } catch (error) {
      console.error("❌ [AUTH] Erro ao fazer login:", error);
      return false;
    }
  };

  const logout = () => {
    console.log('👋 [AUTH] Fazendo logout...');
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("empresaId");
    console.log('✅ [AUTH] Logout concluído');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      console.log('✅ [AUTH] Dados do usuário atualizados');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
        isLoading,
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

