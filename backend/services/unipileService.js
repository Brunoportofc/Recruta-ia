import axios from 'axios';

class UnipileService {
  constructor() {
    this.apiUrl = process.env.UNIPILE_API_URL || 'https://api1.unipile.com:13111/api/v1';
    this.apiKey = process.env.UNIPILE_API_KEY;
    this.accountId = process.env.UNIPILE_ACCOUNT_ID;

    if (!this.apiKey) {
      console.warn('⚠️  UNIPILE_API_KEY não configurada no .env');
    }

    if (!this.accountId) {
      console.warn('⚠️  UNIPILE_ACCOUNT_ID não configurada no .env');
    }
  }

  /**
   * Cria um rascunho de vaga no LinkedIn via Unipile
   * @param {Object} jobData - Dados da vaga preparados
   * @param {string} accountId - Account ID da empresa (opcional, usa o padrão se não fornecido)
   * @returns {Promise<Object>} Resposta da API com o ID do rascunho
   */
  async createJobPosting(jobData, accountId = null) {
    try {
      const finalAccountId = accountId || this.accountId;
      
      console.log('📤 [UNIPILE] Criando rascunho de vaga no LinkedIn...');
      console.log('🆔 [UNIPILE] Account ID:', finalAccountId);

      // Monta o payload no formato esperado pela Unipile
      const unipilePayload = {
        account_id: finalAccountId,
        job_title: jobData.job_title_type === 'text' 
          ? { text: jobData.job_title } 
          : { id: jobData.job_title },
        company: jobData.company_type === 'text'
          ? { text: jobData.company }
          : { id: jobData.company },
        workplace: jobData.workplace,
        location: jobData.location,
        description: jobData.description,
        ...(jobData.employment_status && { employment_status: jobData.employment_status }),
        ...(jobData.auto_rejection_template && { auto_rejection_template: jobData.auto_rejection_template }),
        ...(jobData.screening_questions && jobData.screening_questions.length > 0 && {
          screening_questions: jobData.screening_questions
        }),
        recruiter: {
          project: jobData.recruiter_project_type === 'name'
            ? { name: jobData.recruiter_project }
            : { id: jobData.recruiter_project },
          functions: jobData.recruiter_functions,
          industries: jobData.recruiter_industries,
          seniority: jobData.recruiter_seniority,
          apply_method: jobData.recruiter_apply_method_type === 'linkedin'
            ? {
                type: 'linkedin',
                notification_email: jobData.recruiter_apply_method_notification_email,
                resume_required: jobData.recruiter_apply_method_resume_required
              }
            : {
                type: 'external',
                url: jobData.recruiter_apply_method_url
              },
          include_poster_info: jobData.recruiter_include_poster_info,
          ...(jobData.recruiter_tracking_pixel_url && {
            tracking_pixel_url: jobData.recruiter_tracking_pixel_url
          }),
          ...(jobData.recruiter_company_job_id && {
            company_job_id: jobData.recruiter_company_job_id
          }),
          auto_archive_applicants: {
            screening_questions: jobData.recruiter_auto_archive_screening_questions,
            outside_of_country: jobData.recruiter_auto_archive_outside_country
          },
          send_rejection_notification: jobData.recruiter_send_rejection_notification
        }
      };

      console.log('📋 [UNIPILE] Payload:', JSON.stringify(unipilePayload, null, 2));

      const response = await axios.post(
        `${this.apiUrl}/linkedin/jobs`,
        unipilePayload,
        {
          headers: {
            'accept': 'application/json',
            'X-API-KEY': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ [UNIPILE] Rascunho criado com sucesso:', response.data);
      return response.data;

    } catch (error) {
      console.error('❌ [UNIPILE] Erro ao criar rascunho:', error.response?.data || error.message);
      throw new Error(
        `Falha ao criar vaga no LinkedIn: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Publica um rascunho de vaga no LinkedIn
   * @param {string} draftId - ID do rascunho criado
   * @returns {Promise<Object>} Resposta da publicação
   */
  async publishJobPosting(draftId) {
    try {
      console.log(`📤 [UNIPILE] Publicando vaga (draft ID: ${draftId})...`);

      const response = await axios.post(
        `${this.apiUrl}/linkedin/jobs/publish`,
        {
          account_id: this.accountId,
          id: draftId
        },
        {
          headers: {
            'accept': 'application/json',
            'X-API-KEY': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ [UNIPILE] Vaga publicada com sucesso:', response.data);
      return response.data;

    } catch (error) {
      console.error('❌ [UNIPILE] Erro ao publicar vaga:', error.response?.data || error.message);
      throw new Error(
        `Falha ao publicar vaga no LinkedIn: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Lista todas as vagas do LinkedIn
   * @returns {Promise<Array>} Lista de vagas
   */
  async getJobPostings() {
    try {
      console.log('📥 [UNIPILE] Buscando vagas do LinkedIn...');

      const response = await axios.post(
        `${this.apiUrl}/linkedin/jobs`,
        {
          account_id: this.accountId
        },
        {
          headers: {
            'accept': 'application/json',
            'X-API-KEY': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ [UNIPILE] ${response.data.items?.length || 0} vagas encontradas`);
      return response.data.items || [];

    } catch (error) {
      console.error('❌ [UNIPILE] Erro ao buscar vagas:', error.response?.data || error.message);
      throw new Error(
        `Falha ao buscar vagas do LinkedIn: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Fecha uma vaga do LinkedIn
   * @param {string} jobId - ID da vaga no Unipile
   * @returns {Promise<Object>} Resposta do fechamento
   */
  async closeJobPosting(jobId) {
    try {
      console.log(`🔒 [UNIPILE] Fechando vaga (ID: ${jobId})...`);

      const response = await axios.post(
        `${this.apiUrl}/linkedin/jobs/close`,
        {
          account_id: this.accountId,
          id: jobId
        },
        {
          headers: {
            'accept': 'application/json',
            'X-API-KEY': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ [UNIPILE] Vaga fechada com sucesso');
      return response.data;

    } catch (error) {
      console.error('❌ [UNIPILE] Erro ao fechar vaga:', error.response?.data || error.message);
      throw new Error(
        `Falha ao fechar vaga do LinkedIn: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Edita uma vaga do LinkedIn
   * @param {string} jobId - ID da vaga no Unipile
   * @param {Object} updates - Dados para atualizar
   * @returns {Promise<Object>} Resposta da edição
   */
  async editJobPosting(jobId, updates) {
    try {
      console.log(`✏️ [UNIPILE] Editando vaga (ID: ${jobId})...`);

      const response = await axios.patch(
        `${this.apiUrl}/linkedin/jobs/${jobId}`,
        {
          account_id: this.accountId,
          ...updates
        },
        {
          headers: {
            'accept': 'application/json',
            'X-API-KEY': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ [UNIPILE] Vaga editada com sucesso');
      return response.data;

    } catch (error) {
      console.error('❌ [UNIPILE] Erro ao editar vaga:', error.response?.data || error.message);
      throw new Error(
        `Falha ao editar vaga do LinkedIn: ${error.response?.data?.message || error.message}`
      );
    }
  }
}

export const unipileService = new UnipileService();

