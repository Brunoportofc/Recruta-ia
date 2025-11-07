import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, FileText, LogOut, CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';

interface StatusCandidatura {
  etapa: string;
  concluido: boolean;
  atual: boolean;
  data?: string;
}

export default function AreaCandidato() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const novaCandidatura = location.state?.novaCandidatura;
  const resultado = location.state?.resultado;

  const [dadosCandidatura, setDadosCandidatura] = useState<any>(null);
  const [statusTracking, setStatusTracking] = useState<StatusCandidatura[]>([]);

  useEffect(() => {
    // Carrega dados da candidatura do localStorage
    const dadosSalvos = localStorage.getItem('candidatura_dados');
    if (dadosSalvos) {
      const dados = JSON.parse(dadosSalvos);
      setDadosCandidatura(dados);
      
      // Inicializa tracking de status
      inicializarStatusTracking(dados.status);
    } else if (!novaCandidatura) {
      navigate('/welcome');
    }
  }, []);

  const inicializarStatusTracking = (statusAtual: string) => {
    const status: StatusCandidatura[] = [
      {
        etapa: 'Análise do Currículo',
        concluido: statusAtual !== 'analise_curriculo',
        atual: statusAtual === 'analise_curriculo',
        data: statusAtual === 'analise_curriculo' ? new Date().toISOString() : undefined
      },
      {
        etapa: 'Análise dos Testes',
        concluido: ['entrevista', 'finalizado_aprovado', 'finalizado_rejeitado'].includes(statusAtual),
        atual: statusAtual === 'analise_testes',
        data: statusAtual === 'analise_testes' ? new Date().toISOString() : undefined
      },
      {
        etapa: 'Entrevista com Recrutador',
        concluido: ['finalizado_aprovado', 'finalizado_rejeitado'].includes(statusAtual),
        atual: statusAtual === 'entrevista',
        data: statusAtual === 'entrevista' ? new Date().toISOString() : undefined
      },
      {
        etapa: statusAtual === 'finalizado_aprovado' ? 'Aprovado' : statusAtual === 'finalizado_rejeitado' ? 'Não Aprovado' : 'Resultado Final',
        concluido: ['finalizado_aprovado', 'finalizado_rejeitado'].includes(statusAtual),
        atual: false,
        data: ['finalizado_aprovado', 'finalizado_rejeitado'].includes(statusAtual) ? new Date().toISOString() : undefined
      }
    ];
    
    setStatusTracking(status);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getStatusIcon = (status: StatusCandidatura) => {
    if (status.concluido) {
      return <CheckCircle2 className="h-6 w-6 text-green-600" />;
    }
    if (status.atual) {
      return <Clock className="h-6 w-6 text-blue-600 animate-pulse" />;
    }
    return <div className="h-6 w-6 rounded-full border-2 border-gray-300" />;
  };

  const formatarData = (dataISO?: string) => {
    if (!dataISO) return '';
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (!dadosCandidatura && !novaCandidatura) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Mensagem de Boas-vindas (se nova candidatura) */}
          {novaCandidatura && resultado && (
            <Card className="border-2 border-green-300 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">
                      🎉 Candidatura enviada com sucesso!
                    </h3>
                    <p className="text-green-800 mb-3">
                      Seu currículo e teste comportamental foram enviados. 
                      Acompanhe o status da sua candidatura abaixo.
                    </p>
                    {resultado.aprovado && (
                      <div className="text-sm text-green-700">
                        <strong>Pontuação no teste:</strong> {resultado.pontuacaoTotal}% 
                        <span className="ml-2">✓ Aprovado</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Menu de Navegação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card 
              className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary"
              onClick={() => navigate('/meu-perfil')}
            >
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Meu Perfil</CardTitle>
                <CardDescription>
                  Visualize e edite suas informações pessoais e currículo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Acessar Perfil
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary"
              onClick={() => navigate('/minha-candidatura')}
            >
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Minha Candidatura</CardTitle>
                <CardDescription>
                  Acompanhe o status e as etapas do seu processo seletivo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Ver Status
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Status da Candidatura - Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Status da Candidatura</CardTitle>
              <CardDescription>
                Acompanhe em qual etapa você está
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {statusTracking.map((status, index) => (
                  <div key={index} className="relative">
                    <div className="flex items-start gap-4">
                      {/* Ícone */}
                      <div className="relative z-10">
                        {getStatusIcon(status)}
                      </div>

                      {/* Linha conectora */}
                      {index < statusTracking.length - 1 && (
                        <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-gray-300" />
                      )}

                      {/* Conteúdo */}
                      <div className="flex-1 pb-6">
                        <h4 className={`font-semibold ${status.atual ? 'text-blue-600' : status.concluido ? 'text-green-600' : 'text-gray-500'}`}>
                          {status.etapa}
                        </h4>
                        {status.data && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatarData(status.data)}
                          </p>
                        )}
                        {status.atual && (
                          <p className="text-sm text-blue-600 mt-1">
                            Em andamento...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t">
                <Button 
                  onClick={() => navigate('/minha-candidatura')}
                  variant="outline"
                  className="w-full"
                >
                  Ver Detalhes Completos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}

