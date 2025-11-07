import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ClipboardCheck, 
  Users, 
  Award,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusEtapa {
  id: string;
  titulo: string;
  descricao: string;
  icon: any;
  status: 'concluido' | 'em_andamento' | 'pendente' | 'rejeitado';
  data?: string;
  detalhes?: string;
}

export default function MinhaCandidatura() {
  const navigate = useNavigate();
  const [dadosCandidatura, setDadosCandidatura] = useState<any>(null);
  const [etapas, setEtapas] = useState<StatusEtapa[]>([]);

  useEffect(() => {
    const dadosSalvos = localStorage.getItem('candidatura_dados');
    if (dadosSalvos) {
      const dados = JSON.parse(dadosSalvos);
      setDadosCandidatura(dados);
      montarEtapas(dados);
    } else {
      navigate('/welcome');
    }
  }, []);

  const montarEtapas = (dados: any) => {
    const statusAtual = dados.status || 'analise_curriculo';
    
    const etapasBase: StatusEtapa[] = [
      {
        id: 'analise_curriculo',
        titulo: 'Análise do Currículo',
        descricao: 'Seu currículo está sendo analisado pela nossa equipe de recrutamento',
        icon: FileText,
        status: getStatusEtapa(statusAtual, 'analise_curriculo'),
        data: statusAtual === 'analise_curriculo' ? dados.dataCandidatura : undefined,
        detalhes: 'Tempo médio de análise: 2-3 dias úteis'
      },
      {
        id: 'analise_testes',
        titulo: 'Análise dos Testes',
        descricao: 'Estamos avaliando os resultados do seu teste comportamental',
        icon: ClipboardCheck,
        status: getStatusEtapa(statusAtual, 'analise_testes'),
        data: statusAtual === 'analise_testes' ? new Date().toISOString() : undefined,
        detalhes: dados.testeResultado ? `Pontuação: ${dados.testeResultado.pontuacaoTotal}%` : undefined
      },
      {
        id: 'entrevista',
        titulo: 'Entrevista com Recrutador',
        descricao: 'Você será contatado para agendar uma entrevista',
        icon: Users,
        status: getStatusEtapa(statusAtual, 'entrevista'),
        data: statusAtual === 'entrevista' ? new Date().toISOString() : undefined,
        detalhes: 'Duração média: 30-45 minutos'
      },
      {
        id: 'resultado',
        titulo: getStatusFinal(statusAtual),
        descricao: getDescricaoFinal(statusAtual),
        icon: statusAtual === 'finalizado_aprovado' ? Award : statusAtual === 'finalizado_rejeitado' ? XCircle : AlertCircle,
        status: getStatusEtapa(statusAtual, 'resultado'),
        data: ['finalizado_aprovado', 'finalizado_rejeitado'].includes(statusAtual) ? new Date().toISOString() : undefined
      }
    ];

    setEtapas(etapasBase);
  };

  const getStatusEtapa = (statusAtual: string, etapaId: string): 'concluido' | 'em_andamento' | 'pendente' | 'rejeitado' => {
    const ordem = ['analise_curriculo', 'analise_testes', 'entrevista', 'resultado'];
    const indexAtual = ordem.findIndex(e => statusAtual.includes(e));
    const indexEtapa = ordem.indexOf(etapaId);

    if (statusAtual === 'finalizado_rejeitado' && etapaId === 'resultado') {
      return 'rejeitado';
    }

    if (indexEtapa < indexAtual) {
      return 'concluido';
    } else if (indexEtapa === indexAtual) {
      return 'em_andamento';
    } else {
      return 'pendente';
    }
  };

  const getStatusFinal = (status: string): string => {
    if (status === 'finalizado_aprovado') return 'Aprovado! 🎉';
    if (status === 'finalizado_rejeitado') return 'Não Aprovado';
    return 'Resultado Final';
  };

  const getDescricaoFinal = (status: string): string => {
    if (status === 'finalizado_aprovado') {
      return 'Parabéns! Você foi aprovado(a) no processo seletivo';
    }
    if (status === 'finalizado_rejeitado') {
      return 'Infelizmente não seguiremos com sua candidatura desta vez';
    }
    return 'Aguarde o resultado final do processo';
  };

  const getStatusIcon = (etapa: StatusEtapa) => {
    const Icon = etapa.icon;
    
    if (etapa.status === 'concluido') {
      return (
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
      );
    }
    
    if (etapa.status === 'em_andamento') {
      return (
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <Clock className="h-6 w-6 text-blue-600 animate-pulse" />
        </div>
      );
    }

    if (etapa.status === 'rejeitado') {
      return (
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
          <XCircle className="h-6 w-6 text-red-600" />
        </div>
      );
    }
    
    return (
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
        <Icon className="h-6 w-6 text-gray-400" />
      </div>
    );
  };

  const formatarData = (dataISO?: string) => {
    if (!dataISO) return '';
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Simular mudança de status (DEMO)
  const simularProximaEtapa = () => {
    if (!dadosCandidatura) return;

    const statusSequence = [
      'analise_curriculo',
      'analise_testes',
      'entrevista',
      'finalizado_aprovado'
    ];

    const currentIndex = statusSequence.indexOf(dadosCandidatura.status);
    if (currentIndex < statusSequence.length - 1) {
      const novoStatus = statusSequence[currentIndex + 1];
      const dadosAtualizados = {
        ...dadosCandidatura,
        status: novoStatus
      };
      
      localStorage.setItem('candidatura_dados', JSON.stringify(dadosAtualizados));
      setDadosCandidatura(dadosAtualizados);
      montarEtapas(dadosAtualizados);
    }
  };

  if (!dadosCandidatura) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header da Página */}
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/area-candidato')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Minha Candidatura</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe o status do seu processo seletivo
          </p>
        </div>
      </div>
        <div className="space-y-8">
          {/* Informações da Candidatura */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Candidatura</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Data de Envio</p>
                  <p className="font-medium">
                    {formatarData(dadosCandidatura.dataCandidatura)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{dadosCandidatura.curriculo?.nomeCompleto}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{dadosCandidatura.curriculo?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline de Status */}
          <Card>
            <CardHeader>
              <CardTitle>Progresso da Candidatura</CardTitle>
              <CardDescription>
                Acompanhe as etapas do seu processo seletivo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {etapas.map((etapa, index) => (
                  <div key={etapa.id} className="relative">
                    <div className="flex gap-4">
                      {/* Ícone e Linha */}
                      <div className="relative flex flex-col items-center">
                        {getStatusIcon(etapa)}
                        {index < etapas.length - 1 && (
                          <div className={cn(
                            "w-0.5 h-16 mt-2",
                            etapa.status === 'concluido' ? 'bg-green-300' : 'bg-gray-300'
                          )} />
                        )}
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 pb-8">
                        <div className={cn(
                          "font-semibold text-lg mb-1",
                          etapa.status === 'concluido' && 'text-green-600',
                          etapa.status === 'em_andamento' && 'text-blue-600',
                          etapa.status === 'rejeitado' && 'text-red-600',
                          etapa.status === 'pendente' && 'text-gray-500'
                        )}>
                          {etapa.titulo}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {etapa.descricao}
                        </p>

                        {etapa.data && (
                          <p className="text-xs text-muted-foreground mb-2">
                            📅 {formatarData(etapa.data)}
                          </p>
                        )}

                        {etapa.detalhes && (
                          <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full mt-2">
                            {etapa.detalhes}
                          </div>
                        )}

                        {etapa.status === 'em_andamento' && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                              ⏳ Esta etapa está em andamento. Você será notificado assim que houver atualizações.
                            </p>
                          </div>
                        )}

                        {etapa.status === 'rejeitado' && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">
                              Agradecemos seu interesse. Continue buscando novas oportunidades!
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Botão Demo - Simular Progresso */}
          <Card className="border-2 border-dashed">
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  🎭 <strong>Modo Demo:</strong> Simule o avanço para a próxima etapa
                </p>
                <Button 
                  onClick={simularProximaEtapa}
                  variant="outline"
                  disabled={dadosCandidatura.status === 'finalizado_aprovado'}
                >
                  Simular Próxima Etapa
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}

