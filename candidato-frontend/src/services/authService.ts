// Serviço de autenticação com integração real LinkedIn OAuth 2.0

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface User {
  id: string;
  name: string;
  email: string;
  linkedinId?: string;
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LinkedInResumeData {
  nomeCompleto: string;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
  linkedinUrl: string;
  fotoPerfil: string;
  objetivoProfissional: string;
  experiencias: Array<{
    cargo: string;
    empresa: string;
    dataInicio: string;
    dataFim: string;
    descricao: string;
    atual: boolean;
  }>;
  formacoes: Array<{
    curso: string;
    instituicao: string;
    dataInicio: string;
    dataFim: string;
    status: 'completo' | 'cursando' | 'incompleto';
  }>;
  habilidades: string[];
  idiomas: Array<{
    idioma: string;
    nivel: 'basico' | 'intermediario' | 'avancado' | 'fluente' | 'nativo';
  }>;
  certificacoes: Array<{
    nome: string;
    instituicao: string;
    dataEmissao: string;
  }>;
  linkedinId?: string;
  linkedinData?: any;
}

class AuthService {
  private readonly TOKEN_KEY = 'recruta_ai_token';
  private readonly USER_KEY = 'recruta_ai_user';
  private readonly RESUME_DATA_KEY = 'recruta_ai_resume_data';

  async loginWithEmail(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await fetch(`${API_URL}/auth/login/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Erro ao fazer login');
      }

      // Salva token e usuário
      localStorage.setItem(this.TOKEN_KEY, data.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));

      return data.user;
    } catch (error) {
      console.error('Erro no login com email:', error);
      throw error;
    }
  }

  async loginWithLinkedIn(): Promise<User> {
    try {
      // 1. Solicita URL de autorização do LinkedIn
      const response = await fetch(`${API_URL}/auth/login/linkedin`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error('Erro ao iniciar autenticação com LinkedIn');
      }

      // 2. Salva o state para validação posterior
      sessionStorage.setItem('linkedin_oauth_state', data.state);

      // 3. Redireciona para o LinkedIn
      window.location.href = data.authUrl;

      // Retorna um placeholder (a página será redirecionada)
      return {} as User;
    } catch (error) {
      console.error('Erro no login com LinkedIn:', error);
      throw error;
    }
  }

  async handleLinkedInCallback(code: string, state: string): Promise<{ user: User; resumeData?: LinkedInResumeData }> {
    try {
      console.log('🔵 [AUTH SERVICE] handleLinkedInCallback iniciado');
      
      // Valida o state
      const savedState = sessionStorage.getItem('linkedin_oauth_state');
      if (state !== savedState) {
        throw new Error('State inválido - possível ataque CSRF');
      }

      console.log('🔵 [AUTH SERVICE] State validado');

      // 2. Envia código para o backend
      const response = await fetch(
        `${API_URL}/auth/linkedin/callback?code=${code}&state=${state}`
      );

      const data = await response.json();
      
      console.log('🔵 [AUTH SERVICE] Resposta do backend:', {
        success: data.success,
        hasToken: !!data.token,
        hasUser: !!data.user,
        hasResumeData: !!data.resumeData
      });

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Erro ao processar callback do LinkedIn');
      }

      // 3. Salva token e usuário
      console.log('💾 [AUTH SERVICE] Salvando token no localStorage...');
      console.log('💾 [AUTH SERVICE] Token (primeiros 30 chars):', data.token.substring(0, 30) + '...');
      
      localStorage.setItem(this.TOKEN_KEY, data.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));

      console.log('✅ [AUTH SERVICE] Token salvo!');
      console.log('✅ [AUTH SERVICE] Verificando: token existe?', !!localStorage.getItem(this.TOKEN_KEY));

      // 4. Salva dados do currículo se disponíveis
      if (data.resumeData) {
        console.log('💾 [AUTH SERVICE] Salvando resumeData...');
        localStorage.setItem(this.RESUME_DATA_KEY, JSON.stringify(data.resumeData));
      }

      // Limpa o state
      sessionStorage.removeItem('linkedin_oauth_state');

      console.log('✅ [AUTH SERVICE] handleLinkedInCallback concluído com sucesso');

      return {
        user: data.user,
        resumeData: data.resumeData
      };
    } catch (error) {
      console.error('❌ [AUTH SERVICE] Erro no callback do LinkedIn:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.RESUME_DATA_KEY);
    }
  }

  async verifyToken(): Promise<User | null> {
    try {
      const token = this.getToken();
      
      if (!token) return null;

      const response = await fetch(`${API_URL}/auth/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Token inválido, limpa storage
        this.logout();
        return null;
      }

      return data.user;
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      return null;
    }
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  getLinkedInResumeData(): LinkedInResumeData | null {
    const dataStr = localStorage.getItem(this.RESUME_DATA_KEY);
    if (!dataStr) return null;
    
    try {
      return JSON.parse(dataStr);
    } catch {
      return null;
    }
  }

  clearLinkedInResumeData(): void {
    localStorage.removeItem(this.RESUME_DATA_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();

