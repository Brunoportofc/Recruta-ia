import axios from 'axios';
import https from 'https';

class UnipileService {
  constructor() {
    this.apiKey = 'FtNqtA6G.4X2HX8cgz30wI4VwebBjxInYM3SYWaSjUj0MSFZp4Qo='; //process.env.UNIPILE_API_KEY;
    // DSN fornecido: api21.unipile.com:15161
    // IMPORTANTE: Configure UNIPILE_DSN no .env ou atualize aqui
    const dsnHost = process.env.UNIPILE_DSN || 'api21.unipile.com:15161';
    // Garantir que tem protocolo HTTPS
    this.dsn = dsnHost.startsWith('http') ? dsnHost : `https://${dsnHost}`;
    
    // Account ID - Pode ser diferente do DSN!
    // O account_id deve ser um UniqueId (string), não o DSN
    // Encontre o account_id correto no painel da Unipile ou na documentação da API
    this.accountId = process.env.UNIPILE_ACCOUNT_ID || 'tp0BGykARX27IdG_yTegOA'; // Valor anterior, pode ser diferente
  }

  /**
   * Tenta buscar o account_id listando contas disponíveis
   * Pode ajudar se você não souber o account_id correto
   */
  async getAccounts() {
    try {
      console.log('🔍 Tentando buscar lista de contas...');
      const endpoint = `${this.dsn}/api/v1/accounts`;
      
      const response = await axios.get(endpoint, {
        headers: {
          'Accept': 'application/json',
          'X-API-KEY': this.apiKey,
        },
        timeout: 10000,
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      });
      
      console.log('✅ Contas encontradas:', response.data);
      return response.data;
    } catch (error) {
      console.log('⚠️ Não foi possível buscar contas:', error.message);
      return null;
    }
  }

