# 🎨 Integração Frontend - Recruta.ai

Este guia mostra como integrar o frontend React/TypeScript com o backend que usa Prisma.

---

## 📁 Arquivo: `candidato-frontend/src/services/curriculoService.ts`

Crie este arquivo para gerenciar todas as chamadas relacionadas ao currículo:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface ExperienciaData {
  cargo: string;
  empresa: string;
  dataInicio: string; // ISO date string
  dataFim?: string | null;
  atual: boolean;
  descricao?: string;
}

export interface FormacaoData {
  curso: string;
  instituicao: string;
  dataInicio: string;
  dataFim?: string | null;
  status: 'completo' | 'cursando' | 'incompleto';
}

export interface IdiomaData {
  idioma: string;
  nivel: 'basico' | 'intermediario' | 'avancado' | 'fluente' | 'nativo';
}

export interface CertificacaoData {
  nome: string;
  instituicao: string;
  dataEmissao: string;
}

export interface CurriculoCompleto {
  nomeCompleto: string;
  email: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  linkedin?: string;
  objetivoProfissional?: string;
  experiencias: ExperienciaData[];
  formacoes: FormacaoData[];
  habilidades: string[];
  idiomas: IdiomaData[];
  certificacoes: CertificacaoData[];
}

export interface TesteComportamentalData {
  respostas: Array<{
    questaoId: number;
    respostaSelecionada: string;
  }>;
  resultado: {
    [perfil: string]: number;
  };
  perfilDominante: string;
  pontuacaoTotal: number;
  tempoTesteSegundos: number;
}

class CurriculoService {
  /**
   * Salva ou atualiza o currículo completo
   */
  async salvarCurriculo(curriculo: CurriculoCompleto): Promise<{ success: boolean; candidatoId?: string; message?: string }> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetch(`${API_URL}/curriculo/salvar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(curriculo)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao salvar currículo');
    }

    return response.json();
  }

  /**
   * Busca o currículo do candidato logado
   */
  async buscarCurriculo(): Promise<CurriculoCompleto | null> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetch(`${API_URL}/curriculo/buscar`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const error = await response.json();
      throw new Error(error.message || 'Erro ao buscar currículo');
    }

    const data = await response.json();
    return data.curriculo;
  }

  /**
   * Salva resultado do teste comportamental
   */
  async salvarTesteComportamental(teste: TesteComportamentalData): Promise<{ success: boolean; testeId?: string }> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetch(`${API_URL}/curriculo/teste-comportamental`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(teste)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao salvar teste');
    }

    return response.json();
  }

  /**
   * Busca o último teste comportamental realizado
   */
  async buscarUltimoTeste(): Promise<any | null> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetch(`${API_URL}/curriculo/teste-comportamental/ultimo`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const error = await response.json();
      throw new Error(error.message || 'Erro ao buscar teste');
    }

    const data = await response.json();
    return data.teste;
  }
}

export const curriculoService = new CurriculoService();
```

---

## 📝 Usando no Componente FormularioCurriculo

### 1. Importar o serviço

```typescript
import { curriculoService, type CurriculoCompleto } from '@/services/curriculoService';
```

### 2. Buscar currículo ao carregar (se já existir)

```typescript
useEffect(() => {
  const carregarCurriculo = async () => {
    try {
      setIsLoading(true);
      
      // Primeiro tenta buscar do banco
      const curriculoSalvo = await curriculoService.buscarCurriculo();
      
      if (curriculoSalvo) {
        console.log('📄 Currículo carregado do banco');
        setFormData(curriculoSalvo);
        setDataSource('manual'); // ou manter o dataSource do banco
        return;
      }
      
      // Se não existe no banco, usa dados do LinkedIn se disponível
      const linkedInData = authService.getLinkedInResumeData();
      if (linkedInData) {
        console.log('📄 Usando dados do LinkedIn');
        const curriculoData = convertLinkedInDataToCurriculoData(linkedInData);
        setFormData(curriculoData);
        setDataSource('linkedin');
        return;
      }
      
      // Caso contrário, formulário vazio
      setFormData(getEmptyFormData());
      
    } catch (error) {
      console.error('Erro ao carregar currículo:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o currículo',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  carregarCurriculo();
}, []);
```

### 3. Salvar currículo ao submeter formulário

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    setIsLoading(true);
    
    // Validar dados
    const erros = validateCurriculoData(formData);
    if (erros.length > 0) {
      toast({
        title: 'Erro de validação',
        description: erros[0],
        variant: 'destructive'
      });
      return;
    }
    
    // Salvar no banco
    const resultado = await curriculoService.salvarCurriculo(formData);
    
    if (resultado.success) {
      toast({
        title: 'Sucesso!',
        description: 'Currículo salvo com sucesso',
        variant: 'default'
      });
      
      // Limpar dados do LinkedIn do localStorage (já foram salvos no banco)
      authService.clearLinkedInResumeData();
      
      // Navegar para próxima página
      navigate('/teste-comportamental');
    }
    
  } catch (error) {
    console.error('Erro ao salvar currículo:', error);
    toast({
      title: 'Erro',
      description: error instanceof Error ? error.message : 'Erro ao salvar currículo',
      variant: 'destructive'
    });
  } finally {
    setIsLoading(false);
  }
};
```

---

## 🧠 Usando no Teste Comportamental

### 1. Salvar resultado do teste

```typescript
import { curriculoService } from '@/services/curriculoService';

