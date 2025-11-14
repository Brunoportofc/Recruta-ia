import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Briefcase, MapPin, DollarSign, Calendar, Building2, ArrowRight, Linkedin, Loader2, CheckCircle2 } from 'lucide-react';

interface Vaga {
  id: string;
  job_title: string;
  company: string;
  description: string;
  location: { text?: string; id?: string } | string; // Formato Unipile ou string legada
  salario?: string;
  employment_status?: string;
  created_at: string;
  job_config?: {
    tests: {
      test1: boolean;
      test2: boolean;
      test3: boolean;
      test4: boolean;
    };
  };
}

export default function CandidaturaVaga() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loginWithLinkedIn } = useAuth();
  const [vaga, setVaga] = useState<Vaga | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  const vagaId = searchParams.get('vaga');

  useEffect(() => {
    // Salva o ID da vaga no localStorage para usar depois do login
    if (vagaId) {
      localStorage.setItem('candidatura_vaga_id', vagaId);
    }

    // Busca dados da vaga
    const carregarVaga = async () => {
      setIsLoading(true);
      try {
        if (!vagaId) {
          throw new Error('ID da vaga não fornecido');
        }

        console.log('🔍 Buscando vaga da API:', vagaId);
        const response = await fetch(`http://localhost:3001/jobs/${vagaId}`);
        
        if (!response.ok) {
          throw new Error('Erro ao buscar vaga');
        }

        const data = await response.json();
        console.log('✅ Vaga carregada:', data);

        const vagaData: Vaga = {
          id: data.id,
          job_title: data.jobTitle,
          company: data.company,
          description: data.description,
          location: data.location,
          salario: data.salaryAnonymous 
            ? 'A combinar' 
            : data.salaryAmount 
            ? `R$ ${data.salaryAmount.toLocaleString('pt-BR')}` 
            : data.salaryMin && data.salaryMax
            ? `R$ ${data.salaryMin.toLocaleString('pt-BR')} - R$ ${data.salaryMax.toLocaleString('pt-BR')}`
            : undefined,
          employment_status: data.employmentStatus,
          created_at: data.createdAt,
          job_config: data.jobConfig || {
            tests: {
              test1: false,
              test2: false,
              test3: false,
              test4: false,
            }
          }
        };

        setVaga(vagaData);
      } catch (error) {
        console.error('❌ Erro ao carregar vaga:', error);
        setVaga(null);
      } finally {
        setIsLoading(false);
      }
    };

    carregarVaga();
  }, [vagaId]);

  // Se já está autenticado, redireciona para o formulário
  useEffect(() => {
    if (user && vagaId) {
      // Pequeno delay para mostrar a tela
      setTimeout(() => {
        navigate(`/formulario-curriculo?vaga=${vagaId}`);
      }, 1000);
    }
  }, [user, vagaId, navigate]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await loginWithLinkedIn();
    } catch (error) {
      console.error('Erro ao conectar:', error);
      setIsConnecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!vaga) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Vaga não encontrada</CardTitle>
            <CardDescription>O link que você acessou não é válido.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Verificar se a vaga está encerrada
  if (vaga.status === 'closed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>🔒 Vaga Encerrada</CardTitle>
            <CardDescription>
              Esta vaga não está mais recebendo candidaturas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                A empresa encerrou o processo seletivo para esta vaga. 
                Agradecemos o seu interesse!
              </p>
              <div className="pt-4">
                <h3 className="font-semibold mb-2">{vaga.job_title}</h3>
                <p className="text-sm text-muted-foreground">{vaga.company}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se o usuário já está autenticado, mostra mensagem de redirecionamento
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Redirecionando...</h3>
            <p className="text-sm text-muted-foreground">
              Você será redirecionado para o formulário de candidatura.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const testesAtivos = vaga.job_config ? Object.values(vaga.job_config.tests).filter(Boolean).length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
            <Briefcase className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Recruta.ai
          </h1>
        </div>

        {/* Card principal */}
        <Card className="border-2 shadow-xl mb-6">
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <CardTitle className="text-2xl md:text-3xl">{vaga.job_title}</CardTitle>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span className="font-medium">{vaga.company}</span>
                </div>
              </div>
              {vaga.employment_status && (
                <Badge variant="secondary" className="ml-4">
                  {vaga.employment_status}
                </Badge>
              )}
            </div>
            <CardDescription className="text-base">
              Candidate-se agora e faça parte do nosso time!
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Informações da vaga */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Localização</p>
                  <p className="font-medium">
                    {typeof vaga.location === 'object' 
                      ? vaga.location?.text || vaga.location?.id || "Não informado"
                      : vaga.location}
                  </p>
                </div>
              </div>

              {vaga.salario && (
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Salário</p>
                    <p className="font-medium">{vaga.salario}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Publicada em</p>
                  <p className="font-medium">
                    {new Date(vaga.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Descrição */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Sobre a vaga</h3>
              <p className="text-muted-foreground whitespace-pre-line">{vaga.description}</p>
            </div>

            {/* Processo seletivo */}
            {testesAtivos > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg mb-3">Processo seletivo</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Formulário de candidatura</span>
                  </div>
                  {testesAtivos > 0 && (
                    <div className="flex items-center gap-2 text-sm mt-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>{testesAtivos} teste{testesAtivos > 1 ? 's' : ''} comportamental{testesAtivos > 1 ? 'is' : ''}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            <Separator />

            {/* Botão de ação */}
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full h-14 text-base"
                onClick={handleConnect}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Linkedin className="h-5 w-5 mr-2" />
                    Conectar com LinkedIn e Candidatar-se
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Ao conectar, você poderá preencher o formulário com seus dados do LinkedIn
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade
        </p>
      </div>
    </div>
  );
}

