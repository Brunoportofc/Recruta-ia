const API_URL = 'http://localhost:3001';

interface CandidaturaData {
  candidatoId: string;
  vagaId: string;
  curriculoSnapshot: any;
  testeResultado: any;
}

export const candidaturaService = {
  async criarCandidatura(data: CandidaturaData) {
    try {
      console.log('📝 [CANDIDATURA SERVICE] Criando candidatura...', {
        candidatoId: data.candidatoId,
        vagaId: data.vagaId
      });

      const response = await fetch(`${API_URL}/candidatura`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar candidatura');
      }

      const result = await response.json();
      console.log('✅ [CANDIDATURA SERVICE] Candidatura criada:', result);
      
      return result;
    } catch (error) {
      console.error('❌ [CANDIDATURA SERVICE] Erro:', error);
      throw error;
    }
  }
};

