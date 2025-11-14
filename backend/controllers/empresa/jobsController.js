import jobsRepository from '../../repositories/empresa/jobsRepository.js';
import empresaRepository from '../../repositories/empresa/empresaRepository.js';
import { unipileService } from '../../services/unipileService.js';

class JobsController {
  async getAllJobs(req, res) {
    try {
      const jobs = await jobsRepository.findAll();
      res.json({ data: jobs });
    } catch (error) {
      console.error('Erro ao buscar vagas:', error);
      res.status(500).json({ 
        error: 'Erro ao buscar vagas',
        details: error.message 
      });
    }
  }

  async getJobById(req, res) {
    try {
      const { id } = req.params;
      const job = await jobsRepository.findById(id);
      res.json(job);
    } catch (error) {
      console.error('Erro ao buscar vaga:', error);
      
      if (error.message.includes('não encontrada')) {
        return res.status(404).json({ 
          error: 'Vaga não encontrada',
          details: error.message 
        });
      }
      
      res.status(500).json({ 
        error: 'Erro ao buscar vaga',
        details: error.message 
      });
    }
  }

  async updateJob(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      console.log('📝 [JOBS] Atualizando vaga:', id);
      console.log('📝 [JOBS] Dados para atualizar:', updateData);

      // Busca vaga existente
      const existingJob = await jobsRepository.findById(id);
      if (!existingJob) {
        return res.status(404).json({ 
          error: 'Vaga não encontrada' 
        });
      }

      // Atualiza a vaga
      const updatedJob = await jobsRepository.update(id, updateData);

      console.log('✅ [JOBS] Vaga atualizada com sucesso');
      
      res.json({
        success: true,
        message: 'Vaga atualizada com sucesso',
        data: updatedJob
      });
    } catch (error) {
      console.error('❌ [JOBS] Erro ao atualizar vaga:', error);
      res.status(500).json({ 
        error: 'Erro ao atualizar vaga',
        details: error.message 
      });
    }
  }

  async createJob(req, res) {
    try {
      const payload = req.body;
      
      // TODO: Pegar empresaId do token JWT quando tiver autenticação
      // Por enquanto, vamos criar uma empresa temporária ou usar uma existente
      let empresaId = req.query.empresaId || req.body.empresaId;
      
      if (!empresaId) {
        console.log('⚠️  [JOBS] empresaId não fornecido, buscando ou criando empresa de desenvolvimento...');
        
        // Tenta buscar uma empresa existente de desenvolvimento
        const empresas = await empresaRepository.findAll();
        
        if (empresas && empresas.length > 0) {
          // Reutiliza a primeira empresa encontrada
          empresaId = empresas[0].id;
          console.log('✅ [JOBS] Usando empresa existente:', empresas[0].nome, '-', empresaId);
        } else {
          // Se não houver nenhuma empresa, cria UMA empresa de desenvolvimento
          console.log('📝 [JOBS] Nenhuma empresa encontrada, criando empresa de desenvolvimento...');
          const companyName = payload.company?.text || payload.company?.id || payload.company || 'Empresa de Desenvolvimento';
          const locationName = typeof payload.location === 'object' && payload.location?.text 
            ? payload.location.text 
            : 'São Paulo, SP';
          
          const empresaTemp = await empresaRepository.create({
            nome: companyName,
            email: 'desenvolvimento@empresa.com',
            senha: 'dev-hash',
            telefone: '(00) 00000-0000',
            ramoAtuacao: 'Tecnologia',
            tamanhoEmpresa: '1-10',
            localizacao: locationName
          });
          empresaId = empresaTemp.id;
          console.log('✅ [JOBS] Empresa de desenvolvimento criada:', empresaId);
        }
      }

      // Validação dos campos obrigatórios
      const validationError = this.validateJobPayload(payload);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      // Preparar dados para inserção no banco
      const jobData = this.prepareJobData(payload, empresaId);

      // PASSO 1: Salvar no banco de dados local
      console.log('💾 [BACKEND] Salvando vaga no banco de dados...');
      console.log('💾 [BACKEND] empresaId:', empresaId);
      const job = await jobsRepository.create(jobData);
      console.log('✅ [BACKEND] Vaga salva no banco:', job.id);

      // Por enquanto, todas as vagas são salvas como rascunho
      // A publicação no LinkedIn será implementada depois com a integração da Unipile
      console.log('✅ [BACKEND] Vaga salva como rascunho com sucesso!');

      res.status(201).json({ 
        message: 'Vaga criada como rascunho com sucesso!',
        id: job.id,
        data: job
      });

    } catch (error) {
      console.error('❌ [BACKEND] Erro ao criar vaga:', error);
      res.status(500).json({ 
        error: 'Erro ao criar vaga',
        details: error.message 
      });
    }
  }

  validateJobPayload(payload) {
    // Validação dos campos obrigatórios
    if (!payload.job_title?.text && !payload.job_title?.id) {
      return 'Campo job_title é obrigatório';
    }

    if (!payload.company?.text && !payload.company?.id) {
      return 'Campo company é obrigatório';
    }

    if (!payload.workplace) {
      return 'Campo workplace é obrigatório';
    }

    if (!payload.location) {
      return 'Campo location é obrigatório';
    }

    if (!payload.description) {
      return 'Campo description é obrigatório';
    }

    // Campos do recruiter agora são OPCIONAIS (para quando a API da Unipile estiver pronta)
    return null;
  }

  prepareJobData(payload, empresaId) {
    const data = {
      empresaId: empresaId, // ID da empresa que criou a vaga
      jobTitle: payload.job_title.text || payload.job_title.id,
      jobTitleType: payload.job_title.text ? 'text' : 'id',
      company: payload.company.text || payload.company.id,
      companyType: payload.company.text ? 'text' : 'id',
      workplace: payload.workplace,
      // Location no formato Unipile: { id: "103119278", text: "São Paulo - SP" }
      location: typeof payload.location === 'object' && payload.location 
        ? payload.location 
        : { id: payload.location, text: "" },
      description: payload.description,
      employmentStatus: payload.employment_status || null,
      
      // Salário
      salaryAmount: payload.salary_amount || null,
      salaryMin: payload.salary_min || null,
      salaryMax: payload.salary_max || null,
      salaryAnonymous: payload.salary_anonymous || false,
      
      // Configurações da vaga (testes, entrevistas, dias ativos)
      jobConfig: payload.job_config || {},
      
      // Status padrão
      status: payload.status || 'rascunho',
    };

    // Campos opcionais do recruiter (apenas se fornecidos)
    if (payload.recruiter) {
      if (payload.recruiter.project) {
        data.recruiterProject = payload.recruiter.project.name || payload.recruiter.project.id;
        data.recruiterProjectType = payload.recruiter.project.name ? 'name' : 'id';
      }
      if (payload.recruiter.functions) {
        data.recruiterFunctions = payload.recruiter.functions;
      }
      if (payload.recruiter.industries) {
        data.recruiterIndustries = payload.recruiter.industries;
      }
      if (payload.recruiter.seniority) {
        data.recruiterSeniority = payload.recruiter.seniority;
      }
      if (payload.recruiter.apply_url) {
        data.recruiterApplyUrl = payload.recruiter.apply_url;
      }
      // Outras configurações do recruiter em um campo JSON
      data.recruiterConfig = {
        includePosterInfo: payload.recruiter.include_poster_info ?? true,
        trackingPixelUrl: payload.recruiter.tracking_pixel_url || null,
        companyJobId: payload.recruiter.company_job_id || null,
        autoArchiveApplicants: payload.recruiter.auto_archive_applicants || {},
        sendRejectionNotification: payload.recruiter.send_rejection_notification ?? true,
      };
    }
    
    return data;
  }
}

export default new JobsController();

