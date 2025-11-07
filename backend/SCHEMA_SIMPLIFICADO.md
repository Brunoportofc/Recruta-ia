# 🎯 Schema Simplificado - Prisma

## ✅ O QUE MUDOU

### ANTES (Tabelas Separadas):
```
candidatos
├── experiencias_profissionais (tabela separada)
├── formacoes_academicas (tabela separada)
├── habilidades_candidatos (tabela separada)
├── idiomas_candidatos (tabela separada)
├── certificacoes_candidatos (tabela separada)
└── testes_comportamentais (tabela separada)
```

**Problemas:**
- ❌ Muitas queries para salvar tudo
- ❌ Muitas queries para buscar tudo
- ❌ Complexo de gerenciar
- ❌ Mais lento

### DEPOIS (JSON na mesma tabela):
```
candidatos
├── experiencias (JSON array)
├── formacoes (JSON array)
├── habilidades (JSON array)
├── idiomas (JSON array)
├── certificacoes (JSON array)
└── testesComportamentais (JSON array)
```

**Vantagens:**
- ✅ 1 query para salvar tudo
- ✅ 1 query para buscar tudo
- ✅ Mais simples
- ✅ Muito mais rápido
- ✅ Mais fácil de trabalhar no frontend

---

## 📊 Estrutura da Tabela `candidatos`

```sql
CREATE TABLE candidatos (
  id UUID PRIMARY KEY,
  
  -- Autenticação
  linkedin_id TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  
  -- Dados pessoais
  nome_completo TEXT NOT NULL,
  telefone TEXT,
  cidade TEXT,
  estado VARCHAR(2),
  linkedin_url TEXT,
  foto_perfil_url TEXT,
  objetivo_profissional TEXT,
  
  -- Dados do currículo (JSON)
  experiencias JSONB DEFAULT '[]',
  formacoes JSONB DEFAULT '[]',
  habilidades JSONB DEFAULT '[]',
  idiomas JSONB DEFAULT '[]',
  certificacoes JSONB DEFAULT '[]',
  testes_comportamentais JSONB DEFAULT '[]',
  
  -- Metadados
  origem_dados TEXT,
  perfil_completo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔄 Exemplo de Dados JSON

### Experiências:
```json
[
  {
    "cargo": "Desenvolvedor Full Stack",
    "empresa": "Tech Solutions",
    "dataInicio": "2020-01-01",
    "dataFim": "2023-12-31",
    "atual": false,
    "descricao": "Desenvolvimento de aplicações web..."
  }
]
```

### Formações:
```json
[
  {
    "curso": "Ciência da Computação",
    "instituicao": "USP",
    "dataInicio": "2016-01-01",
    "dataFim": "2020-12-31",
    "status": "completo"
  }
]
```

### Habilidades:
```json
["JavaScript", "React", "Node.js", "PostgreSQL"]
```

### Idiomas:
```json
[
  {
    "idioma": "Português",
    "nivel": "nativo"
  },
  {
    "idioma": "Inglês",
    "nivel": "avancado"
  }
]
```

### Certificações:
```json
[
  {
    "nome": "AWS Certified Developer",
    "instituicao": "Amazon",
    "dataEmissao": "2023-06-15"
  }
]
```

### Testes Comportamentais:
```json
[
  {
    "id": "uuid",
    "respostas": [...],
    "resultado": {...},
    "perfilDominante": "Analista",
    "pontuacaoTotal": 265,
    "tempoTesteSegundos": 420,
    "dataRealizacao": "2024-11-07T..."
  }
]
```

---

## 🚀 Como Usar

### Salvar Currículo (1 query):
```javascript
await prisma.candidato.update({
  where: { id: candidatoId },
  data: {
    nomeCompleto,
    email,
    telefone,
    cidade,
    estado,
    experiencias: [...], // Array JSON
    formacoes: [...],    // Array JSON
    habilidades: [...],  // Array JSON
    idiomas: [...],      // Array JSON
    certificacoes: [...] // Array JSON
  }
});
```

### Buscar Currículo (1 query):
```javascript
const candidato = await prisma.candidato.findUnique({
  where: { id: candidatoId }
});

// Todos os dados já estão aqui!
console.log(candidato.experiencias); // Array
console.log(candidato.formacoes);    // Array
console.log(candidato.habilidades);  // Array
```

---

## 📝 Passos para Aplicar

1. **Pare o backend** (Ctrl+C)

2. **Gere o Prisma Client:**
   ```bash
   cd C:\Users\Porto\Desktop\Recruta.ai\backend
   npx prisma generate
   ```

3. **Aplique no banco:**
   ```bash
   npx prisma db push
   ```

4. **Reinicie o backend:**
   ```bash
   npm run dev
   ```

5. **Teste!** 🎉

---

## ⚠️ Observações

- O Prisma vai **criar novas colunas** na tabela `candidatos`
- Vai **remover as tabelas antigas** (experiencias_profissionais, etc.)
- **Dados antigos serão perdidos** (mas não tem problema, acabou de começar)
- O código do controller **já está atualizado** ✅
- O frontend **não precisa mudar** ✅

---

## 🎯 Resultado Final

**Performance:**
- Antes: ~6 queries para salvar currículo completo
- Depois: **1 query** 🚀

**Simplicidade:**
- Antes: Código complexo com múltiplas transações
- Depois: **Código simples e direto** ✨

**Manutenção:**
- Antes: Difícil de adicionar novos campos
- Depois: **Muito fácil, só atualizar o JSON** 💯

