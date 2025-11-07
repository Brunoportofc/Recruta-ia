# 🚀 Configuração do Prisma - Recruta.ai

## 📋 Passo a Passo

### 1️⃣ Criar arquivo .env

Crie um arquivo `.env` na pasta `backend` com o seguinte conteúdo:

```bash
# LinkedIn OAuth 2.0
LINKEDIN_CLIENT_ID=86xmzv42q5v899
LINKEDIN_CLIENT_SECRET=WPL_AP1.NDFloNcXOXs0pdpV.c/5XSg==
LINKEDIN_REDIRECT_URI=http://localhost:5174/auth/linkedin/callback

# JWT Secret
JWT_SECRET=recruta-ai-super-secret-jwt-key-2024

# Servidor
PORT=3001
FRONTEND_URL=http://localhost:5174

# Database - Supabase PostgreSQL
DATABASE_URL="postgresql://postgres.pmcuejsknpsirjfmawhj:Recrutaia12@aws-1-us-east-2.pooler.supabase.com:5432/postgres"

# Supabase (opcional)
SUPABASE_URL=https://pmcuejsknpsirjfmawhj.supabase.co
SUPABASE_ANON_KEY=
```

### 2️⃣ Instalar dependências (já feito!)

```bash
npm install
```

### 3️⃣ Gerar Prisma Client (já feito!)

```bash
npx prisma generate
```

### 4️⃣ Criar tabelas no banco de dados

```bash
npx prisma db push
```

Este comando vai criar TODAS as tabelas no seu banco Supabase:
- ✅ `candidatos`
- ✅ `experiencias_profissionais`
- ✅ `formacoes_academicas`
- ✅ `habilidades_candidatos`
- ✅ `idiomas_candidatos`
- ✅ `certificacoes_candidatos`
- ✅ `testes_comportamentais`
- ✅ `jobs`
- ✅ `candidaturas`

### 5️⃣ (Opcional) Visualizar banco no Prisma Studio

```bash
npx prisma studio
```

Isso abre uma interface web em `http://localhost:5555` onde você pode ver e editar dados!

---

## 📊 Estrutura do Banco

### Tabela: candidatos
Dados principais dos candidatos:
- Nome, email, telefone
- Localização (cidade/estado)
- LinkedIn ID e URL
- Foto de perfil
- Objetivo profissional

### Tabelas Relacionadas:
- **experiencias_profissionais** - Histórico de trabalho
- **formacoes_academicas** - Educação
- **habilidades_candidatos** - Skills técnicas
- **idiomas_candidatos** - Idiomas e níveis
- **certificacoes_candidatos** - Certificações e cursos
- **testes_comportamentais** - Resultados dos testes
- **candidaturas** - Candidaturas às vagas

### Tabela: jobs
Vagas disponíveis para candidatura

### Tabela: candidaturas
Liga candidatos às vagas com status e timeline

---

## 🔧 Como Usar o Prisma no Código

### 1. Importar o Prisma Client

```javascript
import prisma from './lib/prisma.js';
```

### 2. Exemplos de Queries

#### Criar um candidato:
```javascript
const candidato = await prisma.candidato.create({
  data: {
    email: 'bruno@exemplo.com',
    nomeCompleto: 'Bruno Porto',
    telefone: '(11) 98765-4321',
    cidade: 'São Paulo',
    estado: 'SP',
    linkedinId: 'fvdlmZOmOk',
    origemDados: 'linkedin'
  }
});
```

#### Buscar candidato com todas as relações:
```javascript
const candidato = await prisma.candidato.findUnique({
  where: { email: 'bruno@exemplo.com' },
  include: {
    experiencias: true,
    formacoes: true,
    habilidades: true,
    idiomas: true,
    certificacoes: true,
    testesComportamentais: true,
    candidaturas: {
      include: {
        job: true
      }
    }
  }
});
```

#### Adicionar experiência profissional:
```javascript
const experiencia = await prisma.experienciaProfissional.create({
  data: {
    candidatoId: candidato.id,
    cargo: 'Desenvolvedor Full Stack',
    empresa: 'Tech Solutions',
    dataInicio: new Date('2020-01-01'),
    dataFim: new Date('2023-12-31'),
    atual: false,
    descricao: 'Desenvolvimento de aplicações web...',
    ordem: 0
  }
});
```

#### Criar candidatura:
```javascript
const candidatura = await prisma.candidatura.create({
  data: {
    candidatoId: candidato.id,
    jobId: job.id,
    status: 'analise_curriculo',
    curriculoSnapshot: {
      nomeCompleto: candidato.nomeCompleto,
      email: candidato.email,
      // ... outros dados
    },
    origemAplicacao: 'plataforma'
  }
});
```

#### Atualizar status da candidatura:
```javascript
await prisma.candidatura.update({
  where: { id: candidatura.id },
  data: {
    status: 'entrevista_rh',
    feedbackCandidato: 'Parabéns! Você foi aprovado para a próxima etapa.'
  }
});
```

---

## 🛠️ Comandos Úteis

```bash
# Gerar Prisma Client após mudar schema
npx prisma generate

# Aplicar mudanças no banco (development)
npx prisma db push

# Criar migration (production)
npx prisma migrate dev --name nome_da_migration

# Abrir Prisma Studio (GUI do banco)
npx prisma studio

# Ver status do banco
npx prisma db pull

# Resetar banco (CUIDADO!)
npx prisma db push --force-reset
```

---

## 📝 Scripts no package.json

Adicione ao `package.json`:

```json
{
  "scripts": {
    "prisma:generate": "prisma generate",
    "prisma:push": "prisma db push",
    "prisma:studio": "prisma studio",
    "prisma:seed": "node prisma/seed.js"
  }
}
```

Uso:
```bash
npm run prisma:push
npm run prisma:studio
```

---

## 🎯 Próximos Passos

1. ✅ Criar arquivo `.env` (copie de `.env.example.complete`)
2. ✅ Executar `npx prisma db push`
3. ✅ Verificar tabelas no Prisma Studio
4. ✅ Começar a usar o Prisma nos controllers!

---

## 🔗 Documentação Oficial

- [Prisma Docs](https://www.prisma.io/docs)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Prisma + Supabase](https://www.prisma.io/docs/guides/database/supabase)

