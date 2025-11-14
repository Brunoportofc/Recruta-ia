import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Mail, Phone, MapPin, Linkedin, Briefcase, GraduationCap, Languages, Award, Target, Loader2 } from 'lucide-react';

interface Candidatura {
  id: string;
  candidatoId: string;
  vagaId: string;
  status: string;
  dataCandidatura: string;
  candidato: {
    nomeCompleto: string;
    email: string;
    telefone?: string;
    cidade?: string;
    estado?: string;
    linkedinUrl?: string;
    fotoPerfilUrl?: string;
  };
  curriculoSnapshot: {
    nomeCompleto: string;
    email: string;
    telefone?: string;
    cidade?: string;
    estado?: string;
    linkedinUrl?: string;
    objetivoProfissional?: string;
    experiencias?: Array<{
      cargo: string;
      empresa: string;
      dataInicio: string;
      dataFim?: string;
      descricao?: string;
      atual: boolean;
    }>;
    formacoes?: Array<{
      curso: string;
      instituicao: string;
      dataInicio: string;
      dataFim?: string;
      status: 'completo' | 'cursando' | 'incompleto';
    }>;
    habilidades?: string[];
    idiomas?: Array<{
      idioma: string;
      nivel: 'basico' | 'intermediario' | 'avancado' | 'fluente' | 'nativo';
    }>;
    certificacoes?: Array<{
      nome: string;
      instituicao: string;
      dataEmissao: string;
    }>;
  };
}

const nivelIdioma = {
  basico: 'Básico',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
  fluente: 'Fluente',
  nativo: 'Nativo'
};

const statusFormacao = {
  completo: 'Completo',
  cursando: 'Cursando',
  incompleto: 'Incompleto'
};

export default function CurriculoView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidatura, setCandidatura] = useState<Candidatura | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const carregarCandidatura = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        console.log('📋 [CURRICULO VIEW] Buscando candidatura:', id);
        const response = await fetch(`http://localhost:3001/candidatura/${id}`);
        
        if (!response.ok) {
          throw new Error('Candidatura não encontrada');
        }

        const data = await response.json();
        console.log('✅ [CURRICULO VIEW] Candidatura carregada:', data);
        setCandidatura(data.data);
      } catch (error) {
        console.error('❌ [CURRICULO VIEW] Erro ao carregar candidatura:', error);
        setCandidatura(null);
      } finally {
        setIsLoading(false);
      }
    };

    carregarCandidatura();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!candidatura) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Candidatura não encontrada</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dados pessoais SEMPRE atualizados da tabela candidatos
  const dadosPessoais = candidatura.candidato;
  
  // Currículo completo (experiências, formações, etc) do snapshot
  const curriculo = candidatura.curriculoSnapshot;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Currículo</h1>
          <p className="text-muted-foreground mt-1">
            Visualização completa do currículo do candidato
          </p>
        </div>
      </div>

      {/* Informações Pessoais - SEMPRE ATUALIZADAS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Informações Pessoais
            <Badge variant="secondary" className="ml-2 text-xs">Atualizado</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{dadosPessoais.email}</p>
              </div>
            </div>

            {dadosPessoais.telefone && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{dadosPessoais.telefone}</p>
                </div>
              </div>
            )}

            {(dadosPessoais.cidade || dadosPessoais.estado) && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Localização</p>
                  <p className="font-medium">
                    {dadosPessoais.cidade && dadosPessoais.estado
                      ? `${dadosPessoais.cidade}, ${dadosPessoais.estado}`
                      : dadosPessoais.cidade || dadosPessoais.estado}
                  </p>
                </div>
              </div>
            )}

            {dadosPessoais.linkedinUrl && (
              <div className="flex items-start gap-3">
                <Linkedin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">LinkedIn</p>
                  <a
                    href={dadosPessoais.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    Ver perfil
                  </a>
                </div>
              </div>
            )}
          </div>

          {curriculo.objetivoProfissional && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-2">Objetivo Profissional</p>
                <p className="text-sm leading-relaxed">{curriculo.objetivoProfissional}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Experiências */}
      {curriculo.experiencias && curriculo.experiencias.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Experiência Profissional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {curriculo.experiencias.map((exp, index) => (
              <div key={index}>
                {index > 0 && <Separator className="mb-6" />}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{exp.cargo}</h3>
                      <p className="text-muted-foreground">{exp.empresa}</p>
                    </div>
                    {exp.atual && (
                      <Badge variant="default">Atual</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(exp.dataInicio).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                    {' - '}
                    {exp.atual ? 'Presente' : exp.dataFim ? new Date(exp.dataFim).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : 'Não informado'}
                  </p>
                  {exp.descricao && (
                    <p className="text-sm leading-relaxed mt-2">{exp.descricao}</p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Formação */}
      {curriculo.formacoes && curriculo.formacoes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Formação Acadêmica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {curriculo.formacoes.map((form, index) => (
              <div key={index}>
                {index > 0 && <Separator className="mb-6" />}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{form.curso}</h3>
                      <p className="text-muted-foreground">{form.instituicao}</p>
                    </div>
                    <Badge variant="secondary">
                      {statusFormacao[form.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(form.dataInicio).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                    {' - '}
                    {form.status === 'cursando' ? 'Presente' : form.dataFim ? new Date(form.dataFim).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : 'Não informado'}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Habilidades */}
      {curriculo.habilidades && curriculo.habilidades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Habilidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {curriculo.habilidades.map((habilidade, index) => (
                <Badge key={index} variant="secondary">
                  {habilidade}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Idiomas */}
      {curriculo.idiomas && curriculo.idiomas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              Idiomas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {curriculo.idiomas.map((idioma, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">{idioma.idioma}</span>
                  <Badge variant="outline">{nivelIdioma[idioma.nivel]}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certificações */}
      {curriculo.certificacoes && curriculo.certificacoes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Certificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {curriculo.certificacoes.map((cert, index) => (
              <div key={index}>
                {index > 0 && <Separator className="mb-4" />}
                <div className="space-y-1">
                  <h3 className="font-semibold">{cert.nome}</h3>
                  <p className="text-sm text-muted-foreground">{cert.instituicao}</p>
                  <p className="text-xs text-muted-foreground">
                    Emitido em {new Date(cert.dataEmissao).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
