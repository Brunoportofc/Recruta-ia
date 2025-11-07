import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { testeComportamentalService, Questao, RespostaTeste } from '@/services/testeComportamentalService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TesteComportamental() {
  const navigate = useNavigate();
  const location = useLocation();
  const curriculoData = location.state?.curriculoData;

  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [respostas, setRespostas] = useState<Map<number, number>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Redireciona se não tiver vindo do formulário
    if (!curriculoData) {
      navigate('/welcome');
      return;
    }

    // Carrega as questões
    const questoesCarregadas = testeComportamentalService.getQuestoes();
    setQuestoes(questoesCarregadas);
  }, []);

  const questao = questoes[questaoAtual];
  const respostaSelecionada = respostas.get(questao?.id);
  const totalQuestoes = questoes.length;
  const progresso = ((questaoAtual + 1) / totalQuestoes) * 100;
  const isUltimaQuestao = questaoAtual === totalQuestoes - 1;
  const todasRespondidas = respostas.size === totalQuestoes;

  const handleSelecionarResposta = (opcaoIndex: number) => {
    if (!questao) return;
    const novasRespostas = new Map(respostas);
    novasRespostas.set(questao.id, opcaoIndex);
    setRespostas(novasRespostas);
  };

  const handleProximaQuestao = () => {
    if (questaoAtual < totalQuestoes - 1) {
      setQuestaoAtual(questaoAtual + 1);
    }
  };

  const handleQuestaoAnterior = () => {
    if (questaoAtual > 0) {
      setQuestaoAtual(questaoAtual - 1);
    }
  };

  const handleFinalizarTeste = async () => {
    if (!todasRespondidas) {
      alert('Por favor, responda todas as questões antes de finalizar.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Converte Map para array de RespostaTeste
      const respostasArray: RespostaTeste[] = Array.from(respostas.entries()).map(
        ([questaoId, respostaSelecionada]) => ({
          questaoId,
          respostaSelecionada
        })
      );

      // Salva as respostas e obtém o resultado
      const resultado = await testeComportamentalService.salvarRespostas(respostasArray);

      // Salva dados completos no localStorage para área do candidato
      const dadosCandidatura = {
        curriculo: curriculoData,
        testeResultado: resultado,
        dataCandidatura: new Date().toISOString(),
        status: 'analise_curriculo' // Status inicial
      };
      
      localStorage.setItem('candidatura_dados', JSON.stringify(dadosCandidatura));

      // Redireciona para área do candidato
      navigate('/area-candidato', {
        state: { 
          novaCandidatura: true,
          resultado 
        }
      });
    } catch (error) {
      console.error('Erro ao finalizar teste:', error);
      alert('Erro ao processar suas respostas. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (questoes.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Título */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Teste Comportamental</h2>
            <p className="text-muted-foreground">
              Responda as questões com sinceridade. Não há respostas certas ou erradas.
            </p>
          </div>

          {/* Barra de Progresso */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Questão {questaoAtual + 1} de {totalQuestoes}</span>
              <span>{Math.round(progresso)}% completo</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300 rounded-full"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>

          {/* Questão */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-xl">
                {questao.pergunta}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {questao.opcoes.map((opcao, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelecionarResposta(index)}
                    className={cn(
                      "w-full p-4 text-left rounded-lg border-2 transition-all hover:border-primary/50",
                      respostaSelecionada === index
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                        respostaSelecionada === index
                          ? "border-primary bg-primary"
                          : "border-gray-300"
                      )}>
                        {respostaSelecionada === index && (
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span className={cn(
                        "flex-1",
                        respostaSelecionada === index
                          ? "font-medium text-primary"
                          : "text-gray-700"
                      )}>
                        {opcao}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Navegação */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handleQuestaoAnterior}
              disabled={questaoAtual === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            <div className="flex-1 flex justify-center">
              <div className="flex gap-1">
                {Array.from({ length: totalQuestoes }).map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      index === questaoAtual
                        ? "w-6 bg-primary"
                        : respostas.has(questoes[index].id)
                        ? "bg-primary/50"
                        : "bg-gray-300"
                    )}
                  />
                ))}
              </div>
            </div>

            {!isUltimaQuestao ? (
              <Button
                onClick={handleProximaQuestao}
                disabled={respostaSelecionada === undefined}
              >
                Próxima
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleFinalizarTeste}
                disabled={!todasRespondidas || isSubmitting}
                className="min-w-[140px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Finalizando...
                  </>
                ) : (
                  'Finalizar Teste'
                )}
              </Button>
            )}
          </div>

          {/* Status das Respostas */}
          <Card className="border-none bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>{respostas.size}</strong> de <strong>{totalQuestoes}</strong> questões respondidas
                  {!todasRespondidas && (
                    <span className="text-muted-foreground ml-1">
                      - Responda todas para finalizar
                    </span>
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Dica */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Dica:</strong> Escolha a opção que melhor representa como você 
              age naturalmente em situações do dia a dia
            </p>
          </div>
        </div>
    </div>
  );
}

