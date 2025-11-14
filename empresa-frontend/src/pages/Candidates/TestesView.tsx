import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle2, XCircle, Clock, Target, Loader2 } from 'lucide-react';

interface Candidatura {
  id: string;
  candidatoId: string;
  vagaId: string;
  status: string;
  dataCandidatura: string;
  candidato: {
    nomeCompleto: string;
    email: string;
  };
  testeResultado: {
    respostas: Array<{
      questaoId: number;
      respostaSelecionada: number;
    }>;
    dataRealizacao: string;
    totalQuestoes: number;
  };
}

export default function TestesView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidatura, setCandidatura] = useState<Candidatura | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const carregarCandidatura = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        console.log('🧠 [TESTES VIEW] Buscando candidatura:', id);
        const response = await fetch(`http://localhost:3001/candidatura/${id}`);
        
        if (!response.ok) {
          throw new Error('Candidatura não encontrada');
        }

        const data = await response.json();
        console.log('✅ [TESTES VIEW] Candidatura carregada:', data);
        setCandidatura(data.data);
      } catch (error) {
        console.error('❌ [TESTES VIEW] Erro ao carregar candidatura:', error);
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

  if (!candidatura.testeResultado || !candidatura.testeResultado.respostas) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Testes não disponíveis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Este candidato ainda não completou os testes comportamentais.
            </p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const teste = candidatura.testeResultado;

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
          <h1 className="text-3xl font-bold tracking-tight">Resultados dos Testes</h1>
          <p className="text-muted-foreground mt-1">
            {candidatura.candidato.nomeCompleto}
          </p>
        </div>
      </div>

      {/* Resumo do Teste */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Resumo do Teste Comportamental
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Questões</p>
                <p className="text-2xl font-bold">{teste.totalQuestoes}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <CheckCircle2 className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Respostas</p>
                <p className="text-2xl font-bold">{teste.respostas.length}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Clock className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Data de Realização</p>
                <p className="text-sm font-semibold">
                  {new Date(teste.dataRealizacao).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Taxa de Conclusão</span>
              <span className="text-sm font-bold">100%</span>
            </div>
            <Progress value={100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Respostas Detalhadas */}
      <Card>
        <CardHeader>
          <CardTitle>Respostas das Questões</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {teste.respostas.map((resposta, index) => (
            <div key={index}>
              {index > 0 && <Separator className="mb-6" />}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">Questão {resposta.questaoId}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Pergunta comportamental sobre perfil profissional
                    </p>
                  </div>
                </div>

                <div className="pl-4 border-l-2 border-primary">
                  <p className="text-sm font-medium mb-2">Resposta selecionada:</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">
                      Alternativa {resposta.respostaSelecionada + 1}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Nota sobre análise */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Sobre a análise dos testes</p>
              <p className="text-sm text-muted-foreground">
                Os testes comportamentais são avaliados de forma holística, considerando o perfil da vaga e as competências necessárias. 
                As respostas acima representam as escolhas do candidato durante o processo seletivo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
