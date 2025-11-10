import axios from 'axios';
import { randomUUID } from 'crypto';
import empresaRepository from '../../repositories/empresa/empresaRepository.js';

class LinkedInAuthController {
  /**
   * PASSO 1: Gera URL de autenticação via Unipile Hosted Auth
   * A empresa será redirecionada para o wizard da Unipile
   */
  async initiateAuth(req, res) {
    try {
      // Gerar um UUID válido se não houver empresaId
      let empresaId = req.query.empresaId;
      if (!empresaId || empresaId === 'temp-empresa-id') {
        empresaId = randomUUID();
        console.log('⚠️  [HOSTED AUTH] Gerando UUID temporário:', empresaId);
      }
      
      console.log('🔵 [HOSTED AUTH] Iniciando autenticação para empresa:', empresaId);
      
      // Criar empresa no banco ANTES de gerar o link
      console.log('📝 [HOSTED AUTH] Criando/verificando empresa no banco...');
      try {
        let empresa = await empresaRepository.findById(empresaId);
        if (!empresa) {
          console.log('⚠️  [HOSTED AUTH] Empresa não existe, criando...');
          empresa = await empresaRepository.create({
            id: empresaId,
            nome: 'Empresa Aguardando Conexão',
            email: `empresa-${empresaId}@temp.com`
          });
          console.log('✅ [HOSTED AUTH] Empresa criada:', empresa.id);
        } else {
          console.log('✅ [HOSTED AUTH] Empresa já existe:', empresa.id);
        }
      } catch (dbError) {
        console.error('❌ [HOSTED AUTH] Erro ao criar empresa:', dbError);
        return res.status(500).json({
          success: false,
          error: 'Erro ao preparar empresa para conexão'
        });
      }
      
      console.log('🔧 [HOSTED AUTH] Gerando link do Unipile Hosted Auth...');
      
      // Gerar data de expiração (1 hora a partir de agora)
      const expiresOn = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      
      // Chamar API da Unipile para gerar link hospedado
      const response = await axios.post(
        `${process.env.UNIPILE_API_URL}/hosted/accounts/link`,
        {
          type: 'create',
          expiresOn: expiresOn,
          providers: ['LINKEDIN'],
          api_url: process.env.UNIPILE_API_URL,
          success_redirect_url: `http://localhost:8080/auth/linkedin/callback?empresaId=${empresaId}`,
          failure_redirect_url: `http://localhost:8080/login?error=connection_failed`,
          notify_url: `http://localhost:3001/empresa/linkedin/webhook`,
          name: empresaId
        },
        {
          headers: {
            'accept': 'application/json',
            'X-API-KEY': process.env.UNIPILE_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const hostedAuthUrl = response.data.url;
      
      console.log('✅ [HOSTED AUTH] Link gerado com sucesso!');
      console.log('🔗 [HOSTED AUTH] URL:', hostedAuthUrl.substring(0, 50) + '...');
      
      res.json({ 
        success: true, 
        authUrl: hostedAuthUrl,
        message: 'Link de autenticação gerado'
      });
      
    } catch (error) {
      console.error('❌ [HOSTED AUTH] Erro ao gerar link:', error.response?.data || error.message);
      res.status(500).json({
        success: false,
        error: 'Erro ao iniciar autenticação com LinkedIn',
        details: error.response?.data || error.message
      });
    }
  }

  /**
   * PASSO 2: Webhook da Unipile após conexão
   * Recebe notificação quando a empresa conecta o LinkedIn
   */
  async handleWebhook(req, res) {
    try {
      console.log('🔔 [WEBHOOK] Notificação recebida da Unipile');
      console.log('📦 [WEBHOOK] Payload:', JSON.stringify(req.body, null, 2));
      
      const { account_id, status, name } = req.body;
      
      // O "name" é o empresaId que enviamos na requisição
      const empresaId = name;
      
      if (!empresaId) {
        console.error('⚠️  [WEBHOOK] empresaId (name) não encontrado no payload');
        return res.json({ received: true, error: 'Missing empresaId' });
      }
      
      console.log('🔵 [WEBHOOK] Account ID:', account_id);
      console.log('🔵 [WEBHOOK] Status:', status);
      console.log('🔵 [WEBHOOK] Empresa ID (name):', empresaId);
      
      // Se status for CREATION_SUCCESS, atualizar com account_id e buscar dados do LinkedIn
      if (status === 'CREATION_SUCCESS') {
        console.log('✅ [WEBHOOK] Conexão bem-sucedida! Atualizando empresa...');
        
        try {
          // Buscar dados da conta LinkedIn na Unipile
          console.log('📡 [WEBHOOK] Buscando dados do perfil LinkedIn...');
          
          let linkedinData = null;
          try {
            const accountResponse = await axios.get(
              `${process.env.UNIPILE_API_URL}/accounts/${account_id}`,
              {
                headers: {
                  'accept': 'application/json',
                  'X-API-KEY': process.env.UNIPILE_API_KEY
                }
              }
            );
            
            linkedinData = accountResponse.data;
            console.log('📦 [WEBHOOK] Dados do LinkedIn recebidos:', {
              name: linkedinData.name,
              publicIdentifier: linkedinData.connection_params?.im?.publicIdentifier,
              organizations: linkedinData.connection_params?.im?.organizations
            });
            
          } catch (apiError) {
            console.error('⚠️  [WEBHOOK] Erro ao buscar dados do LinkedIn:', apiError.response?.data || apiError.message);
            // Continua mesmo se não conseguir buscar os dados
          }
          
          // Atualizar empresa com Unipile account_id e dados do LinkedIn
          const updateData = {
            unipileAccountId: account_id,
            unipileConnected: true,
            unipileConnectedAt: new Date()
          };
          
          // Se conseguiu buscar dados do LinkedIn, adicionar ao update
          if (linkedinData) {
            // Nome da pessoa ou da empresa
            if (linkedinData.name) {
              updateData.nome = linkedinData.name;
            }
            
            // Buscar nome da organização (empresa)
            const organizations = linkedinData.connection_params?.im?.organizations;
            if (organizations && organizations.length > 0) {
              const firstOrg = organizations[0];
              if (firstOrg.name) {
                console.log('🏢 [WEBHOOK] Organização encontrada:', firstOrg.name);
                // Se tiver organização, usar o nome dela ao invés do nome pessoal
                updateData.nome = firstOrg.name;
              }
            }
            
            // Public identifier (username do LinkedIn)
            const publicIdentifier = linkedinData.connection_params?.im?.publicIdentifier;
            if (publicIdentifier) {
              updateData.email = `${publicIdentifier}@linkedin.com`;
            }
          }
          
          const empresa = await empresaRepository.update(empresaId, updateData);
          
          console.log('✅ [WEBHOOK] Empresa atualizada com sucesso!');
          console.log('🎉 [WEBHOOK] LinkedIn conectado!');
          console.log('📦 [WEBHOOK] Dados salvos:', {
            account_id,
            nome: empresa.nome,
            email: empresa.email
          });
          
        } catch (dbError) {
          console.error('❌ [WEBHOOK] Erro ao atualizar empresa:', dbError);
        }
      }
      
      // Responder à Unipile que recebemos a notificação
      res.json({ received: true });
      
    } catch (error) {
      console.error('❌ [WEBHOOK] Erro ao processar webhook:', error);
      res.status(500).json({ received: false, error: error.message });
    }
  }

  /**
   * PASSO 3: Callback do success_redirect_url (busca dados e salva no banco)
   * Agora busca os dados DIRETAMENTE da Unipile ao invés de esperar webhook
   */
  async handleCallback(req, res) {
    try {
      const empresaId = req.query.empresaId || 'temp-empresa-id';
      const error = req.query.error;
      
      console.log('🔵 [CALLBACK] Success redirect recebido');
      console.log('🔵 [CALLBACK] Empresa ID:', empresaId);
      console.log('🔵 [CALLBACK] Error:', error || 'nenhum');
      
      // Se houver erro
      if (error) {
        console.error('❌ [CALLBACK] Erro recebido:', error);
        return res.json({
          success: false,
          error: 'Conexão falhou',
          details: error
        });
      }
      
      // Buscar dados da empresa no banco
      let empresa = await empresaRepository.findById(empresaId);
      
      if (!empresa) {
        console.error('❌ [CALLBACK] Empresa não encontrada');
        return res.status(404).json({
          success: false,
          error: 'Empresa não encontrada'
        });
      }
      
      console.log('📡 [CALLBACK] Buscando contas conectadas na Unipile...');
      
      try {
        // Buscar lista de contas na Unipile
        const accountsResponse = await axios.get(
          `${process.env.UNIPILE_API_URL}/accounts`,
          {
            headers: {
              'accept': 'application/json',
              'X-API-KEY': process.env.UNIPILE_API_KEY
            }
          }
        );
        
        const accounts = accountsResponse.data.items || [];
        console.log(`📦 [CALLBACK] ${accounts.length} conta(s) encontrada(s) na Unipile`);
        
        if (accounts.length === 0) {
          console.warn('⚠️  [CALLBACK] Nenhuma conta encontrada na Unipile');
          return res.json({
            success: false,
            error: 'Nenhuma conta LinkedIn conectada encontrada'
          });
        }
        
        // Pegar a conta mais recente (última conectada)
        const latestAccount = accounts[accounts.length - 1];
        const accountId = latestAccount.id;
        
        console.log('🔍 [CALLBACK] Conta mais recente:', accountId);
        console.log('📡 [CALLBACK] Buscando dados completos do perfil LinkedIn...');
        
        // Buscar dados detalhados da conta
        const accountDetailResponse = await axios.get(
          `${process.env.UNIPILE_API_URL}/accounts/${accountId}`,
          {
            headers: {
              'accept': 'application/json',
              'X-API-KEY': process.env.UNIPILE_API_KEY
            }
          }
        );
        
        const linkedinData = accountDetailResponse.data;
        console.log('📦 [CALLBACK] Dados do LinkedIn recebidos:', JSON.stringify(linkedinData, null, 2));
        
        // Preparar dados para atualização
        const updateData = {
          unipileAccountId: accountId,
          unipileConnected: true,
          unipileConnectedAt: new Date()
        };
        
        // ===== DADOS DO PERFIL PESSOAL =====
        
        // Nome da pessoa
        if (linkedinData.name) {
          updateData.nome = linkedinData.name;
          console.log('👤 [CALLBACK] Nome da pessoa:', linkedinData.name);
        }
        
        // Avatar (foto de perfil)
        if (linkedinData.avatar) {
          updateData.avatar = linkedinData.avatar;
          console.log('📸 [CALLBACK] Avatar encontrado:', linkedinData.avatar);
        }
        
        // Headline (descrição profissional)
        if (linkedinData.headline) {
          updateData.headline = linkedinData.headline;
          console.log('💼 [CALLBACK] Headline:', linkedinData.headline);
        }
        
        // Location (localização)
        if (linkedinData.location) {
          updateData.location = linkedinData.location;
          console.log('📍 [CALLBACK] Location:', linkedinData.location);
        }
        
        // Public Identifier (username LinkedIn)
        const publicIdentifier = linkedinData.connection_params?.im?.publicIdentifier;
        if (publicIdentifier) {
          updateData.email = `${publicIdentifier}@linkedin.com`;
          console.log('✉️  [CALLBACK] Email gerado:', updateData.email);
        }
        
        // ===== DADOS DA COMPANY PAGE (se houver) =====
        
        const organizations = linkedinData.connection_params?.im?.organizations;
        if (organizations && organizations.length > 0) {
          const firstOrg = organizations[0];
          console.log('🏢 [CALLBACK] Company Page encontrada!');
          
          // Nome da empresa (básico)
          if (firstOrg.name) {
            updateData.nome = firstOrg.name;
            console.log('🏢 [CALLBACK] Nome da empresa:', firstOrg.name);
          }
          
          // Extrair organization_urn para buscar dados completos
          const organizationUrn = firstOrg.organization_urn;
          if (organizationUrn) {
            console.log('🔍 [CALLBACK] Organization URN encontrado:', organizationUrn);
            
            try {
              // Extrair ID numérico do URN (ex: "urn:li:fsd_company:109672062" -> "109672062")
              const companyId = organizationUrn.split(':').pop();
              console.log('🆔 [CALLBACK] Company ID extraído:', companyId);
              
              // Fazer chamada adicional para buscar dados completos da Company Page
              console.log('📡 [CALLBACK] Buscando dados completos da Company Page...');
              console.log('📡 [CALLBACK] Usando account_id como QUERY PARAMETER...');
              
              const companyResponse = await axios.get(
                `${process.env.UNIPILE_API_URL}/linkedin/company/${companyId}`,
                {
                  headers: {
                    'accept': 'application/json',
                    'X-API-KEY': process.env.UNIPILE_API_KEY
                  },
                  params: {
                    account_id: accountId  // ✅ Como query parameter (formato correto segundo a doc)
                  }
                }
              );
              
              const companyData = companyResponse.data;
              console.log('📦 [CALLBACK] Dados completos da Company Page recebidos!');
              console.log('📊 [CALLBACK] Company Data:', JSON.stringify(companyData, null, 2));
              
              // Extrair TODOS os dados da Company Page
              
              // Nome da empresa (completo)
              if (companyData.name) {
                updateData.nome = companyData.name;
                console.log('🏢 [CALLBACK] Nome (completo):', companyData.name);
              }
              
              // Logo da empresa
              if (companyData.logo) {
                updateData.logo = companyData.logo;
                console.log('🎨 [CALLBACK] Logo da empresa:', companyData.logo);
              }
              
              // Descrição da empresa
              if (companyData.description) {
                updateData.description = companyData.description;
                console.log('📝 [CALLBACK] Descrição:', companyData.description.substring(0, 100) + '...');
              }
              
              // Website
              if (companyData.website) {
                updateData.website = companyData.website;
                console.log('🌐 [CALLBACK] Website:', companyData.website);
              }
              
              // Setor/Indústria (converter array para string)
              if (companyData.industry) {
                updateData.industry = Array.isArray(companyData.industry) 
                  ? companyData.industry.join(', ') 
                  : companyData.industry;
                console.log('🏭 [CALLBACK] Indústria:', companyData.industry);
              }
              
              // Localização (pode vir como array de objetos)
              if (companyData.locations && Array.isArray(companyData.locations) && companyData.locations.length > 0) {
                const hq = companyData.locations.find(loc => loc.is_headquarter) || companyData.locations[0];
                updateData.location = `${hq.city || ''}${hq.area ? ', ' + hq.area : ''}${hq.country ? ', ' + hq.country : ''}`.trim();
                console.log('📍 [CALLBACK] Localização:', updateData.location);
              } else if (companyData.address || companyData.location) {
                updateData.location = companyData.address || companyData.location;
                console.log('📍 [CALLBACK] Localização:', updateData.location);
              }
              
              // Número de funcionários (pode vir como range {from, to})
              if (companyData.employee_count_range) {
                updateData.employeeCount = `${companyData.employee_count_range.from}-${companyData.employee_count_range.to}`;
                console.log('👥 [CALLBACK] Funcionários:', updateData.employeeCount);
              } else if (companyData.staffCount || companyData.employeeCount) {
                updateData.employeeCount = String(companyData.staffCount || companyData.employeeCount);
                console.log('👥 [CALLBACK] Funcionários:', updateData.employeeCount);
              }
              
              // Headline/Tagline (se houver)
              if (companyData.tagline || companyData.headline) {
                updateData.headline = companyData.tagline || companyData.headline;
                console.log('💼 [CALLBACK] Tagline:', updateData.headline);
              }
              
              console.log('✅ [CALLBACK] Dados completos da Company Page extraídos com sucesso!');
              
            } catch (companyError) {
              console.error('⚠️  [CALLBACK] Erro ao buscar com Company ID numérico:', companyError.response?.data || companyError.message);
              console.log('🔄 [CALLBACK] Tentando com URN completo como fallback...');
              
              // Tentar com URN completo como fallback
              try {
                const companyResponseUrn = await axios.get(
                  `${process.env.UNIPILE_API_URL}/linkedin/company/${encodeURIComponent(organizationUrn)}`,
                  {
                    headers: {
                      'accept': 'application/json',
                      'X-API-KEY': process.env.UNIPILE_API_KEY
                    },
                    params: {
                      account_id: accountId  // ✅ Como query parameter (formato correto segundo a doc)
                    }
                  }
                );
                
                const companyData = companyResponseUrn.data;
                console.log('📦 [CALLBACK] Dados completos da Company Page recebidos (URN)!');
                console.log('📊 [CALLBACK] Company Data:', JSON.stringify(companyData, null, 2));
                
                // Extrair dados (mesmo código de antes)
                if (companyData.name) {
                  updateData.nome = companyData.name;
                  console.log('🏢 [CALLBACK] Nome (completo):', companyData.name);
                }
                if (companyData.logo) {
                  updateData.logo = companyData.logo;
                  console.log('🎨 [CALLBACK] Logo da empresa:', companyData.logo);
                }
                if (companyData.description) {
                  updateData.description = companyData.description;
                  console.log('📝 [CALLBACK] Descrição:', companyData.description.substring(0, 100) + '...');
                }
                if (companyData.website) {
                  updateData.website = companyData.website;
                  console.log('🌐 [CALLBACK] Website:', companyData.website);
                }
                if (companyData.industry) {
                  updateData.industry = Array.isArray(companyData.industry) 
                    ? companyData.industry.join(', ') 
                    : companyData.industry;
                  console.log('🏭 [CALLBACK] Indústria:', companyData.industry);
                }
                // Localização (pode vir como array de objetos)
                if (companyData.locations && Array.isArray(companyData.locations) && companyData.locations.length > 0) {
                  const hq = companyData.locations.find(loc => loc.is_headquarter) || companyData.locations[0];
                  updateData.location = `${hq.city || ''}${hq.area ? ', ' + hq.area : ''}${hq.country ? ', ' + hq.country : ''}`.trim();
                  console.log('📍 [CALLBACK] Localização:', updateData.location);
                } else if (companyData.address || companyData.location) {
                  updateData.location = companyData.address || companyData.location;
                  console.log('📍 [CALLBACK] Localização:', updateData.location);
                }
                
                // Número de funcionários (pode vir como range {from, to})
                if (companyData.employee_count_range) {
                  updateData.employeeCount = `${companyData.employee_count_range.from}-${companyData.employee_count_range.to}`;
                  console.log('👥 [CALLBACK] Funcionários:', updateData.employeeCount);
                } else if (companyData.staffCount || companyData.employeeCount) {
                  updateData.employeeCount = String(companyData.staffCount || companyData.employeeCount);
                  console.log('👥 [CALLBACK] Funcionários:', updateData.employeeCount);
                }
                if (companyData.tagline || companyData.headline) {
                  updateData.headline = companyData.tagline || companyData.headline;
                  console.log('💼 [CALLBACK] Tagline:', updateData.headline);
                }
                
                console.log('✅ [CALLBACK] Dados completos extraídos com URN!');
                
              } catch (urnError) {
                console.error('⚠️  [CALLBACK] Erro também com URN:', urnError.response?.data || urnError.message);
                console.log('⚠️  [CALLBACK] Continuando apenas com dados básicos (nome da organização)');
                // Se falhar ambos, pelo menos temos o nome básico que já foi extraído acima
              }
            }
          } else {
            console.log('⚠️  [CALLBACK] Organization URN não encontrado, usando apenas dados básicos');
          }
        } else {
          console.log('⚠️  [CALLBACK] Nenhuma Company Page encontrada (usando dados do perfil pessoal)');
        }
        
        // Atualizar empresa no banco
        console.log('💾 [CALLBACK] Salvando dados no banco...');
        empresa = await empresaRepository.update(empresaId, updateData);
        
        console.log('✅ [CALLBACK] Empresa atualizada com sucesso!');
        console.log('🎉 [CALLBACK] Todos os dados salvos:', {
          id: empresa.id,
          nome: empresa.nome,
          email: empresa.email,
          logo: empresa.logo ? '✅' : '❌',
          avatar: empresa.avatar ? '✅' : '❌',
          industry: empresa.industry || 'N/A',
          location: empresa.location || 'N/A',
          website: empresa.website || 'N/A',
          employeeCount: empresa.employeeCount || 'N/A',
          unipileAccountId: empresa.unipileAccountId,
          unipileConnected: empresa.unipileConnected
        });
        
        // Retornar dados da empresa para o frontend fazer login
        res.json({
          success: true,
          message: 'LinkedIn conectado com sucesso!',
          empresa: {
            id: empresa.id,
            nome: empresa.nome,
            email: empresa.email,
            cnpj: empresa.cnpj,
            telefone: empresa.telefone,
            unipileConnected: empresa.unipileConnected,
            unipileConnectedAt: empresa.unipileConnectedAt
          }
        });
        
      } catch (apiError) {
        console.error('❌ [CALLBACK] Erro ao buscar dados da Unipile:', apiError.response?.data || apiError.message);
        
        // Mesmo com erro, retorna dados da empresa (sem dados do LinkedIn)
        return res.json({
          success: true,
          message: 'Conexão estabelecida, mas não foi possível buscar dados do LinkedIn',
          warning: apiError.message,
          empresa: {
            id: empresa.id,
            nome: empresa.nome,
            email: empresa.email,
            cnpj: empresa.cnpj,
            telefone: empresa.telefone,
            unipileConnected: false,
            unipileConnectedAt: null
          }
        });
      }
      
    } catch (error) {
      console.error('❌ [CALLBACK] Erro geral:', error.response?.data || error.message);
      console.error('Stack:', error.stack);
      res.status(500).json({
        success: false,
        error: 'Erro ao processar conexão',
        details: error.message
      });
    }
  }

  /**
   * Desconectar LinkedIn da empresa
   */
  async disconnect(req, res) {
    try {
      const empresaId = req.user?.id || req.query.empresaId || 'temp-empresa-id';
      
      console.log('🔵 [LINKEDIN AUTH] Desconectando empresa:', empresaId);
      
      const empresa = await empresaRepository.findById(empresaId);
      
      if (empresa.unipileAccountId) {
        // Desconectar da Unipile
        console.log('📤 [UNIPILE] Removendo conta da Unipile...');
        
        await axios.delete(
          `${process.env.UNIPILE_API_URL}/accounts/${empresa.unipileAccountId}`,
          {
            headers: {
              'accept': 'application/json',
              'X-API-KEY': process.env.UNIPILE_API_KEY
            }
          }
        );
        
        console.log('✅ [UNIPILE] Conta removida');
      }
      
      // Atualizar banco
      await empresaRepository.update(empresaId, {
        unipileAccountId: null,
        unipileConnected: false,
        unipileConnectedAt: null
      });
      
      console.log('✅ [DB] Empresa desconectada');
      
      res.json({ success: true, message: 'LinkedIn desconectado com sucesso' });
      
    } catch (error) {
      console.error('❌ [LINKEDIN AUTH] Erro ao desconectar:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erro ao desconectar LinkedIn',
        details: error.message
      });
    }
  }

  /**
   * Verificar status da conexão LinkedIn e retornar dados da empresa
   */
  async checkStatus(req, res) {
    try {
      const empresaId = req.user?.id || req.query.empresaId || 'temp-empresa-id';
      
      console.log('🔍 [STATUS] Verificando conexão para empresa:', empresaId);
      
      const empresa = await empresaRepository.findById(empresaId);
      
      if (!empresa) {
        console.log('⚠️  [STATUS] Empresa não encontrada no banco');
        return res.json({
          success: true,
          connected: false,
          empresa: null
        });
      }
      
      console.log('📦 [STATUS] Empresa encontrada:', {
        id: empresa.id,
        nome: empresa.nome,
        unipileConnected: empresa.unipileConnected,
        unipileAccountId: empresa.unipileAccountId
      });
      
      const isConnected = empresa.unipileConnected && empresa.unipileAccountId;
      
      console.log('📊 [STATUS] Connected:', isConnected);
      
      res.json({
        success: true,
        connected: isConnected,
        empresa: isConnected ? {
          id: empresa.id,
          nome: empresa.nome,
          email: empresa.email,
          cnpj: empresa.cnpj,
          telefone: empresa.telefone,
          unipileConnected: empresa.unipileConnected,
          unipileConnectedAt: empresa.unipileConnectedAt
        } : null
      });
      
    } catch (error) {
      console.error('❌ [LINKEDIN AUTH] Erro ao verificar status:', error);
      res.status(500).json({
        success: false,
        connected: false,
        error: error.message
      });
    }
  }
}

export default new LinkedInAuthController();

