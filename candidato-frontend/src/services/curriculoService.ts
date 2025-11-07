const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface ExperienciaData {
  cargo: string;
  empresa: string;
  dataInicio: string; // ISO date string
  dataFim?: string | null;
  atual: boolean;
  descricao?: string;
}

export interface FormacaoData {
  curso: string;
  instituicao: string;
  dataInicio: string;
  dataFim?: string | null;
  status: 'completo' | 'cursando' | 'incompleto';
}

export interface IdiomaData {
  idioma: string;
  nivel: 'basico' | 'intermediario' | 'avancado' | 'fluente' | 'nativo';
}

export interface CertificacaoData {
  nome: string;
  instituicao: string;
  dataEmissao: string;
}

export interface CurriculoCompleto {
  nomeCompleto: string;
  email: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  linkedin?: string;
  objetivoProfissional?: string;
  experiencias: ExperienciaData[];
  formacoes: FormacaoData[];
  habilidades: string[];
  idiomas: IdiomaData[];
  certificacoes: CertificacaoData[];
}

export interface TesteComportamentalData {
  respostas: Array<{
    questaoId: number;
    respostaSelecionada: string;
  }>;
  resultado: {
    [perfil: string]: number;
  };
  perfilDominante: string;
  pontuacaoTotal: number;
  tempoTesteSegundos: number;
}

class CurriculoService {
  /**
   * Salva ou atualiza o currículo completo
   */
  async salvarCurriculo(curriculo: CurriculoCompleto): Promise<{ success: boolean; candidatoId?: string; message?: string }> {
    console.log('🔍 [SALVAR] Verificando token no localStorage...');
    console.log('🔍 [SALVAR] Chaves disponíveis:', Object.keys(localStorage));
    
    const token = localStorage.getItem('recruta_ai_token');
    
    console.log('🔍 [SALVAR] Token (recruta_ai_token) existe?', token ? 'SIM' : 'NÃO');
    
    if (token) {
      console.log('🔍 [SALVAR] Token (primeiros 30 chars):', token.substring(0, 30) + '...');
    }
    
    if (!token) {
      console.error('❌ [SALVAR] Token não encontrado!');
      throw new Error('Usuário não autenticado');
    }

    console.log('📤 [FRONTEND] Enviando currículo para o backend');
    console.log('📤 [FRONTEND] URL:', `${API_URL}/curriculo/salvar`);
    console.log('📤 [FRONTEND] Headers:', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token.substring(0, 20)}...`
    });

    const response = await fetch(`${API_URL}/curriculo/salvar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(curriculo)
    });

    console.log('📥 [FRONTEND] Resposta recebida. Status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ [FRONTEND] Erro na resposta:', error);
      throw new Error(error.message || 'Erro ao salvar currículo');
    }

    const result = await response.json();
    console.log('✅ [FRONTEND] Currículo salvo com sucesso:', result);
    return result;
  }

  /**
   * Busca o currículo do candidato logado
   */
  async buscarCurriculo(): Promise<CurriculoCompleto | null> {
    console.log('🔍 [BUSCAR] Iniciando busca de currículo...');
    console.log('🔍 [BUSCAR] Verificando tokens disponíveis no localStorage:');
    console.log('  - token:', localStorage.getItem('token') ? 'EXISTE' : 'NÃO EXISTE');
    console.log('  - recruta_ai_token:', localStorage.getItem('recruta_ai_token') ? 'EXISTE' : 'NÃO EXISTE');
    console.log('  - user:', localStorage.getItem('user') ? 'EXISTE' : 'NÃO EXISTE');
    console.log('  - recruta_ai_user:', localStorage.getItem('recruta_ai_user') ? 'EXISTE' : 'NÃO EXISTE');
    
    const token = localStorage.getItem('recruta_ai_token');
    
    if (!token) {
      console.log('❌ [BUSCAR] Token não encontrado no localStorage');
      console.log('❌ [BUSCAR] localStorage completo:', Object.keys(localStorage));
      throw new Error('Usuário não autenticado');
    }

    console.log('✅ [BUSCAR] Token encontrado');
    console.log('🔍 [BUSCAR] Buscando currículo do banco de dados...');
    console.log('🔍 [BUSCAR] URL:', `${API_URL}/curriculo/buscar`);

    const response = await fetch(`${API_URL}/curriculo/buscar`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('📥 [BUSCAR] Resposta recebida. Status:', response.status);

    if (!response.ok) {
      if (response.status === 404) {
        console.log('ℹ️ [BUSCAR] Nenhum currículo encontrado no banco');
        return null;
      }
      const error = await response.json();
      console.error('❌ [BUSCAR] Erro:', error);
      throw new Error(error.message || 'Erro ao buscar currículo');
    }

    const data = await response.json();
    console.log('✅ [BUSCAR] Currículo carregado do banco');
    return data.curriculo;
  }

  /**
   * Salva resultado do teste comportamental
   */
  async salvarTesteComportamental(teste: TesteComportamentalData): Promise<{ success: boolean; testeId?: string }> {
    const token = localStorage.getItem('recruta_ai_token');
    
    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    console.log('📤 Enviando teste comportamental para o backend:', teste);

    const response = await fetch(`${API_URL}/curriculo/teste-comportamental`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(teste)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao salvar teste');
    }

    const result = await response.json();
    console.log('✅ Teste salvo com sucesso:', result);
    return result;
  }

  /**
   * Busca o último teste comportamental realizado
   */
  async buscarUltimoTeste(): Promise<any | null> {
    const token = localStorage.getItem('recruta_ai_token');
    
    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    console.log('🔍 Buscando último teste comportamental...');

    const response = await fetch(`${API_URL}/curriculo/teste-comportamental/ultimo`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log('ℹ️ Nenhum teste encontrado');
        return null;
      }
      const error = await response.json();
      throw new Error(error.message || 'Erro ao buscar teste');
    }

    const data = await response.json();
    console.log('✅ Teste encontrado:', data.teste);
    return data.teste;
  }
}

export const curriculoService = new CurriculoService();

