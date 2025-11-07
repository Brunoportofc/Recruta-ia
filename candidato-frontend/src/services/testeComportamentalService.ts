// Serviço de Teste Comportamental - MOCADO

export interface Questao {
  id: number;
  pergunta: string;
  opcoes: string[];
  categoriaAnalise: 'lideranca' | 'trabalho_equipe' | 'comunicacao' | 'resolucao_problemas' | 'adaptabilidade';
}

export interface RespostaTeste {
  questaoId: number;
  respostaSelecionada: number; // índice da opção selecionada
}

export interface ResultadoTeste {
  pontuacaoTotal: number;
  categorias: {
    lideranca: number;
    trabalho_equipe: number;
    comunicacao: number;
    resolucao_problemas: number;
    adaptabilidade: number;
  };
  aprovado: boolean;
}

// Questões do teste comportamental
const QUESTOES_TESTE: Questao[] = [
  {
    id: 1,
    pergunta: 'Quando você enfrenta um desafio complexo no trabalho, qual é a sua primeira reação?',
    opcoes: [
      'Analiso o problema e divido em partes menores para resolver uma de cada vez',
      'Peço ajuda imediatamente à equipe ou superiores',
      'Tento resolver sozinho(a) sem envolver outras pessoas',
      'Procuro soluções prontas na internet ou em casos similares'
    ],
    categoriaAnalise: 'resolucao_problemas'
  },
  {
    id: 2,
    pergunta: 'Como você se comporta em situações de trabalho em equipe?',
    opcoes: [
      'Assumo a liderança e coordeno as atividades do grupo',
      'Contribuo com ideias e colaboro ativamente com todos',
      'Prefiro trabalhar nas minhas tarefas individuais',
      'Sigo as instruções dos outros membros'
    ],
    categoriaAnalise: 'trabalho_equipe'
  },
  {
    id: 3,
    pergunta: 'Quando precisa comunicar uma ideia importante para sua equipe, você:',
    opcoes: [
      'Prepara uma apresentação estruturada com dados e exemplos',
      'Conversa informalmente e explica de forma prática',
      'Envia um e-mail detalhado para todos',
      'Espera que alguém pergunte sobre o assunto'
    ],
    categoriaAnalise: 'comunicacao'
  },
  {
    id: 4,
    pergunta: 'Como você reage quando precisa aprender uma nova tecnologia ou processo rapidamente?',
    opcoes: [
      'Me adapto facilmente e busco recursos para aprender sozinho(a)',
      'Peço mentoria de alguém experiente na área',
      'Sinto desconforto mas me esforço para aprender',
      'Prefiro continuar usando métodos que já conheço'
    ],
    categoriaAnalise: 'adaptabilidade'
  },
  {
    id: 5,
    pergunta: 'Quando um colega está com dificuldades em uma tarefa, você:',
    opcoes: [
      'Ofereço ajuda proativamente e compartilho conhecimento',
      'Espero que ele(a) peça ajuda antes de intervir',
      'Foco no meu trabalho, cada um tem suas responsabilidades',
      'Aviso o gestor sobre a situação'
    ],
    categoriaAnalise: 'trabalho_equipe'
  },
  {
    id: 6,
    pergunta: 'Em um projeto com prazos apertados e muita pressão, você:',
    opcoes: [
      'Mantenho a calma e priorizo as tarefas mais importantes',
      'Trabalho horas extras para garantir a entrega',
      'Fico estressado(a) mas consigo entregar',
      'Negocio novos prazos ou redistribuo tarefas'
    ],
    categoriaAnalise: 'resolucao_problemas'
  },
  {
    id: 7,
    pergunta: 'Como você lida com feedbacks negativos sobre seu trabalho?',
    opcoes: [
      'Aceito construtivamente e busco melhorar',
      'Fico chateado(a) mas reconheço que preciso mudar',
      'Discordo e defendo meu ponto de vista',
      'Levo para o lado pessoal e fico desmotivado(a)'
    ],
    categoriaAnalise: 'adaptabilidade'
  },
  {
    id: 8,
    pergunta: 'Quando você identifica um problema que afeta toda a equipe, você:',
    opcoes: [
      'Tomo a iniciativa de propor soluções ao grupo',
      'Comunico ao gestor e aguardo orientações',
      'Discuto com colegas próximos informalmente',
      'Espero que alguém tome a frente'
    ],
    categoriaAnalise: 'lideranca'
  },
  {
    id: 9,
    pergunta: 'Em uma reunião, quando você discorda de uma decisão do grupo, você:',
    opcoes: [
      'Exponho minha opinião com argumentos claros e respeitosos',
      'Aceito a decisão mesmo discordando',
      'Tento convencer os outros da minha forma',
      'Fico em silêncio para evitar conflitos'
    ],
    categoriaAnalise: 'comunicacao'
  },
  {
    id: 10,
    pergunta: 'Como você se motiva quando está trabalhando em tarefas repetitivas?',
    opcoes: [
      'Busco formas de otimizar e tornar o processo mais eficiente',
      'Foco no resultado final e no objetivo maior',
      'Faço pausas regulares para manter a energia',
      'Apenas cumpro a tarefa sem pensar muito'
    ],
    categoriaAnalise: 'adaptabilidade'
  }
];

class TesteComportamentalService {
  getQuestoes(): Questao[] {
    return QUESTOES_TESTE;
  }

  calcularResultado(respostas: RespostaTeste[]): ResultadoTeste {
    // Simulação de cálculo de resultado
    const categorias = {
      lideranca: 0,
      trabalho_equipe: 0,
      comunicacao: 0,
      resolucao_problemas: 0,
      adaptabilidade: 0
    };

    // Calcula pontuação por categoria baseado nas respostas
    respostas.forEach(resposta => {
      const questao = QUESTOES_TESTE.find(q => q.id === resposta.questaoId);
      if (questao) {
        // Pontuação decrescente baseada na opção (primeira opção = mais pontos)
        const pontos = 4 - resposta.respostaSelecionada;
        categorias[questao.categoriaAnalise] += pontos;
      }
    });

    // Normaliza pontuações (0-100)
    const maxPontosPorCategoria = 8; // 2 questões por categoria * 4 pontos max
    Object.keys(categorias).forEach(key => {
      const categoria = key as keyof typeof categorias;
      categorias[categoria] = Math.round((categorias[categoria] / maxPontosPorCategoria) * 100);
    });

    const pontuacaoTotal = Math.round(
      Object.values(categorias).reduce((sum, val) => sum + val, 0) / 5
    );

    // Aprovado se pontuação total >= 50%
    const aprovado = pontuacaoTotal >= 50;

    return {
      pontuacaoTotal,
      categorias,
      aprovado
    };
  }

  async salvarRespostas(respostas: RespostaTeste[]): Promise<ResultadoTeste> {
    // Simula chamada à API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const resultado = this.calcularResultado(respostas);
    
    // Salva no localStorage para demonstração
    localStorage.setItem('teste_comportamental_resultado', JSON.stringify(resultado));
    
    return resultado;
  }
}

export const testeComportamentalService = new TesteComportamentalService();

