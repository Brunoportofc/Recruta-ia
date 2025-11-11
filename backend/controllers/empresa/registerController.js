import bcrypt from 'bcrypt';
import empresaRepository from '../../repositories/empresa/empresaRepository.js';

class RegisterController {
  /**
   * Registrar nova empresa no sistema
   */
  async register(req, res) {
    try {
      const {
        nomeEmpresa,
        cnpj,
        telefone,
        ramoAtuacao,
        tamanhoEmpresa,
        website,
        localizacao,
        descricao,
        email,
        senha
      } = req.body;

      console.log('📝 [REGISTER] Iniciando cadastro de nova empresa...');
      console.log('📧 [REGISTER] Email:', email);
      console.log('🏢 [REGISTER] Nome:', nomeEmpresa);

      // Validações básicas
      if (!nomeEmpresa || !email || !senha || !telefone || !ramoAtuacao || !tamanhoEmpresa || !localizacao) {
        console.log('❌ [REGISTER] Campos obrigatórios faltando');
        return res.status(400).json({
          success: false,
          error: 'Campos obrigatórios faltando'
        });
      }

      // Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log('❌ [REGISTER] Email inválido');
        return res.status(400).json({
          success: false,
          error: 'Email inválido'
        });
      }

      // Validar tamanho mínimo da senha
      if (senha.length < 6) {
        console.log('❌ [REGISTER] Senha muito curta');
        return res.status(400).json({
          success: false,
          error: 'A senha deve ter no mínimo 6 caracteres'
        });
      }

      // Verificar se o email já está cadastrado
      console.log('🔍 [REGISTER] Verificando se email já existe...');
      const empresaExistente = await empresaRepository.findByEmail(email);
      
      if (empresaExistente) {
        console.log('❌ [REGISTER] Email já cadastrado');
        return res.status(409).json({
          success: false,
          error: 'Este email já está cadastrado'
        });
      }

      // Se CNPJ foi informado, verificar se já existe
      if (cnpj) {
        console.log('🔍 [REGISTER] Verificando se CNPJ já existe...');
        const empresaComCNPJ = await empresaRepository.findByCNPJ(cnpj);
        
        if (empresaComCNPJ) {
          console.log('❌ [REGISTER] CNPJ já cadastrado');
          return res.status(409).json({
            success: false,
            error: 'Este CNPJ já está cadastrado'
          });
        }
      }

      // Hash da senha
      console.log('🔐 [REGISTER] Gerando hash da senha...');
      const saltRounds = 10;
      const senhaHash = await bcrypt.hash(senha, saltRounds);

      // Criar empresa no banco de dados
      console.log('💾 [REGISTER] Salvando empresa no banco de dados...');
      const novaEmpresa = await empresaRepository.create({
        nome: nomeEmpresa,
        email,
        senha: senhaHash,
        cnpj: cnpj || null,
        telefone,
        ramoAtuacao,
        tamanhoEmpresa,
        website: website || null,
        localizacao,
        descricao: descricao || null
      });

      console.log('✅ [REGISTER] Empresa cadastrada com sucesso!');
      console.log('🆔 [REGISTER] ID:', novaEmpresa.id);

      // Retornar sucesso (sem enviar a senha de volta)
      const empresaResponse = {
        id: novaEmpresa.id,
        nome: novaEmpresa.nome,
        email: novaEmpresa.email,
        cnpj: novaEmpresa.cnpj,
        telefone: novaEmpresa.telefone,
        ramoAtuacao: novaEmpresa.ramoAtuacao,
        tamanhoEmpresa: novaEmpresa.tamanhoEmpresa,
        website: novaEmpresa.website,
        localizacao: novaEmpresa.localizacao,
        descricao: novaEmpresa.descricao,
        createdAt: novaEmpresa.createdAt
      };

      res.status(201).json({
        success: true,
        empresa: empresaResponse,
        message: 'Empresa cadastrada com sucesso!'
      });

    } catch (error) {
      console.error('❌ [REGISTER] Erro ao cadastrar empresa:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao cadastrar empresa',
        details: error.message
      });
    }
  }
}

export default new RegisterController();

