import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { curriculoService } from '@/services/curriculoService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Edit2, X, Loader2 } from 'lucide-react';

export default function MeuPerfil() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [originalData, setOriginalData] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 [MEU PERFIL] Buscando dados do candidato...');
      const curriculo = await curriculoService.buscarCurriculo();
      
      if (!curriculo) {
        console.log('❌ [MEU PERFIL] Nenhum currículo encontrado');
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar seus dados.',
          variant: 'destructive'
        });
        navigate('/formulario-curriculo');
        return;
      }

      console.log('✅ [MEU PERFIL] Dados carregados com sucesso');
      console.log('📋 [MEU PERFIL] Dados do currículo:', curriculo);
      
      // Normaliza os dados para garantir compatibilidade
      const dadosNormalizados = {
        ...curriculo,
        linkedin: curriculo.linkedin || curriculo.linkedinUrl || '',
        linkedinUrl: curriculo.linkedin || curriculo.linkedinUrl || ''
      };
      
      setOriginalData(dadosNormalizados);
      setFormData(dadosNormalizados);
    } catch (error) {
      console.error('❌ [MEU PERFIL] Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar seus dados.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData) return;

    setIsSaving(true);
    try {
      console.log('💾 [MEU PERFIL] Salvando alterações...');
      
      // Prepara dados para enviar ao backend
      const dadosParaSalvar = {
        nomeCompleto: formData.nomeCompleto,
        email: formData.email,
        telefone: formData.telefone || '',
        cidade: formData.cidade || '',
        estado: formData.estado || '',
        linkedin: formData.linkedin || formData.linkedinUrl || '',
        objetivoProfissional: formData.objetivoProfissional || '',
        experiencias: formData.experiencias || [],
        formacoes: formData.formacoes || [],
        habilidades: formData.habilidades || [],
        idiomas: formData.idiomas || [],
        certificacoes: formData.certificacoes || []
      };

      const resultado = await curriculoService.salvarCurriculo(dadosParaSalvar);
      
      if (resultado.success) {
        console.log('✅ [MEU PERFIL] Dados salvos com sucesso');
        setOriginalData(formData);
        setIsEditing(false);
        
        toast({
          title: 'Sucesso!',
          description: 'Perfil atualizado com sucesso.',
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('❌ [MEU PERFIL] Erro ao salvar:', error);
      toast({
        title: 'Erro ao salvar',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Restaura dados originais
    setFormData({ ...originalData });
    setIsEditing(false);
  };

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  if (!formData) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header da Página com botões */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/area-candidato')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Meu Perfil</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie suas informações pessoais
            </p>
          </div>
        </div>

        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} disabled={isSaving}>
            <Edit2 className="h-4 w-4 mr-2" />
            Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        )}
      </div>
        <div className="space-y-6">
          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Nome Completo</Label>
                  <Input
                    value={formData.nomeCompleto}
                    onChange={(e) => updateField('nomeCompleto', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label>Telefone</Label>
                  <Input
                    value={formData.telefone || ''}
                    onChange={(e) => updateField('telefone', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label>Cidade</Label>
                  <Input
                    value={formData.cidade || ''}
                    onChange={(e) => updateField('cidade', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label>Estado</Label>
                  <Input
                    value={formData.estado || ''}
                    onChange={(e) => updateField('estado', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>LinkedIn</Label>
                  <Input
                    value={formData.linkedin || formData.linkedinUrl || ''}
                    onChange={(e) => updateField('linkedin', e.target.value)}
                    disabled={!isEditing}
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
              <textarea
                className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background disabled:opacity-50 disabled:cursor-not-allowed"
                value={formData.objetivoProfissional || ''}
                onChange={(e) => updateField('objetivoProfissional', e.target.value)}
                disabled={!isEditing}
                placeholder="Descreva seu objetivo profissional..."
              />
            </CardContent>
          </Card>

          {/* Experiência Profissional */}
          <Card>
            <CardHeader>
              <CardTitle>Experiência Profissional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.experiencias?.map((exp: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-lg">{exp.cargo}</h4>
                        <p className="text-muted-foreground">{exp.empresa}</p>
                      </div>
                      {exp.atual && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Atual
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {exp.dataInicio} - {exp.atual ? 'Presente' : exp.dataFim}
                    </p>
                    {exp.descricao && (
                      <p className="text-sm mt-2">{exp.descricao}</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Formação Acadêmica */}
          <Card>
            <CardHeader>
              <CardTitle>Formação Acadêmica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.formacoes?.map((form: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-lg">{form.curso}</h4>
                        <p className="text-muted-foreground">{form.instituicao}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        form.status === 'completo' 
                          ? 'bg-green-100 text-green-800'
                          : form.status === 'cursando'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {form.status === 'completo' ? 'Completo' : 
                         form.status === 'cursando' ? 'Cursando' : 'Incompleto'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {form.dataInicio} - {form.status === 'cursando' ? 'Presente' : form.dataFim}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Habilidades */}
          {formData.habilidades?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Habilidades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {formData.habilidades.map((habilidade: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {habilidade}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Idiomas */}
          {formData.idiomas?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Idiomas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {formData.idiomas.map((idioma: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <span className="font-medium">{idioma.idioma}</span>
                      <span className="text-sm text-muted-foreground capitalize">
                        {idioma.nivel}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
    </div>
  );
}

