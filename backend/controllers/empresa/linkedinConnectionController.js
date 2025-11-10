import { unipileAccountService } from '../../services/unipileAccountService.js';
import empresaRepository from '../../repositories/empresa/empresaRepository.js';

// Armazena temporariamente os connect tokens (em produção, use Redis ou cache)
const connectTokens = new Map();

class LinkedInConnectionController {
  /**
   * ROTA: GET /empresa/linkedin/connect
   * Inicia o processo de conexão com LinkedIn
   */
  async initiateConnection(req, res) {
    try {
      // Por enquanto, vamos criar uma empresa temporária para teste
      // TODO: Pegar empresaId do token JWT quando tiver autenticação de empresa
      const empresaId = req.query.empresaId || 'temp-empresa-id';
      
      console.log('🔵 [CONTROLLER] Iniciando conexão LinkedIn para empresa:', empresaId);
      
      // Gera URL de autorização
      const { authUrl, connectToken } = await unipileAccountService.getLinkedInAuthUrl();
      
      // Armazena connectToken temporariamente vinculado ao empresaId
      connectTokens.set(connectToken, {
        empresaId: empresaId,
        timestamp: Date.now()
      });
      
      // Remove tokens antigos (mais de 10 minutos)
      this.cleanupOldTokens();
      
      console.log('✅ [CONTROLLER] URL de autorização gerada');
      
      res.json({
        success: true,
        authUrl: authUrl,
        message: 'Redirecione o usuário para authUrl'
      });
    } catch (error) {
      console.error('❌ [CONTROLLER] Erro ao iniciar conexão:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao iniciar conexão com LinkedIn',
        details: error.message
      });
    }
  }

  /**
   * ROTA: GET /empresa/linkedin/callback?code=...&connect_token=...
   * Callback após autorização no LinkedIn
   */
  async handleCallback(req, res) {
    try {
      const { code, connect_token } = req.query;
      
      console.log('🔵 [CONTROLLER] Recebendo callback do LinkedIn');
      console.log('🔑 [CONTROLLER] Code:', code ? 'presente' : 'ausente');
      console.log('🎫 [CONTROLLER] Connect Token:', connect_token ? 'presente' : 'ausente');
      
      if (!code || !connect_token) {
        throw new Error('Código ou connect_token não fornecido');
      }
      
      // Busca dados temporários do token
      const tokenData = connectTokens.get(connect_token);
      
      if (!tokenData) {
        throw new Error('Connect token inválido ou expirado');
      }
      
      const { empresaId } = tokenData;
      
      console.log('🏢 [CONTROLLER] Empresa ID:', empresaId);
      
      // Finaliza conexão no Unipile
      const { accountId, username, status } = await unipileAccountService.finalizeLinkedInConnection(
        code,
        connect_token
      );
      
      console.log('✅ [CONTROLLER] Conta conectada - Account ID:', accountId);
      
      // Busca ou cria empresa
      let empresa = await empresaRepository.findById(empresaId).catch(() => null);
      
      if (!empresa) {
        // Cria empresa temporária para teste
        empresa = await empresaRepository.create({
          id: empresaId,
          nome: 'Empresa Teste',
          email: `empresa-${empresaId}@teste.com`
        });
        console.log('📝 [CONTROLLER] Empresa criada para teste');
      }
      
      // Atualiza empresa com dados do Unipile
      await empresaRepository.update(empresaId, {
        unipileAccountId: accountId,
        unipileConnected: true,
        unipileConnectedAt: new Date()
      });
      
      console.log('✅ [CONTROLLER] Empresa atualizada com account_id');
      
      // Remove token usado
      connectTokens.delete(connect_token);
      
      res.json({
        success: true,
        message: 'LinkedIn conectado com sucesso!',
        data: {
          accountId: accountId,
          username: username,
          status: status
        }
      });
    } catch (error) {
      console.error('❌ [CONTROLLER] Erro no callback:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao conectar LinkedIn',
        details: error.message
      });
    }
  }

  /**
   * ROTA: POST /empresa/linkedin/disconnect
   * Desconecta conta LinkedIn
   */
  async disconnect(req, res) {
    try {
      // TODO: Pegar empresaId do token JWT quando tiver autenticação
      const empresaId = req.query.empresaId || req.body.empresaId;
      
      if (!empresaId) {
        return res.status(400).json({
          success: false,
          error: 'ID da empresa não fornecido'
        });
      }
      
      console.log('🔵 [CONTROLLER] Desconectando LinkedIn da empresa:', empresaId);
      
      // Busca empresa
      const empresa = await empresaRepository.findById(empresaId);
      
      if (!empresa.unipileAccountId) {
        return res.status(400).json({
          success: false,
          error: 'Nenhuma conta LinkedIn conectada'
        });
      }
      
      // Desconecta no Unipile
      await unipileAccountService.disconnectLinkedInAccount(empresa.unipileAccountId);
      
      // Atualiza banco
      await empresaRepository.update(empresaId, {
        unipileAccountId: null,
        unipileConnected: false,
        unipileConnectedAt: null
      });
      
      console.log('✅ [CONTROLLER] LinkedIn desconectado com sucesso');
      
      res.json({
        success: true,
        message: 'LinkedIn desconectado com sucesso!'
      });
    } catch (error) {
      console.error('❌ [CONTROLLER] Erro ao desconectar:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao desconectar LinkedIn',
        details: error.message
      });
    }
  }

  /**
   * ROTA: GET /empresa/linkedin/status
   * Verifica status da conexão LinkedIn
   */
  async getConnectionStatus(req, res) {
    try {
      const empresaId = req.query.empresaId;
      
      if (!empresaId) {
        return res.status(400).json({
          success: false,
          error: 'ID da empresa não fornecido'
        });
      }
      
      const empresa = await empresaRepository.findById(empresaId);
      
      res.json({
        success: true,
        connected: empresa.unipileConnected,
        accountId: empresa.unipileAccountId,
        connectedAt: empresa.unipileConnectedAt
      });
    } catch (error) {
      console.error('❌ [CONTROLLER] Erro ao verificar status:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao verificar status da conexão',
        details: error.message
      });
    }
  }

  /**
   * Limpa tokens antigos (mais de 10 minutos)
   */
  cleanupOldTokens() {
    const now = Date.now();
    const expirationTime = 10 * 60 * 1000; // 10 minutos
    
    for (const [token, data] of connectTokens.entries()) {
      if (now - data.timestamp > expirationTime) {
        connectTokens.delete(token);
      }
    }
  }
}

export default new LinkedInConnectionController();

