import bcrypt from 'bcrypt';
import empresaRepository from '../../repositories/empresa/empresaRepository.js';

class UpdateController {
  /**
   * Atualizar dados da empresa
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const {
        nome,
        email,
        cnpj,
        telefone,
        ramoAtuacao,
        tamanhoEmpresa,
        website,
        localizacao,
        descricao,
        senhaAtual,
        senhaNova
      } = req.body;

      console.log('📝 [UPDATE] Atualizando empresa:', id);

      // Buscar empresa existente
      const empresaExistente = await empresaRepository.findById(id);

      if (!empresaExistente) {
        console.log('❌ [UPDATE] Empresa não encontrada');
        return res.status(404).json({
          success: false,
          error: 'Empresa não encontrada'
        });
      }

      // Preparar dados para atualização
      const dadosAtualizacao = {};

      // Campos que podem ser atualizados
      if (nome !== undefined) dadosAtualizacao.nome = nome;
      if (telefone !== undefined) dadosAtualizacao.telefone = telefone;
      if (ramoAtuacao !== undefined) dadosAtualizacao.ramoAtuacao = ramoAtuacao;
      if (tamanhoEmpresa !== undefined) dadosAtualizacao.tamanhoEmpresa = tamanhoEmpresa;
      if (website !== undefined) dadosAtualizacao.website = website || null;
      if (localizacao !== undefined) dadosAtualizacao.localizacao = localizacao;
      if (descricao !== undefined) dadosAtualizacao.descricao = descricao || null;

      // Email - verificar se não está em uso por outra empresa
      if (email !== undefined && email !== empresaExistente.email) {
        const empresaComEmail = await empresaRepository.findByEmail(email);
        if (empresaComEmail && empresaComEmail.id !== id) {
          console.log('❌ [UPDATE] Email já está em uso');
          return res.status(409).json({
            success: false,
            error: 'Este email já está cadastrado'
          });
        }
        dadosAtualizacao.email = email;
      }

      // CNPJ - verificar se não está em uso por outra empresa
      if (cnpj !== undefined && cnpj !== empresaExistente.cnpj) {
        if (cnpj) {
          const empresaComCNPJ = await empresaRepository.findByCNPJ(cnpj);
          if (empresaComCNPJ && empresaComCNPJ.id !== id) {
            console.log('❌ [UPDATE] CNPJ já está em uso');
            return res.status(409).json({
              success: false,
              error: 'Este CNPJ já está cadastrado'
            });
          }
        }
        dadosAtualizacao.cnpj = cnpj || null;
      }

      // Atualizar senha (se fornecida)
      if (senhaNova) {
        // Verificar senha atual
        if (!senhaAtual) {
          console.log('❌ [UPDATE] Senha atual não fornecida');
          return res.status(400).json({
            success: false,
            error: 'Forneça a senha atual para alterá-la'
          });
        }

        const senhaValida = await bcrypt.compare(senhaAtual, empresaExistente.senha);
        if (!senhaValida) {
          console.log('❌ [UPDATE] Senha atual incorreta');
          return res.status(401).json({
            success: false,
            error: 'Senha atual incorreta'
          });
        }

        // Validar nova senha
        if (senhaNova.length < 6) {
          console.log('❌ [UPDATE] Nova senha muito curta');
          return res.status(400).json({
            success: false,
            error: 'A nova senha deve ter no mínimo 6 caracteres'
          });
        }

        // Hash da nova senha
        console.log('🔐 [UPDATE] Gerando hash da nova senha...');
        const saltRounds = 10;
        dadosAtualizacao.senha = await bcrypt.hash(senhaNova, saltRounds);
      }

      // Atualizar no banco de dados
      console.log('💾 [UPDATE] Salvando alterações...');
      const empresaAtualizada = await empresaRepository.update(id, dadosAtualizacao);

      console.log('✅ [UPDATE] Empresa atualizada com sucesso!');

      // Retornar dados atualizados (sem a senha)
      const empresaResponse = {
        id: empresaAtualizada.id,
        nome: empresaAtualizada.nome,
        email: empresaAtualizada.email,
        cnpj: empresaAtualizada.cnpj,
        telefone: empresaAtualizada.telefone,
        ramoAtuacao: empresaAtualizada.ramoAtuacao,
        tamanhoEmpresa: empresaAtualizada.tamanhoEmpresa,
        website: empresaAtualizada.website,
        localizacao: empresaAtualizada.localizacao,
        descricao: empresaAtualizada.descricao,
        createdAt: empresaAtualizada.createdAt,
        updatedAt: empresaAtualizada.updatedAt
      };

      res.json({
        success: true,
        empresa: empresaResponse,
        message: 'Dados atualizados com sucesso!'
      });

    } catch (error) {
      console.error('❌ [UPDATE] Erro ao atualizar empresa:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao atualizar dados da empresa',
        details: error.message
      });
    }
  }
}

export default new UpdateController();

