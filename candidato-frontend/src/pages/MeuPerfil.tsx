import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Edit2, X } from 'lucide-react';

export default function MeuPerfil() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [dadosCandidatura, setDadosCandidatura] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    const dadosSalvos = localStorage.getItem('candidatura_dados');
    if (dadosSalvos) {
      const dados = JSON.parse(dadosSalvos);
      setDadosCandidatura(dados);
      setFormData(dados.curriculo);
    } else {
      navigate('/welcome');
    }
  }, []);

  const handleSave = () => {
    if (!dadosCandidatura || !formData) return;

    // Atualiza os dados no localStorage
    const dadosAtualizados = {
      ...dadosCandidatura,
      curriculo: formData
    };
    
    localStorage.setItem('candidatura_dados', JSON.stringify(dadosAtualizados));
    setDadosCandidatura(dadosAtualizados);
    setIsEditing(false);
    
    alert('Perfil atualizado com sucesso!');
  };

  const handleCancel = () => {
    // Restaura dados originais
    setFormData(dadosCandidatura?.curriculo);
    setIsEditing(false);
  };

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

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
          <Button onClick={() => setIsEditing(true)}>
            <Edit2 className="h-4 w-4 mr-2" />
            Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
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
                    value={formData.telefone}
                    onChange={(e) => updateField('telefone', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label>Cidade</Label>
                  <Input
                    value={formData.cidade}
                    onChange={(e) => updateField('cidade', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label>Estado</Label>
                  <Input
                    value={formData.estado}
                    onChange={(e) => updateField('estado', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>LinkedIn</Label>
                  <Input
                    value={formData.linkedinUrl}
                    onChange={(e) => updateField('linkedinUrl', e.target.value)}
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
                value={formData.objetivoProfissional}
                onChange={(e) => updateField('objetivoProfissional', e.target.value)}
                disabled={!isEditing}
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

