import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authService, LinkedInResumeData } from '@/services/authService';
import { curriculoService } from '@/services/curriculoService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, ChevronRight, AlertCircle, Linkedin, Save } from 'lucide-react';

// Interface local para dados do currículo
interface CurriculoData {
  nomeCompleto: string;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
  linkedinUrl: string;
  objetivoProfissional: string;
  experiencias: Array<{
    cargo: string;
    empresa: string;
    dataInicio: string;
    dataFim: string;
    descricao: string;
    atual: boolean;
  }>;
  formacoes: Array<{
    curso: string;
    instituicao: string;
    dataInicio: string;
    dataFim: string;
    status: 'completo' | 'cursando' | 'incompleto';
  }>;
  habilidades: string[];
  idiomas: Array<{
    idioma: string;
    nivel: 'basico' | 'intermediario' | 'avancado' | 'fluente' | 'nativo';
  }>;
  certificacoes: Array<{
    nome: string;
    instituicao: string;
    dataEmissao: string;
  }>;
}

export default function FormularioCurriculo() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<CurriculoData | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [dataSource, setDataSource] = useState<'linkedin' | 'manual' | 'database'>('manual');

  useEffect(() => {
    initializeForm();
  }, []);

  const initializeForm = async () => {
    setIsLoading(true);
    
    try {
      // 1. Primeiro tenta buscar do banco de dados
      console.log('🔍 Buscando currículo do banco de dados...');
      const curriculoSalvo = await curriculoService.buscarCurriculo();
      
      if (curriculoSalvo) {
        console.log('✅ Currículo carregado do banco de dados');
        console.log('📋 Dados do currículo:', curriculoSalvo);
        setFormData({
          nomeCompleto: curriculoSalvo.nomeCompleto || '',
          email: curriculoSalvo.email || '',
          telefone: curriculoSalvo.telefone || '',
          cidade: curriculoSalvo.cidade || '',
          estado: curriculoSalvo.estado || '',
          linkedinUrl: curriculoSalvo.linkedin || '',
          objetivoProfissional: curriculoSalvo.objetivoProfissional || '',
          experiencias: curriculoSalvo.experiencias || [],
          formacoes: curriculoSalvo.formacoes || [],
          habilidades: curriculoSalvo.habilidades || [],
          idiomas: curriculoSalvo.idiomas || [],
          certificacoes: curriculoSalvo.certificacoes || []
        });
        setProfilePhoto(curriculoSalvo.fotoPerfil || user?.avatar || '');
        setDataSource('database');
        return;
      }
      
      // 2. Se não existe no banco, verifica dados do LinkedIn
      const linkedInData = authService.getLinkedInResumeData();
      
      if (linkedInData) {
        console.log('✅ Preenchendo formulário com dados do LinkedIn');
        setFormData(convertLinkedInDataToCurriculoData(linkedInData));
        setProfilePhoto(linkedInData.fotoPerfil || user?.avatar || '');
        setDataSource('linkedin');
        
        // NÃO limpa dados do LinkedIn aqui - apenas após salvar no banco
      } else {
        // 3. Inicializa com dados vazios ou básicos do usuário
        console.log('📝 Inicializando formulário vazio');
        const emptyData = getEmptyFormData();
        
        // Preenche com dados básicos do usuário se disponível
        if (user) {
          emptyData.nomeCompleto = user.name;
          emptyData.email = user.email;
          setProfilePhoto(user.avatar || '');
        }
        
        setFormData(emptyData);
        setDataSource('manual');
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar formulário:', error);
      toast({
        title: 'Aviso',
        description: 'Não foi possível carregar dados salvos. Iniciando formulário vazio.',
        variant: 'default'
      });
      
      // Tenta usar dados do LinkedIn em caso de erro
      const linkedInData = authService.getLinkedInResumeData();
      if (linkedInData) {
        setFormData(convertLinkedInDataToCurriculoData(linkedInData));
        setProfilePhoto(linkedInData.fotoPerfil || user?.avatar || '');
        setDataSource('linkedin');
      } else {
        const emptyData = getEmptyFormData();
        if (user) {
          emptyData.nomeCompleto = user.name;
          emptyData.email = user.email;
          setProfilePhoto(user.avatar || '');
        }
        setFormData(emptyData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const convertLinkedInDataToCurriculoData = (linkedInData: LinkedInResumeData): CurriculoData => {
    return {
      nomeCompleto: linkedInData.nomeCompleto || '',
      email: linkedInData.email || '',
      telefone: linkedInData.telefone || '',
      cidade: linkedInData.cidade || '',
      estado: linkedInData.estado || '',
      linkedinUrl: linkedInData.linkedinUrl || '',
      objetivoProfissional: linkedInData.objetivoProfissional || '',
      experiencias: linkedInData.experiencias || [],
      formacoes: linkedInData.formacoes || [],
      habilidades: linkedInData.habilidades || [],
      idiomas: linkedInData.idiomas || [],
      certificacoes: linkedInData.certificacoes || []
    };
  };


  const getEmptyFormData = (): CurriculoData => ({
    nomeCompleto: '',
    email: '',
    telefone: '',
    cidade: '',
    estado: '',
    linkedinUrl: '',
    objetivoProfissional: '',
    experiencias: [],
    formacoes: [],
    habilidades: [],
    idiomas: [],
    certificacoes: []
  });

  const validateCurriculoData = (data: CurriculoData): string[] => {
    const errors: string[] = [];
    
    if (!data.nomeCompleto?.trim()) {
      errors.push('Nome completo é obrigatório');
    }
    
    if (!data.email?.trim()) {
      errors.push('Email é obrigatório');
    }
    
    if (!data.telefone?.trim()) {
      errors.push('Telefone é obrigatório');
    }
    
    if (!data.cidade?.trim() || !data.estado?.trim()) {
      errors.push('Cidade e Estado são obrigatórios');
    }
    
    if (data.experiencias.length === 0) {
      errors.push('Pelo menos uma experiência profissional é necessária');
    }
    
    if (data.formacoes.length === 0) {
      errors.push('Pelo menos uma formação acadêmica é necessária');
    }
    
    return errors;
  };

  const handleSubmit = async () => {
    if (!formData || isSaving) return;

    console.log('🚀 [FORM] Iniciando submit...');
    console.log('🔍 [FORM] Token atual:', localStorage.getItem('recruta_ai_token') ? 'EXISTE' : 'NÃO EXISTE');
    console.log('🔍 [FORM] Usuário atual:', localStorage.getItem('recruta_ai_user') ? 'EXISTE' : 'NÃO EXISTE');

    // Validação
    const validationErrors = validateCurriculoData(formData);
    
    if (validationErrors.length > 0) {
      console.log('❌ [FORM] Erros de validação:', validationErrors);
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast({
        title: 'Erro de validação',
        description: validationErrors[0],
        variant: 'destructive'
      });
      return;
    }

    // Salvar no banco de dados
    setIsSaving(true);
    setErrors([]);
    
    try {
      console.log('💾 [FORM] Salvando currículo no banco de dados...');
      
      // Prepara dados para enviar (ajusta nomes dos campos)
      const curriculoParaSalvar = {
        nomeCompleto: formData.nomeCompleto,
        email: formData.email,
        telefone: formData.telefone,
        cidade: formData.cidade,
        estado: formData.estado,
        linkedin: formData.linkedinUrl,
        objetivoProfissional: formData.objetivoProfissional,
        experiencias: formData.experiencias,
        formacoes: formData.formacoes,
        habilidades: formData.habilidades,
        idiomas: formData.idiomas,
        certificacoes: formData.certificacoes
      };
      
      console.log('📤 [FORM] Dados preparados para envio');
      
      const resultado = await curriculoService.salvarCurriculo(curriculoParaSalvar);
      
      console.log('📥 [FORM] Resposta recebida:', resultado);
      console.log('🔍 [FORM] Token após salvamento:', localStorage.getItem('recruta_ai_token') ? 'EXISTE' : 'NÃO EXISTE');
      console.log('🔍 [FORM] Usuário após salvamento:', localStorage.getItem('recruta_ai_user') ? 'EXISTE' : 'NÃO EXISTE');
      
      if (resultado.success) {
        console.log('✅ [FORM] Currículo salvo com sucesso no banco!');
        
        // Limpa dados do LinkedIn do localStorage (já foram salvos no banco)
        console.log('🧹 [FORM] Limpando dados do LinkedIn...');
        authService.clearLinkedInResumeData();
        
        console.log('🔍 [FORM] Token após limpar LinkedIn:', localStorage.getItem('recruta_ai_token') ? 'EXISTE' : 'NÃO EXISTE');
        console.log('🔍 [FORM] Usuário após limpar LinkedIn:', localStorage.getItem('recruta_ai_user') ? 'EXISTE' : 'NÃO EXISTE');
        
        // Feedback de sucesso
        toast({
          title: 'Sucesso!',
          description: 'Currículo salvo com sucesso. Redirecionando...',
          variant: 'default'
        });
        
        // Aguarda um pouco para o usuário ver o feedback
        console.log('⏱️ [FORM] Aguardando 1 segundo antes de redirecionar...');
        setTimeout(() => {
          console.log('🔍 [FORM] Token antes de navegar:', localStorage.getItem('recruta_ai_token') ? 'EXISTE' : 'NÃO EXISTE');
          console.log('🔍 [FORM] Usuário antes de navegar:', localStorage.getItem('recruta_ai_user') ? 'EXISTE' : 'NÃO EXISTE');
          console.log('🚀 [FORM] Navegando para /teste-comportamental com curriculoData');
          navigate('/teste-comportamental', {
            state: { curriculoData: formData }
          });
        }, 1000);
      }
    } catch (error) {
      console.error('❌ [FORM] Erro ao salvar currículo:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      console.log('❌ [FORM] Mensagem de erro:', errorMessage);
      
      // Verifica se é erro de autenticação
      if (errorMessage.includes('autenticado') || errorMessage.includes('Token')) {
        console.log('🚪 [FORM] Erro de autenticação detectado. Fazendo logout...');
        
        toast({
          title: 'Sessão expirada',
          description: 'Faça login novamente',
          variant: 'destructive'
        });
        
        // Faz logout e redireciona
        setTimeout(() => {
          authService.logout();
          navigate('/login');
        }, 2000);
      } else {
        console.log('❌ [FORM] Erro não relacionado à autenticação');
        
        toast({
          title: 'Erro ao salvar',
          description: errorMessage,
          variant: 'destructive'
        });
        
        setErrors([errorMessage]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      setIsSaving(false);
      console.log('✅ [FORM] Submit finalizado');
    }
  };

  const updateField = (field: keyof CurriculoData, value: any) => {
    if (!formData) return;
    setFormData({ ...formData, [field]: value });
    setErrors([]);
  };

  const addExperiencia = () => {
    if (!formData) return;
    setFormData({
      ...formData,
      experiencias: [
        ...formData.experiencias,
        {
          cargo: '',
          empresa: '',
          dataInicio: '',
          dataFim: '',
          descricao: '',
          atual: false
        }
      ]
    });
  };

  const removeExperiencia = (index: number) => {
    if (!formData) return;
    setFormData({
      ...formData,
      experiencias: formData.experiencias.filter((_, i) => i !== index)
    });
  };

  const updateExperiencia = (index: number, field: string, value: any) => {
    if (!formData) return;
    const updated = [...formData.experiencias];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, experiencias: updated });
  };

  const addFormacao = () => {
    if (!formData) return;
    setFormData({
      ...formData,
      formacoes: [
        ...formData.formacoes,
        {
          curso: '',
          instituicao: '',
          dataInicio: '',
          dataFim: '',
          status: 'cursando'
        }
      ]
    });
  };

  const removeFormacao = (index: number) => {
    if (!formData) return;
    setFormData({
      ...formData,
      formacoes: formData.formacoes.filter((_, i) => i !== index)
    });
  };

  const updateFormacao = (index: number, field: string, value: any) => {
    if (!formData) return;
    const updated = [...formData.formacoes];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, formacoes: updated });
  };

  // Funções para habilidades
  const addHabilidade = (habilidade: string) => {
    if (!formData || !habilidade.trim()) return;
    if (formData.habilidades.includes(habilidade.trim())) return;
    setFormData({
      ...formData,
      habilidades: [...formData.habilidades, habilidade.trim()]
    });
  };

  const removeHabilidade = (index: number) => {
    if (!formData) return;
    setFormData({
      ...formData,
      habilidades: formData.habilidades.filter((_, i) => i !== index)
    });
  };

  // Funções para idiomas
  const addIdioma = () => {
    if (!formData) return;
    setFormData({
      ...formData,
      idiomas: [
        ...formData.idiomas,
        { idioma: '', nivel: 'basico' }
      ]
    });
  };

  const removeIdioma = (index: number) => {
    if (!formData) return;
    setFormData({
      ...formData,
      idiomas: formData.idiomas.filter((_, i) => i !== index)
    });
  };

  const updateIdioma = (index: number, field: string, value: any) => {
    if (!formData) return;
    const updated = [...formData.idiomas];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, idiomas: updated });
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <div>
            <h2 className="text-xl font-semibold mb-2">
              {dataSource === 'linkedin' 
                ? 'Carregando seus dados do LinkedIn...' 
                : 'Carregando formulário...'}
            </h2>
            <p className="text-muted-foreground">
              {dataSource === 'linkedin'
                ? 'Preparando suas informações profissionais'
                : 'Aguarde um momento...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!formData) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Título e Instruções */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Complete seus dados</h2>
            <p className="text-muted-foreground">
              {dataSource === 'linkedin'
                ? 'Seus dados do LinkedIn foram importados. Revise e complete as informações'
                : dataSource === 'database'
                ? 'Seus dados salvos foram carregados. Você pode editar e salvar novamente'
                : 'Preencha seus dados profissionais'}
            </p>
          </div>

          {/* Badge de origem dos dados */}
          <div className="flex justify-center">
            {dataSource === 'linkedin' && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-sm text-blue-700">
                <Linkedin className="h-4 w-4" />
                <span>Dados importados do LinkedIn</span>
              </div>
            )}
            {dataSource === 'database' && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full text-sm text-green-700">
                <Save className="h-4 w-4" />
                <span>Currículo já salvo no banco de dados</span>
              </div>
            )}
          </div>

          {/* Erros de Validação */}
          {errors.length > 0 && (
            <Card className="border-red-300 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 mb-2">
                      Corrija os seguintes erros:
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Foto de Perfil */}
              {profilePhoto && (
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <img
                      src={profilePhoto}
                      alt="Foto de perfil"
                      className="w-24 h-24 rounded-full object-cover border-4 border-primary/10"
                    />
                    {dataSource === 'linkedin' && (
                      <div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white">
                        <Linkedin className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={formData.nomeCompleto}
                    onChange={(e) => updateField('nomeCompleto', e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => updateField('telefone', e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div>
                  <Label htmlFor="cidade">Cidade *</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => updateField('cidade', e.target.value)}
                    placeholder="Sua cidade"
                  />
                </div>

                <div>
                  <Label htmlFor="estado">Estado *</Label>
                  <select
                    id="estado"
                    value={formData.estado}
                    onChange={(e) => updateField('estado', e.target.value)}
                    className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Selecione o estado</option>
                    <option value="AC">Acre</option>
                    <option value="AL">Alagoas</option>
                    <option value="AP">Amapá</option>
                    <option value="AM">Amazonas</option>
                    <option value="BA">Bahia</option>
                    <option value="CE">Ceará</option>
                    <option value="DF">Distrito Federal</option>
                    <option value="ES">Espírito Santo</option>
                    <option value="GO">Goiás</option>
                    <option value="MA">Maranhão</option>
                    <option value="MT">Mato Grosso</option>
                    <option value="MS">Mato Grosso do Sul</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="PA">Pará</option>
                    <option value="PB">Paraíba</option>
                    <option value="PR">Paraná</option>
                    <option value="PE">Pernambuco</option>
                    <option value="PI">Piauí</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="RN">Rio Grande do Norte</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="RO">Rondônia</option>
                    <option value="RR">Roraima</option>
                    <option value="SC">Santa Catarina</option>
                    <option value="SP">São Paulo</option>
                    <option value="SE">Sergipe</option>
                    <option value="TO">Tocantins</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={formData.linkedinUrl}
                    onChange={(e) => updateField('linkedinUrl', e.target.value)}
                    placeholder="https://linkedin.com/in/seuperfil"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Objetivo Profissional */}
          <Card>
            <CardHeader>
              <CardTitle>Objetivo Profissional</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="objetivo">Descreva seu objetivo profissional</Label>
              <textarea
                id="objetivo"
                className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.objetivoProfissional}
                onChange={(e) => updateField('objetivoProfissional', e.target.value)}
                placeholder="Ex: Desenvolvedor Full Stack com 5 anos de experiência..."
              />
            </CardContent>
          </Card>

          {/* Experiências Profissionais */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Experiência Profissional *</CardTitle>
                <Button onClick={addExperiencia} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.experiencias.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma experiência adicionada. Clique em "Adicionar" para começar.
                </p>
              ) : (
                formData.experiencias.map((exp, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4 relative">
                    <button
                      onClick={() => removeExperiencia(index)}
                      className="absolute top-4 right-4 p-1 hover:bg-red-50 rounded text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                      <div>
                        <Label>Cargo *</Label>
                        <Input
                          value={exp.cargo}
                          onChange={(e) => updateExperiencia(index, 'cargo', e.target.value)}
                          placeholder="Ex: Desenvolvedor Full Stack"
                        />
                      </div>

                      <div>
                        <Label>Empresa *</Label>
                        <Input
                          value={exp.empresa}
                          onChange={(e) => updateExperiencia(index, 'empresa', e.target.value)}
                          placeholder="Ex: Tech Solutions"
                        />
                      </div>

                      <div>
                        <Label>Data Início *</Label>
                        <Input
                          type="month"
                          value={exp.dataInicio}
                          onChange={(e) => updateExperiencia(index, 'dataInicio', e.target.value)}
                        />
                      </div>

                      <div>
                        <Label>Data Fim</Label>
                        <Input
                          type="month"
                          value={exp.dataFim}
                          onChange={(e) => updateExperiencia(index, 'dataFim', e.target.value)}
                          disabled={exp.atual}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={exp.atual}
                            onChange={(e) => {
                              updateExperiencia(index, 'atual', e.target.checked);
                              if (e.target.checked) {
                                updateExperiencia(index, 'dataFim', '');
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">Trabalho aqui atualmente</span>
                        </label>
                      </div>

                      <div className="md:col-span-2">
                        <Label>Descrição das atividades</Label>
                        <textarea
                          className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input"
                          value={exp.descricao}
                          onChange={(e) => updateExperiencia(index, 'descricao', e.target.value)}
                          placeholder="Descreva suas principais responsabilidades..."
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Formação Acadêmica */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Formação Acadêmica *</CardTitle>
                <Button onClick={addFormacao} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.formacoes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma formação adicionada. Clique em "Adicionar" para começar.
                </p>
              ) : (
                formData.formacoes.map((form, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4 relative">
                    <button
                      onClick={() => removeFormacao(index)}
                      className="absolute top-4 right-4 p-1 hover:bg-red-50 rounded text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                      <div className="md:col-span-2">
                        <Label>Curso *</Label>
                        <Input
                          value={form.curso}
                          onChange={(e) => updateFormacao(index, 'curso', e.target.value)}
                          placeholder="Ex: Ciência da Computação"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label>Instituição *</Label>
                        <Input
                          value={form.instituicao}
                          onChange={(e) => updateFormacao(index, 'instituicao', e.target.value)}
                          placeholder="Ex: Universidade de São Paulo"
                        />
                      </div>

                      <div>
                        <Label>Data Início *</Label>
                        <Input
                          type="month"
                          value={form.dataInicio}
                          onChange={(e) => updateFormacao(index, 'dataInicio', e.target.value)}
                        />
                      </div>

                      <div>
                        <Label>Data Fim</Label>
                        <Input
                          type="month"
                          value={form.dataFim}
                          onChange={(e) => updateFormacao(index, 'dataFim', e.target.value)}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label>Status *</Label>
                        <select
                          className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background"
                          value={form.status}
                          onChange={(e) => updateFormacao(index, 'status', e.target.value)}
                        >
                          <option value="cursando">Cursando</option>
                          <option value="completo">Completo</option>
                          <option value="incompleto">Incompleto</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Habilidades */}
          <Card>
            <CardHeader>
              <CardTitle>Habilidades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  id="habilidade-input"
                  placeholder="Ex: JavaScript, React, Python..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.currentTarget;
                      addHabilidade(input.value);
                      input.value = '';
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const input = document.getElementById('habilidade-input') as HTMLInputElement;
                    addHabilidade(input.value);
                    input.value = '';
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.habilidades.map((hab, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm"
                  >
                    <span>{hab}</span>
                    <button
                      onClick={() => removeHabilidade(index)}
                      className="hover:bg-blue-100 rounded-full p-0.5"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              
              {formData.habilidades.length === 0 && (
                <p className="text-center text-muted-foreground py-4 text-sm">
                  Nenhuma habilidade adicionada. Digite e pressione Enter ou clique em "Adicionar".
                </p>
              )}
            </CardContent>
          </Card>

          {/* Idiomas */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Idiomas</CardTitle>
                <Button onClick={addIdioma} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.idiomas.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum idioma adicionado. Clique em "Adicionar" para começar.
                </p>
              ) : (
                formData.idiomas.map((idioma, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4 relative">
                    <button
                      onClick={() => removeIdioma(index)}
                      className="absolute top-4 right-4 p-1 hover:bg-red-50 rounded text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                      <div>
                        <Label>Idioma *</Label>
                        <Input
                          value={idioma.idioma}
                          onChange={(e) => updateIdioma(index, 'idioma', e.target.value)}
                          placeholder="Ex: Inglês"
                        />
                      </div>

                      <div>
                        <Label>Nível *</Label>
                        <select
                          value={idioma.nivel}
                          onChange={(e) => updateIdioma(index, 'nivel', e.target.value)}
                          className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background"
                        >
                          <option value="basico">Básico</option>
                          <option value="intermediario">Intermediário</option>
                          <option value="avancado">Avançado</option>
                          <option value="fluente">Fluente</option>
                          <option value="nativo">Nativo</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Botão Avançar Centralizado */}
          <div className="flex justify-center pt-8 pb-12">
            <Button
              onClick={handleSubmit}
              size="lg"
              className="min-w-[200px]"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Salvar e Continuar
                </>
              )}
            </Button>
          </div>
        </div>
    </div>
  );
}

