import prisma from '../../lib/prisma.js';

class CurriculoController {
  /**
   * Salva ou atualiza o currículo completo do candidato
   */
  async salvarCurriculo(req, res) {
    try {
      console.log('📝 [CURRICULO] Requisição recebida');
      console.log('📝 [CURRICULO] req.user:', req.user);
      
      const { candidatoId } = req.user; // Do middleware de autenticação
      
      console.log('📝 [CURRICULO] candidatoId extraído:', candidatoId);
      
      if (!candidatoId) {
        console.error('❌ [CURRICULO] candidatoId não encontrado em req.user');
        return res.status(400).json({
          success: false,
          message: 'ID do candidato não encontrado'
        });
      }
      
      const {
        // Dados pessoais
        nomeCompleto,
        email,
        telefone,
        cidade,
        estado,
        linkedin,
        objetivoProfissional,

        // Arrays de dados
        experiencias = [],
        formacoes = [],
        habilidades = [],
        idiomas = [],
        certificacoes = []
      } = req.body;

      console.log('📝 [CURRICULO] Salvando currículo para candidato:', candidatoId);
      console.log('📝 [CURRICULO] Dados recebidos:', {
        nomeCompleto,
        email,
        experienciasCount: experiencias.length,
        formacoesCount: formacoes.length,
        habilidadesCount: habilidades.length,
        idiomasCount: idiomas.length,
        certificacoesCount: certificacoes.length
      });

      // Usa upsert para criar se não existir ou atualizar se já existe
      const candidato = await prisma.candidato.upsert({
        where: { id: candidatoId },
        update: {
          // Dados pessoais
          nomeCompleto,
          email,
          telefone,
          cidade,
          estado,
          linkedinUrl: linkedin,
          objetivoProfissional,
          
          // Dados do currículo (JSON)
          experiencias: experiencias || [],
          formacoes: formacoes || [],
          habilidades: habilidades || [],
          idiomas: idiomas || [],
          certificacoes: certificacoes || [],
          
          // Metadados
          perfilCompleto: true,
          updatedAt: new Date()
        },
        create: {
          id: candidatoId,
          linkedinId: req.user.linkedinId,
          email,
          nomeCompleto,
          telefone,
          cidade,
          estado,
          linkedinUrl: linkedin,
          objetivoProfissional,
          
          // Dados do currículo (JSON)
          experiencias: experiencias || [],
          formacoes: formacoes || [],
          habilidades: habilidades || [],
          idiomas: idiomas || [],
          certificacoes: certificacoes || [],
          
          // Metadados
          origemDados: 'manual',
          perfilCompleto: true
        }
      });

      console.log('✅ [CURRICULO] Currículo salvo com sucesso!');

      res.json({
        success: true,
        message: 'Currículo salvo com sucesso',
        candidatoId: candidato.id
      });
    } catch (error) {
      console.error('❌ [CURRICULO] Erro ao salvar currículo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao salvar currículo',
        error: error.message
      });
    }
  }

  /**
   * Busca o currículo completo do candidato
   */
  async buscarCurriculo(req, res) {
    try {
      const { candidatoId } = req.user;

      console.log('🔍 [CURRICULO] Buscando currículo do candidato:', candidatoId);

      const candidato = await prisma.candidato.findUnique({
        where: { id: candidatoId }
      });

      if (!candidato) {
        return res.status(404).json({
          success: false,
          message: 'Candidato não encontrado'
        });
      }

      console.log('✅ [CURRICULO] Currículo encontrado');

      res.json({
        success: true,
        curriculo: {
          // Dados pessoais
          nomeCompleto: candidato.nomeCompleto,
          email: candidato.email,
          telefone: candidato.telefone,
          cidade: candidato.cidade,
          estado: candidato.estado,
          linkedin: candidato.linkedinUrl,
          fotoPerfil: candidato.fotoPerfilUrl,
          objetivoProfissional: candidato.objetivoProfissional,
          perfilCompleto: candidato.perfilCompleto,

          // Arrays JSON
          experiencias: candidato.experiencias,
          formacoes: candidato.formacoes,
          habilidades: candidato.habilidades,
          idiomas: candidato.idiomas,
          certificacoes: candidato.certificacoes
        }
      });
    } catch (error) {
      console.error('❌ [CURRICULO] Erro ao buscar currículo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar currículo',
        error: error.message
      });
    }
  }

  /**
   * Salva resultado do teste comportamental
   */
  async salvarTesteComportamental(req, res) {
    try {
      const { candidatoId } = req.user;
      const {
        respostas,
        resultado,
        perfilDominante,
        pontuacaoTotal,
        tempoTesteSegundos
      } = req.body;

      console.log('🧠 [TESTE] Salvando teste comportamental para candidato:', candidatoId);

      // Busca o candidato atual
      const candidato = await prisma.candidato.findUnique({
        where: { id: candidatoId }
      });

      if (!candidato) {
        return res.status(404).json({
          success: false,
          message: 'Candidato não encontrado'
        });
      }

      // Cria novo teste
      const novoTeste = {
        id: crypto.randomUUID(),
        respostas,
        resultado,
        perfilDominante,
        pontuacaoTotal,
        tempoTesteSegundos,
        dataRealizacao: new Date().toISOString()
      };

      // Adiciona ao array de testes
      const testesAtualizados = [...(candidato.testesComportamentais || []), novoTeste];

      // Atualiza candidato
      await prisma.candidato.update({
        where: { id: candidatoId },
        data: {
          testesComportamentais: testesAtualizados
        }
      });

      console.log('✅ [TESTE] Teste salvo com sucesso:', novoTeste.id);

      res.json({
        success: true,
        message: 'Teste comportamental salvo com sucesso',
        testeId: novoTeste.id
      });
    } catch (error) {
      console.error('❌ [TESTE] Erro ao salvar teste:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao salvar teste comportamental',
        error: error.message
      });
    }
  }

  /**
   * Busca o último teste comportamental do candidato
   */
  async buscarUltimoTeste(req, res) {
    try {
      const { candidatoId } = req.user;

      console.log('🔍 [TESTE] Buscando último teste do candidato:', candidatoId);

      const candidato = await prisma.candidato.findUnique({
        where: { id: candidatoId }
      });

      if (!candidato || !candidato.testesComportamentais || candidato.testesComportamentais.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Nenhum teste encontrado'
        });
      }

      // Pega o último teste do array (mais recente)
      const testes = candidato.testesComportamentais;
      const ultimoTeste = testes[testes.length - 1];

      console.log('✅ [TESTE] Teste encontrado:', ultimoTeste.id);

      res.json({
        success: true,
        teste: ultimoTeste
      });
    } catch (error) {
      console.error('❌ [TESTE] Erro ao buscar teste:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar teste',
        error: error.message
      });
    }
  }
}

export const curriculoController = new CurriculoController();