  /**
   * Obtém a lista de localizações disponíveis para vagas do LinkedIn
   * Usa o endpoint: GET /api/v1/linkedin/search/parameters
   * Documentação: https://developer.unipile.com/docs/linkedin-search
   * 
   * @param {string} keywords - Palavras-chave para buscar (opcional, ex: "São Paulo")
   * @param {number} limit - Limite de resultados (1-100, default: 100)
   * @returns {Promise<Array>} Lista de localizações com id e name
   */
  async getLocations(keywords = '', limit = 100) {
    console.log('=== INICIANDO BUSCA DE LOCALIZAÇÕES UNIPILE ===');
    console.log('DSN:', this.dsn);
    console.log('API Key (primeiros 10 chars):', this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'NÃO CONFIGURADA');
    
    if (!this.apiKey) {
      throw new Error('UNIPILE_API_KEY não configurada. Configure a variável de ambiente no arquivo .env');
    }

    if (!this.accountId) {
      throw new Error('UNIPILE_ACCOUNT_ID não configurado. O account_id é obrigatório para buscar localizações.');
    }

    // Endpoint correto conforme documentação
    const endpoint = `${this.dsn}/api/v1/linkedin/search/parameters`;
    console.log('📋 Endpoint:', endpoint);
    
    // Parâmetros da requisição conforme documentação
    // account_id é OBRIGATÓRIO conforme erro da API (400 Bad Request)
    const params = {
      account_id: this.accountId, // OBRIGATÓRIO: Account ID da conta Unipile (UniqueId)
      type: 'LOCATION', // Tipo obrigatório: LOCATION
      limit: Math.min(Math.max(limit, 1), 100), // Limitar entre 1 e 100
    };
    
    // Adicionar keywords se fornecidas (não aplicável para EMPLOYMENT_TYPE, mas LOCATION aceita)
    if (keywords && keywords.trim()) {
      params.keywords = keywords.trim();
      console.log('🔍 Buscando localizações com keywords:', keywords);
    }
    
    console.log('📤 Query params:', params);
    console.log('📋 Account ID usado:', this.accountId);

    try {
      // Configuração da requisição conforme documentação
      const config = {
        params: params,
        headers: {
          'Accept': 'application/json',
          'X-API-KEY': this.apiKey, // Autenticação via header X-API-KEY (não Bearer!)
        },
        timeout: 15000, // 15 segundos de timeout
        // Ignorar erros de certificado SSL se necessário (para desenvolvimento)
        httpsAgent: new https.Agent({ 
          rejectUnauthorized: false 
        }),
      };

      console.log('📤 Headers:', {
        'X-API-KEY': `${this.apiKey.substring(0, 20)}...`,
        'Accept': config.headers['Accept']
      });

      console.log('⏳ Fazendo requisição...');
      const response = await axios.get(endpoint, config);

      console.log('✅ Resposta recebida!');
      console.log('📥 Status:', response.status, response.statusText);
      
      // Log da resposta
      if (typeof response.data === 'object') {
        const responseStr = JSON.stringify(response.data, null, 2);
        console.log('📥 Resposta (primeiros 2000 chars):', responseStr.substring(0, 2000));
        if (responseStr.length > 2000) {
          console.log('📥 ... (resposta truncada)');
        }
      } else {
        console.log('📥 Resposta:', String(response.data));
      }

      // Processar a resposta
      let locations = null;
      
      console.log('🔍 Analisando formato da resposta...');
      console.log('📋 Chaves disponíveis:', Object.keys(response.data || {}));
      
      // A resposta pode ser um array direto ou um objeto com propriedades
      if (Array.isArray(response.data)) {
        console.log('✓ Formato: Array direto');
        locations = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        console.log('✓ Formato: { data: [...] }');
        locations = response.data.data;
      } else if (response.data?.results && Array.isArray(response.data.results)) {
        console.log('✓ Formato: { results: [...] }');
        locations = response.data.results;
      } else if (response.data?.items && Array.isArray(response.data.items)) {
        console.log('✓ Formato: { items: [...] }');
        locations = response.data.items;
      } else if (response.data?.locations && Array.isArray(response.data.locations)) {
        console.log('✓ Formato: { locations: [...] }');
        locations = response.data.locations;
      } else {
        console.log('⚠️ Formato não reconhecido. Resposta completa:');
        console.log(JSON.stringify(response.data, null, 2));
        
        // Se for um objeto com uma única propriedade que é array, tentar usar
        const keys = Object.keys(response.data || {});
        if (keys.length === 1 && Array.isArray(response.data[keys[0]])) {
          console.log(`✓ Formato: { ${keys[0]}: [...] }`);
          locations = response.data[keys[0]];
        }
      }

      if (locations && locations.length > 0) {
        console.log(`\n✅ SUCESSO! ${locations.length} localização(ões) encontrada(s)`);
        console.log('📋 Primeiras 5 localizações:');
        locations.slice(0, 5).forEach((loc, idx) => {
          console.log(`  ${idx + 1}.`, JSON.stringify(loc, null, 2));
        });
        if (locations.length > 5) {
          console.log(`  ... e mais ${locations.length - 5} localização(ões)`);
        }
        console.log('\n=== BUSCA CONCLUÍDA COM SUCESSO ===\n');
        return locations;
      } else {
        console.log('⚠️ Nenhuma localização encontrada na resposta');
        console.log('📋 Estrutura completa da resposta:', JSON.stringify(response.data, null, 2));
        return [];
      }
    } catch (error) {
      console.error('❌ Erro ao buscar localizações:');
      console.error('  Tipo:', error.name);
      console.error('  Mensagem:', error.message);
      console.error('  Code:', error.code);
      
      if (error.response) {
        console.error('  Status:', error.response.status, error.response.statusText);
        console.error('  Headers:', error.response.headers);
        console.error('  Dados da resposta:', JSON.stringify(error.response.data, null, 2));
        
        if (error.response.status === 401) {
          throw new Error('Credenciais inválidas. Verifique se a API Key está correta.');
        } else if (error.response.status === 404) {
          throw new Error('Endpoint não encontrado. Verifique se o DSN está correto.');
        }
      } else if (error.request) {
        console.error('  Sem resposta do servidor');
        console.error('  Verifique se o DSN está correto:', this.dsn);
        throw new Error('Não foi possível conectar ao servidor da Unipile. Verifique o DSN.');
      }
      
      throw error;
    }
  }

  /**
   * Busca uma localização específica por ID
   * @param {string} locationId - ID da localização
   * @returns {Promise<Object>} Dados da localização
   */
  async getLocationById(locationId) {
    console.log(`🔍 Buscando localização por ID: ${locationId}`);
    try {
      const locations = await this.getLocations();
      const location = locations.find(loc => 
        loc.id === locationId || 
        loc.location_id === locationId ||
        loc.urn === locationId ||
        String(loc.id) === String(locationId)
      );
      if (location) {
        console.log('✅ Localização encontrada:', location);
      } else {
        console.log('⚠️ Localização não encontrada');
      }
      return location || null;
    } catch (error) {
      console.error('❌ Erro ao buscar localização por ID:', error);
      return null;
    }
  }
}

export default new UnipileService();
