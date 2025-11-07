import axios from 'axios';

class LinkedInService {
  constructor() {
    this.clientId = process.env.LINKEDIN_CLIENT_ID;
    this.clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    this.redirectUri = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:5173/auth/linkedin/callback';
    this.scope = 'openid profile email'; // Apenas scopes básicos do OpenID Connect
  }

  /**
   * Gera URL de autorização do LinkedIn
   */
  getAuthorizationUrl(state) {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      state: state,
      scope: this.scope
    });

    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  }

  /**
   * Troca o código de autorização por um access token
   */
  async getAccessToken(code) {
    console.log('🔵 [LINKEDIN] Iniciando troca de código por token...');
    console.log('🔵 [LINKEDIN] Client ID:', this.clientId);
    console.log('🔵 [LINKEDIN] Redirect URI:', this.redirectUri);
    
    try {
      const response = await axios.post(
        'https://www.linkedin.com/oauth/v2/accessToken',
        null,
        {
          params: {
            grant_type: 'authorization_code',
            code: code,
            client_id: this.clientId,
            client_secret: this.clientSecret,
            redirect_uri: this.redirectUri
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      console.log('✅ [LINKEDIN] Token obtido com sucesso');
      return response.data.access_token;
    } catch (error) {
      console.error('❌ [LINKEDIN] Erro ao obter access token');
      console.error('❌ [LINKEDIN] Status:', error.response?.status);
      console.error('❌ [LINKEDIN] Data:', JSON.stringify(error.response?.data, null, 2));
      console.error('❌ [LINKEDIN] Message:', error.message);
      throw new Error('Falha ao autenticar com LinkedIn: ' + (error.response?.data?.error_description || error.message));
    }
  }

  /**
   * Obtém informações do perfil do usuário
   */
  async getUserProfile(accessToken) {
    try {
      const response = await axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao obter perfil:', error.response?.data || error.message);
      throw new Error('Falha ao obter dados do perfil');
    }
  }

  /**
   * Obtém informações detalhadas do perfil (posições, educação, etc)
   */
  async getDetailedProfile(accessToken) {
    try {
      // Busca informações básicas
      const basicProfile = await this.getUserProfile(accessToken);

      // Busca posições (experiências profissionais)
      let positions = [];
      try {
        const positionsResponse = await axios.get(
          'https://api.linkedin.com/v2/positions',
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        positions = positionsResponse.data.elements || [];
      } catch (err) {
        console.warn('Não foi possível obter posições:', err.message);
      }

      // Busca educação
      let education = [];
      try {
        const educationResponse = await axios.get(
          'https://api.linkedin.com/v2/educations',
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        education = educationResponse.data.elements || [];
      } catch (err) {
        console.warn('Não foi possível obter educação:', err.message);
      }

      // Busca skills (habilidades)
      let skills = [];
      try {
        const skillsResponse = await axios.get(
          'https://api.linkedin.com/v2/skills',
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        skills = skillsResponse.data.elements || [];
      } catch (err) {
        console.warn('Não foi possível obter skills:', err.message);
      }

      return {
        basic: basicProfile,
        positions,
        education,
        skills
      };
    } catch (error) {
      console.error('Erro ao obter perfil detalhado:', error.response?.data || error.message);
      throw new Error('Falha ao obter dados detalhados do perfil');
    }
  }

  /**
   * Mapeia dados do LinkedIn para o formato do nosso currículo
   */
  mapLinkedInToResumeData(linkedInData) {
    const { basic, positions = [], education = [], skills = [] } = linkedInData;

    // Extrai nome e sobrenome
    const firstName = basic.given_name || '';
    const lastName = basic.family_name || '';
    const nomeCompleto = `${firstName} ${lastName}`.trim();

    // Mapeia experiências profissionais
    const experiencias = positions.map(position => ({
      cargo: position.title || '',
      empresa: position.companyName || '',
      dataInicio: position.startDate 
        ? `${position.startDate.year}-${String(position.startDate.month || 1).padStart(2, '0')}` 
        : '',
      dataFim: position.endDate 
        ? `${position.endDate.year}-${String(position.endDate.month || 12).padStart(2, '0')}` 
        : '',
      descricao: position.description || '',
      atual: !position.endDate
    }));

    // Mapeia formação acadêmica
    const formacoes = education.map(edu => ({
      curso: edu.degreeName || edu.fieldOfStudy || '',
      instituicao: edu.schoolName || '',
      dataInicio: edu.startDate 
        ? `${edu.startDate.year}-${String(edu.startDate.month || 1).padStart(2, '0')}` 
        : '',
      dataFim: edu.endDate 
        ? `${edu.endDate.year}-${String(edu.endDate.month || 12).padStart(2, '0')}` 
        : '',
      status: !edu.endDate ? 'cursando' : 'completo'
    }));

    // Mapeia habilidades
    const habilidades = skills.map(skill => skill.name || '').filter(s => s);

    // Extrai localização (se disponível)
    const cidade = '';
    const estado = '';
    // LinkedIn não fornece cidade/estado de forma estruturada no perfil básico

    return {
      // Informações Pessoais
      nomeCompleto,
      email: basic.email || '',
      telefone: '', // LinkedIn não fornece telefone via API
      cidade,
      estado,
      linkedinUrl: basic.sub ? `https://www.linkedin.com/in/${basic.sub}` : '',
      fotoPerfil: basic.picture || '',
      
      // Objetivo/Resumo
      objetivoProfissional: '', // LinkedIn não fornece resumo via API básica
      
      // Experiência Profissional
      experiencias,
      
      // Formação Acadêmica
      formacoes,
      
      // Habilidades
      habilidades,
      
      // Idiomas (não disponível via API)
      idiomas: [],
      
      // Certificações (não disponível via API básica)
      certificacoes: [],

      // Dados adicionais do LinkedIn
      linkedinId: basic.sub,
      linkedinData: basic
    };
  }
}

export const linkedinService = new LinkedInService();

