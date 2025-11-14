import prisma from '../../lib/prisma.js';

class CandidaturaController {
  async createCandidatura(req, res) {
    try {
      const { 
        candidatoId, 
        vagaId, 
        curriculoSnapshot, 
        testeResultado 
      } = req.body;

      console.log('📝 [CANDIDATURA] Criando nova candidatura...');
      console.log('👤 Candidato ID:', candidatoId);
      console.log('💼 Vaga ID:', vagaId);

      // Validações
      if (!candidatoId) {
        return res.status(400).json({ error: 'candidatoId é obrigatório' });
      }

      if (!vagaId) {
        return res.status(400).json({ error: 'vagaId é obrigatório' });
      }

      if (!curriculoSnapshot) {
        return res.status(400).json({ error: 'curriculoSnapshot é obrigatório' });
      }

      // Verifica se candidato existe
      const candidato = await prisma.candidato.findUnique({
        where: { id: candidatoId }
      });

      if (!candidato) {
        return res.status(404).json({ error: 'Candidato não encontrado' });
      }

      // Verifica se vaga existe
      const vaga = await prisma.vaga.findUnique({
        where: { id: vagaId }
      });

      if (!vaga) {
        return res.status(404).json({ error: 'Vaga não encontrada' });
      }

      // Verifica se candidatura já existe
      const candidaturaExistente = await prisma.candidatura.findUnique({
        where: {
          candidatoId_vagaId: {
            candidatoId,
            vagaId
          }
        }
      });

      if (candidaturaExistente) {
        console.log('⚠️  [CANDIDATURA] Candidatura já existe, atualizando...');
        
        // Atualiza candidatura existente
        const candidaturaAtualizada = await prisma.candidatura.update({
          where: { id: candidaturaExistente.id },
          data: {
            curriculoSnapshot,
            testeResultado: testeResultado || candidaturaExistente.testeResultado,
            status: testeResultado ? 'analise_completa' : 'aguardando_testes'
          }
        });

        return res.json({
          success: true,
          message: 'Candidatura atualizada com sucesso',
          data: candidaturaAtualizada
        });
      }

      // Cria nova candidatura
      const candidatura = await prisma.candidatura.create({
        data: {
          candidatoId,
          vagaId,
          curriculoSnapshot,
          testeResultado: testeResultado || null,
          status: testeResultado ? 'analise_completa' : 'aguardando_testes',
          origemAplicacao: 'plataforma'
        }
      });

      console.log('✅ [CANDIDATURA] Candidatura criada com sucesso:', candidatura.id);

      res.status(201).json({
        success: true,
        message: 'Candidatura criada com sucesso',
        data: candidatura
      });

    } catch (error) {
      console.error('❌ [CANDIDATURA] Erro ao criar candidatura:', error);
      res.status(500).json({
        error: 'Erro ao criar candidatura',
        details: error.message
      });
    }
  }

  async getCandidaturasByVaga(req, res) {
    try {
      const { vagaId } = req.params;

      const candidaturas = await prisma.candidatura.findMany({
        where: { vagaId },
        include: {
          candidato: {
            select: {
              id: true,
              nomeCompleto: true,
              email: true,
              telefone: true,
              cidade: true,
              estado: true,
              linkedinUrl: true,
              fotoPerfilUrl: true
            }
          }
        },
        orderBy: {
          dataCandidatura: 'desc'
        }
      });

      res.json({
        success: true,
        data: candidaturas
      });

    } catch (error) {
      console.error('❌ [CANDIDATURA] Erro ao buscar candidaturas:', error);
      res.status(500).json({
        error: 'Erro ao buscar candidaturas',
        details: error.message
      });
    }
  }

  async getCandidaturaById(req, res) {
    try {
      const { id } = req.params;

      const candidatura = await prisma.candidatura.findUnique({
        where: { id },
        include: {
          candidato: true,
          vaga: true
        }
      });

      if (!candidatura) {
        return res.status(404).json({ error: 'Candidatura não encontrada' });
      }

      res.json({
        success: true,
        data: candidatura
      });

    } catch (error) {
      console.error('❌ [CANDIDATURA] Erro ao buscar candidatura:', error);
      res.status(500).json({
        error: 'Erro ao buscar candidatura',
        details: error.message
      });
    }
  }
}

export default new CandidaturaController();

