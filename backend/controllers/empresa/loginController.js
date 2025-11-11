import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import empresaRepository from '../../repositories/empresa/empresaRepository.js';

class LoginController {
  /**
   * Login da empresa com email e senha
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      console.log('🔐 [LOGIN] Tentativa de login...');
      console.log('📧 [LOGIN] Email:', email);

      // Validações básicas
      if (!email || !password) {
        console.log('❌ [LOGIN] Email ou senha não fornecidos');
        return res.status(400).json({
          success: false,
          error: 'Email e senha são obrigatórios'
        });
      }

      // Buscar empresa por email
      console.log('🔍 [LOGIN] Buscando empresa no banco...');
      const empresa = await empresaRepository.findByEmail(email);

      if (!empresa) {
        console.log('❌ [LOGIN] Empresa não encontrada');
        return res.status(401).json({
          success: false,
          error: 'Email ou senha inválidos'
        });
      }

      // Verificar senha
      console.log('🔐 [LOGIN] Verificando senha...');
      const senhaValida = await bcrypt.compare(password, empresa.senha);

      if (!senhaValida) {
        console.log('❌ [LOGIN] Senha incorreta');
        return res.status(401).json({
          success: false,
          error: 'Email ou senha inválidos'
        });
      }

      // Gerar token JWT
      console.log('🎟️  [LOGIN] Gerando token JWT...');
      const token = jwt.sign(
        {
          empresaId: empresa.id,
          email: empresa.email
        },
        process.env.JWT_SECRET || 'secret-key-change-in-production',
        {
          expiresIn: '7d' // Token válido por 7 dias
        }
      );

      console.log('✅ [LOGIN] Login realizado com sucesso!');
      console.log('🆔 [LOGIN] ID da empresa:', empresa.id);

      // Retornar dados da empresa (sem a senha) e token
      const empresaResponse = {
        id: empresa.id,
        nome: empresa.nome,
        email: empresa.email,
        cnpj: empresa.cnpj,
        telefone: empresa.telefone,
        ramoAtuacao: empresa.ramoAtuacao,
        tamanhoEmpresa: empresa.tamanhoEmpresa,
        website: empresa.website,
        localizacao: empresa.localizacao,
        descricao: empresa.descricao,
        createdAt: empresa.createdAt
      };

      res.json({
        success: true,
        empresa: empresaResponse,
        token,
        message: 'Login realizado com sucesso!'
      });

    } catch (error) {
      console.error('❌ [LOGIN] Erro ao fazer login:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao fazer login',
        details: error.message
      });
    }
  }

  /**
   * Verificar se o token é válido
   */
  async verifyToken(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Token não fornecido'
        });
      }

      // Verificar token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'secret-key-change-in-production'
      );

      // Buscar empresa
      const empresa = await empresaRepository.findById(decoded.empresaId);

      if (!empresa) {
        return res.status(401).json({
          success: false,
          error: 'Empresa não encontrada'
        });
      }

      // Retornar dados da empresa
      const empresaResponse = {
        id: empresa.id,
        nome: empresa.nome,
        email: empresa.email,
        cnpj: empresa.cnpj,
        telefone: empresa.telefone,
        ramoAtuacao: empresa.ramoAtuacao,
        tamanhoEmpresa: empresa.tamanhoEmpresa,
        website: empresa.website,
        localizacao: empresa.localizacao,
        descricao: empresa.descricao,
        createdAt: empresa.createdAt
      };

      res.json({
        success: true,
        empresa: empresaResponse
      });

    } catch (error) {
      console.error('❌ [VERIFY TOKEN] Erro:', error);
      res.status(401).json({
        success: false,
        error: 'Token inválido ou expirado'
      });
    }
  }
}

export default new LoginController();

