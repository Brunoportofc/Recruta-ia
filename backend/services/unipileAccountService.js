import axios from 'axios';

class UnipileAccountService {
  constructor() {
    this.apiUrl = process.env.UNIPILE_API_URL || 'https://api1.unipile.com:13111/api/v1';
    this.apiKey = process.env.UNIPILE_API_KEY;
    this.redirectUri = process.env.UNIPILE_REDIRECT_URI || 'http://localhost:8080/settings/linkedin/callback';
  }

  /**
   * PASSO 1: Gera URL de autorização para conectar conta LinkedIn
   * A empresa será redirecionada para esta URL para autorizar
   */
  async getLinkedInAuthUrl() {
    try {
      console.log('📤 [UNIPILE ACCOUNT] Gerando URL de autorização...');
      console.log('🔧 [UNIPILE ACCOUNT] API URL:', this.apiUrl);
      console.log('🔧 [UNIPILE ACCOUNT] Redirect URI:', this.redirectUri);

      const payload = {
        provider: 'LINKEDIN',
        redirect_uri: this.redirectUri
      };

      console.log('📦 [UNIPILE ACCOUNT] Payload:', JSON.stringify(payload, null, 2));

      const response = await axios.post(
        `${this.apiUrl}/accounts/hosted`,
        payload,
        {
          headers: {
            'accept': 'application/json',
            'X-API-KEY': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ [UNIPILE ACCOUNT] URL de autorização gerada');
      console.log('🔗 [UNIPILE ACCOUNT] Connect Token:', response.data.connect_token);

      return {
        authUrl: response.data.url,
        connectToken: response.data.connect_token
      };
    } catch (error) {
      console.error('❌ [UNIPILE ACCOUNT] Erro completo:', error.response?.data || error.message);
      console.error('❌ [UNIPILE ACCOUNT] Status:', error.response?.status);
      console.error('❌ [UNIPILE ACCOUNT] Headers enviados:', error.config?.headers);
      throw new Error(
        `Falha ao iniciar conexão com LinkedIn: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * PASSO 2: Finaliza a conexão após o callback do LinkedIn
   * Troca o código de autorização por um account_id permanente
   */
  async finalizeLinkedInConnection(code, connectToken) {
    try {
      console.log('📤 [UNIPILE ACCOUNT] Finalizando conexão...');
      console.log('🔑 [UNIPILE ACCOUNT] Code:', code);
      console.log('🎫 [UNIPILE ACCOUNT] Connect Token:', connectToken);

      const response = await axios.post(
        `${this.apiUrl}/accounts/hosted/finalize`,
        {
          connect_token: connectToken,
          code: code
        },
        {
          headers: {
            'accept': 'application/json',
            'X-API-KEY': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ [UNIPILE ACCOUNT] Conta conectada com sucesso!');
      console.log('🆔 [UNIPILE ACCOUNT] Account ID:', response.data.account_id);
      console.log('📊 [UNIPILE ACCOUNT] Status:', response.data.status);

      return {
        accountId: response.data.account_id,
        provider: response.data.provider,
        status: response.data.status,
        username: response.data.username || null
      };
    } catch (error) {
      console.error('❌ [UNIPILE ACCOUNT] Erro ao finalizar conexão:', error.response?.data || error.message);
      throw new Error(
        `Falha ao conectar conta LinkedIn: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * PASSO 3: Desconectar conta LinkedIn
   * Remove a conexão do Unipile
   */
  async disconnectLinkedInAccount(accountId) {
    try {
      console.log(`🗑️ [UNIPILE ACCOUNT] Desconectando conta: ${accountId}`);

      await axios.delete(
        `${this.apiUrl}/accounts/${accountId}`,
        {
          headers: {
            'accept': 'application/json',
            'X-API-KEY': this.apiKey
          }
        }
      );

      console.log('✅ [UNIPILE ACCOUNT] Conta desconectada com sucesso');
      return true;
    } catch (error) {
      console.error('❌ [UNIPILE ACCOUNT] Erro ao desconectar:', error.response?.data || error.message);
      throw new Error(
        `Falha ao desconectar conta LinkedIn: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Busca informações da conta conectada
   */
  async getAccountInfo(accountId) {
    try {
      console.log(`📥 [UNIPILE ACCOUNT] Buscando informações da conta: ${accountId}`);

      const response = await axios.get(
        `${this.apiUrl}/accounts/${accountId}`,
        {
          headers: {
            'accept': 'application/json',
            'X-API-KEY': this.apiKey
          }
        }
      );

      console.log('✅ [UNIPILE ACCOUNT] Informações obtidas');
      return response.data;
    } catch (error) {
      console.error('❌ [UNIPILE ACCOUNT] Erro ao buscar informações:', error.response?.data || error.message);
      throw new Error(
        `Falha ao buscar informações da conta: ${error.response?.data?.message || error.message}`
      );
    }
  }
}

export const unipileAccountService = new UnipileAccountService();

