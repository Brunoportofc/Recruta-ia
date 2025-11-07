import jobsRepository from '../../repositories/empresa/jobsRepository.js';
import unipileService from '../../services/unipileService.js';

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

  async getLocations(req, res) {
    const startTime = Date.now();
    console.log('\n🌐 [GET /jobs/locations] Requisição recebida');
    console.log('📍 Origin:', req.headers.origin || 'N/A');
    console.log('📍 IP:', req.ip || req.connection.remoteAddress);
    
    // Definir timeout de 15 segundos para a requisição completa
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        console.error('⏱️ Timeout: Requisição demorou mais de 15 segundos');
        res.status(504).json({ 
          error: 'Timeout ao buscar localizações',
          details: 'A requisição à API da Unipile demorou muito para responder'
        });
      }
    }, 15000);
    
    try {
      const locations = await unipileService.getLocations();
      clearTimeout(timeout);
      const duration = Date.now() - startTime;
      console.log(`✅ Retornando ${locations.length} localização(ões) para o frontend (${duration}ms)`);
      res.json({ data: locations });
    } catch (error) {
      clearTimeout(timeout);
      const duration = Date.now() - startTime;
      console.error(`❌ Erro no controller ao buscar localizações (${duration}ms):`);
      console.error('  Tipo:', error.name);
      console.error('  Mensagem:', error.message);
      
      // Se houver resposta HTTP da Unipile, logar também
      if (error.response) {
        console.error('  Status HTTP:', error.response.status);
        console.error('  Dados da resposta:', JSON.stringify(error.response.data, null, 2));
        console.error('  Headers da resposta:', error.response.headers);
      } else if (error.request) {
        console.error('  Request feito mas sem resposta');
        console.error('  Code:', error.code);
      }
      
      // Por enquanto, retornar lista vazia em vez de erro 500
      // Isso permite que o frontend continue funcionando
      // TODO: Uma vez que a API da Unipile esteja funcionando, remover este fallback
      if (!res.headersSent) {
        console.warn('⚠️ Retornando lista vazia como fallback devido ao erro da Unipile');
        res.json({ 
          data: [],
          warning: 'Não foi possível carregar localizações da Unipile. Verifique os logs do servidor.',
          error_details: error.message
        });
      }
    }
  }

  async createJob(req, res) {
    try {
      const payload = req.body;

      // Validação dos campos obrigatórios
      const validationError = this.validateJobPayload(payload);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      // Preparar dados para inserção no banco
      const jobData = this.prepareJobData(payload);

      // Inserir no banco de dados
      const job = await jobsRepository.create(jobData);

      res.status(201).json({ 
        message: 'Vaga criada com sucesso',
        data: job 
      });
    } catch (error) {
      console.error('Erro ao criar vaga:', error);
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

    if (!payload.recruiter) {
      return 'Campo recruiter é obrigatório';
    }

    // Validação do recruiter
    if (!payload.recruiter.project?.name && !payload.recruiter.project?.id) {
      return 'Campo recruiter.project é obrigatório';
    }

    if (!payload.recruiter.functions || payload.recruiter.functions.length === 0) {
      return 'Campo recruiter.functions é obrigatório e deve ter pelo menos 1 função';
    }

    if (!payload.recruiter.industries || payload.recruiter.industries.length === 0) {
      return 'Campo recruiter.industries é obrigatório e deve ter pelo menos 1 indústria';
    }

    if (!payload.recruiter.seniority) {
      return 'Campo recruiter.seniority é obrigatório';
    }

    if (!payload.recruiter.apply_method) {
      return 'Campo recruiter.apply_method é obrigatório';
    }

    // Validação do apply_method
    if (payload.recruiter.apply_method.type === 'linkedin') {
      if (!payload.recruiter.apply_method.notification_email) {
        return 'Campo recruiter.apply_method.notification_email é obrigatório para tipo linkedin';
      }
    } else if (payload.recruiter.apply_method.type === 'external') {
      if (!payload.recruiter.apply_method.url) {
        return 'Campo recruiter.apply_method.url é obrigatório para tipo external';
      }
    }

    return null;
  }

  prepareJobData(payload) {
    return {
      job_title: payload.job_title.text || payload.job_title.id,
      job_title_type: payload.job_title.text ? 'text' : 'id',
      company: payload.company.text || payload.company.id,
      company_type: payload.company.text ? 'text' : 'id',
      workplace: payload.workplace,
      location: payload.location,
      description: payload.description,
      employment_status: payload.employment_status || null,
      auto_rejection_template: payload.auto_rejection_template || null,
      screening_questions: payload.screening_questions || [],
      
      // Dados do recruiter
      recruiter_project: payload.recruiter.project.name || payload.recruiter.project.id,
      recruiter_project_type: payload.recruiter.project.name ? 'name' : 'id',
      recruiter_functions: payload.recruiter.functions,
      recruiter_industries: payload.recruiter.industries,
      recruiter_seniority: payload.recruiter.seniority,
      recruiter_apply_method_type: payload.recruiter.apply_method.type,
      recruiter_apply_method_notification_email: payload.recruiter.apply_method.notification_email || null,
      recruiter_apply_method_resume_required: payload.recruiter.apply_method.resume_required ?? true,
      recruiter_apply_method_url: payload.recruiter.apply_method.url || null,
      recruiter_include_poster_info: payload.recruiter.include_poster_info ?? true,
      recruiter_tracking_pixel_url: payload.recruiter.tracking_pixel_url || null,
      recruiter_company_job_id: payload.recruiter.company_job_id || null,
      recruiter_auto_archive_screening_questions: payload.recruiter.auto_archive_applicants?.screening_questions ?? true,
      recruiter_auto_archive_outside_country: payload.recruiter.auto_archive_applicants?.outside_of_country ?? true,
      recruiter_send_rejection_notification: payload.recruiter.send_rejection_notification ?? true
    };
  }
}

export default new JobsController();