const handleFinalizarTeste = async () => {
  try {
    setIsLoading(true);
    
    const testeData = {
      respostas: respostasArray,
      resultado: calcularResultado(),
      perfilDominante: identificarPerfilDominante(),
      pontuacaoTotal: calcularPontuacaoTotal(),
      tempoTesteSegundos: Math.floor((Date.now() - tempoInicio) / 1000)
    };
    
    const resultado = await curriculoService.salvarTesteComportamental(testeData);
    
    if (resultado.success) {
      toast({
        title: 'Teste concluído!',
        description: 'Seu resultado foi salvo com sucesso'
      });
      
      // Mostrar resultado
      navigate('/resultado-teste');
    }
    
  } catch (error) {
    console.error('Erro ao salvar teste:', error);
    toast({
      title: 'Erro',
      description: 'Não foi possível salvar o resultado do teste',
      variant: 'destructive'
    });
  } finally {
    setIsLoading(false);
  }
};
```

### 2. Buscar último teste (para exibir resultado)

```typescript
useEffect(() => {
  const carregarUltimoTeste = async () => {
    try {
      const teste = await curriculoService.buscarUltimoTeste();
      
      if (teste) {
        setResultadoTeste(teste.resultado);
        setPerfilDominante(teste.perfilDominante);
      }
      
    } catch (error) {
      console.error('Erro ao carregar teste:', error);
    }
  };
  
  carregarUltimoTeste();
}, []);
```

---

## 📊 Usando no Meu Perfil

```typescript
import { curriculoService } from '@/services/curriculoService';

const MeuPerfil = () => {
  const [curriculo, setCurriculo] = useState<CurriculoCompleto | null>(null);
  const [teste, setTeste] = useState<any | null>(null);
  
  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Carregar currículo
        const curriculoData = await curriculoService.buscarCurriculo();
        setCurriculo(curriculoData);
        
        // Carregar último teste
        const testeData = await curriculoService.buscarUltimoTeste();
        setTeste(testeData);
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };
    
    carregarDados();
  }, []);
  
  return (
    <div>
      {curriculo && (
        <div>
          <h2>{curriculo.nomeCompleto}</h2>
          <p>{curriculo.email}</p>
          
          <h3>Experiências</h3>
          {curriculo.experiencias.map((exp, idx) => (
            <div key={idx}>
              <h4>{exp.cargo} - {exp.empresa}</h4>
              <p>{exp.descricao}</p>
            </div>
          ))}
          
          {/* ... resto dos dados ... */}
        </div>
      )}
      
      {teste && (
        <div>
          <h3>Perfil Comportamental</h3>
          <p>Perfil dominante: {teste.perfilDominante}</p>
          {/* ... visualização do resultado ... */}
        </div>
      )}
    </div>
  );
};
```

---

## 🔐 Observações Importantes

### 1. Token JWT
- O token é armazenado no `localStorage` pelo `authService`
- Todas as requisições devem incluir o header `Authorization: Bearer {token}`
- O backend valida o token e extrai o ID do candidato

### 2. Datas
- Todas as datas devem ser enviadas no formato ISO string: `"2023-06-15"`
- Use `new Date().toISOString().split('T')[0]` para converter

### 3. Erro 401 (Unauthorized)
- Se receber 401, o token expirou ou é inválido
- Fazer logout e redirecionar para login

### 4. Tratamento de Erros
```typescript
try {
  await curriculoService.salvarCurriculo(data);
} catch (error) {
  if (error.message.includes('autenticado')) {
    // Token inválido, fazer logout
    authService.logout();
    navigate('/login');
  } else {
    // Outros erros
    toast({ title: 'Erro', description: error.message });
  }
}
```

---

## 🎯 Fluxo Completo

1. **Login com LinkedIn** → Backend salva candidato
2. **Formulário de Currículo** → Frontend envia dados completos
3. **Teste Comportamental** → Frontend envia resultado
4. **Meu Perfil** → Frontend busca todos os dados do banco
5. **Candidaturas** → Frontend usa os dados salvos

---

## ✅ Checklist de Integração

- [ ] Criar `curriculoService.ts`
- [ ] Atualizar `FormularioCurriculo.tsx` para usar o service
- [ ] Atualizar `TesteComportamental.tsx` para salvar resultado
- [ ] Atualizar `MeuPerfil.tsx` para buscar dados do banco
- [ ] Adicionar tratamento de erros em todas as chamadas
- [ ] Testar fluxo completo: Login → Formulário → Teste → Perfil

---

🎉 **Pronto!** O frontend está integrado com o backend usando Prisma!

