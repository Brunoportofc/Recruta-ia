const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export interface Location {
  id: string;
  name?: string;
  location_id?: string;
  location_name?: string;
  code?: string;
  [key: string]: any; // Para permitir outras propriedades que a API possa retornar
}

export interface Job {
  id: string;
  job_title: string;
  company: string;
  workplace: string;
  location: string;
  description: string;
  employment_status?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Busca a lista de localizações disponíveis da API da Unipile
 */
export async function getLocations(): Promise<Location[]> {
  console.log('🌐 [Frontend] Iniciando busca de localizações...');
  console.log('📤 URL completa:', `${API_BASE_URL}/jobs/locations`);
  console.log('📤 API_BASE_URL configurada:', API_BASE_URL);
  console.log('📤 VITE_API_BASE_URL da env:', import.meta.env.VITE_API_BASE_URL);
  
  try {
    console.log('⏳ Fazendo fetch para:', `${API_BASE_URL}/jobs/locations`);
    const response = await fetch(`${API_BASE_URL}/jobs/locations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📥 Status da resposta:', response.status, response.statusText);
    console.log('📥 Headers da resposta:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Erro na resposta:', errorData);
      throw new Error(errorData.error || `Erro ao buscar localizações: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📥 Dados recebidos:', data);
    console.log('📥 Tipo de dados:', typeof data);
    console.log('📥 Tem propriedade data?', 'data' in data);
    console.log('📥 É array?', Array.isArray(data));
    
    // Verificar se há aviso na resposta
    if (data.warning) {
      console.warn('⚠️ Aviso do servidor:', data.warning);
      if (data.error_details) {
        console.warn('⚠️ Detalhes do erro:', data.error_details);
      }
    }
    
    const locations = data.data || data || [];
    console.log(`✅ ${locations.length} localização(ões) recebida(s)`);
    
    if (locations.length > 0) {
      console.log('📋 Primeiras 3 localizações:', locations.slice(0, 3));
    } else if (data.warning) {
      console.warn('⚠️ Nenhuma localização retornada. Motivo:', data.warning);
    }
    
    return locations;
  } catch (error) {
    console.error('❌ Erro ao buscar localizações:', error);
    
    // Tratamento específico para diferentes tipos de erro
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      const errorMessage = `Não foi possível conectar ao backend em ${API_BASE_URL}. Verifique se o servidor está rodando na porta 3001.`;
      console.error('❌ Erro de conexão:', errorMessage);
      throw new Error(errorMessage);
    }
    
    throw error;
  }
}

/**
 * Cria uma nova vaga
 */
export async function createJob(jobData: any): Promise<Job> {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erro ao criar vaga: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Erro ao criar vaga:', error);
    throw error;
  }
}

/**
 * Busca todas as vagas
 */
export async function getAllJobs(): Promise<Job[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erro ao buscar vagas: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Erro ao buscar vagas:', error);
    throw error;
  }
}

/**
 * Busca uma vaga específica por ID
 */
export async function getJobById(id: string): Promise<Job> {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erro ao buscar vaga: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Erro ao buscar vaga:', error);
    throw error;
  }
}

