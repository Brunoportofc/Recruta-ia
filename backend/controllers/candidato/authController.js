import jwt from 'jsonwebtoken';
import { linkedinService } from '../../services/linkedinService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-super-seguro-aqui';
const JWT_EXPIRES_IN = '7d';

class AuthController {
  /**
   * Inicia o fluxo de autenticação com LinkedIn
   */
  async loginWithLinkedIn(req, res) {
    try {
      // Gera um state token para segurança (previne CSRF)
      const state = jwt.sign(
        { timestamp: Date.now() },
        JWT_SECRET,
        { expiresIn: '10m' }
      );

      // Gera URL de autorização do LinkedIn
      const authUrl = linkedinService.getAuthorizationUrl(state);

      res.json({
        success: true,
        authUrl,
        state
      });
    } catch (error) {
      console.error('Erro ao iniciar login com LinkedIn:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao iniciar autenticação com LinkedIn'
      });
    }
  }

  /**
   * Callback do LinkedIn após autorização
   */
  async linkedinCallback(req, res) {
    console.log('🔵 [CALLBACK] Iniciando processamento do callback do LinkedIn');
    
    try {
      const { code, state } = req.query;
      console.log('🔵 [CALLBACK] Code recebido:', code ? 'SIM ✓' : 'NÃO ✗');
      console.log('🔵 [CALLBACK] State recebido:', state ? 'SIM ✓' : 'NÃO ✗');

      if (!code) {
        console.log('❌ [CALLBACK] Erro: Código não fornecido');
        return res.status(400).json({
          success: false,
          message: 'Código de autorização não fornecido'
        });
      }

      // Verifica o state token (segurança)
      console.log('🔵 [CALLBACK] Verificando state token...');
      try {
        jwt.verify(state, JWT_SECRET);
        console.log('✅ [CALLBACK] State token válido');
      } catch (err) {
        console.log('❌ [CALLBACK] State token inválido:', err.message);
        return res.status(401).json({
          success: false,
          message: 'State token inválido'
        });
      }

      // Troca código por access token
      console.log('🔵 [CALLBACK] Trocando código por access token...');
      const accessToken = await linkedinService.getAccessToken(code);
      console.log('✅ [CALLBACK] Access token obtido:', accessToken ? accessToken.substring(0, 20) + '...' : 'FALHOU');

      // Obtém dados detalhados do perfil
      console.log('🔵 [CALLBACK] Buscando dados do perfil...');
      const linkedInProfile = await linkedinService.getDetailedProfile(accessToken);
      console.log('✅ [CALLBACK] Perfil obtido:', JSON.stringify(linkedInProfile, null, 2));

      // Mapeia dados do LinkedIn para formato do currículo
      console.log('🔵 [CALLBACK] Mapeando dados para formato do currículo...');
      const resumeData = linkedinService.mapLinkedInToResumeData(linkedInProfile);
      console.log('✅ [CALLBACK] Dados mapeados:', JSON.stringify(resumeData, null, 2));

      // Gera JWT token para nossa aplicação
      console.log('🔵 [CALLBACK] Gerando JWT token...');
      const authToken = jwt.sign(
        {
          userId: resumeData.linkedinId,
          email: resumeData.email,
          name: resumeData.nomeCompleto,
          linkedinId: resumeData.linkedinId
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      console.log('✅ [CALLBACK] JWT token gerado');

      // Retorna dados do usuário e token
      console.log('🎉 [CALLBACK] Sucesso! Retornando dados ao frontend');
      res.json({
        success: true,
        token: authToken,
        user: {
          id: resumeData.linkedinId,
          name: resumeData.nomeCompleto,
          email: resumeData.email,
          linkedinId: resumeData.linkedinId,
          avatar: resumeData.fotoPerfil
        },
        resumeData // Dados completos para preencher o formulário
      });
    } catch (error) {
      console.error('❌❌❌ [CALLBACK] ERRO CRÍTICO:', error);
      console.error('❌ [CALLBACK] Stack trace:', error.stack);
      console.error('❌ [CALLBACK] Mensagem:', error.message);
      console.error('❌ [CALLBACK] Response data:', error.response?.data);
      
      res.status(500).json({
        success: false,
        message: 'Erro ao processar autenticação com LinkedIn',
        error: error.message,
        details: error.response?.data
      });
    }
  }

  /**
   * Login com email/senha (método existente/demo)
   */
  async loginWithEmail(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios'
        });
      }

      // DEMO: Aceita qualquer email/senha
      // Em produção, validar contra banco de dados
      const userId = 'user_' + Date.now();
      
      const authToken = jwt.sign(
        {
          userId,
          email,
          name: email.split('@')[0]
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.json({
        success: true,
        token: authToken,
        user: {
          id: userId,
          name: email.split('@')[0],
          email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
        }
      });
    } catch (error) {
      console.error('Erro no login com email:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao fazer login'
      });
    }
  }

  /**
   * Verifica token JWT
   */
  async verifyToken(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Token não fornecido'
        });
      }

      const decoded = jwt.verify(token, JWT_SECRET);

      res.json({
        success: true,
        user: {
          id: decoded.userId,
          email: decoded.email,
          name: decoded.name,
          linkedinId: decoded.linkedinId
        }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
    }
  }

  /**
   * Logout (invalida token no lado do cliente)
   */
  async logout(req, res) {
    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  }
}

export const authController = new AuthController();

