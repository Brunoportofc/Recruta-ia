# 🎯 Prisma + Supabase - Recruta.ai

## ✅ O QUE FOI FEITO

### 1. Configuração do Prisma
- ✅ Instalado Prisma ORM
- ✅ Criado schema completo em `prisma/schema.prisma`
- ✅ Conectado ao Supabase PostgreSQL
- ✅ Todas as tabelas criadas no banco

### 2. Tabelas Criadas

#### 📊 **candidatos**
Tabela principal com dados do candidato:
- `id` (UUID)
- `linkedinId`, `email`, `nomeCompleto`
- `telefone`, `cidade`, `estado`
- `linkedinUrl`, `fotoPerfilUrl`
- `objetivoProfissional`
- `origemDados` ('linkedin' ou 'manual')
- `perfilCompleto` (boolean)

#### 📊 **experiencias_profissionais**
- `cargo`, `empresa`
- `dataInicio`, `dataFim`, `atual`
- `descricao`
- `ordem` (para ordenação)

#### 📊 **formacoes_academicas**
- `curso`, `instituicao`
- `dataInicio`, `dataFim`
- `status` ('completo', 'cursando', 'incompleto')
- `ordem`

#### 📊 **habilidades_candidatos**
- `nome` (nome da habilidade)
- `ordem`

#### 📊 **idiomas_candidatos**
- `idioma`, `nivel`
- `ordem`

#### 📊 **certificacoes_candidatos**
- `nome`, `instituicao`, `dataEmissao`
- `ordem`

#### 📊 **testes_comportamentais**
- `respostas` (JSON com as respostas)
- `resultado` (JSON com o resultado)
- `perfilDominante`, `pontuacaoTotal`
- `tempoTesteSegundos`

#### 📊 **jobs**
- Tabela de vagas (já existente, atualizada)

#### 📊 **candidaturas**
- Liga candidatos às vagas
- `status` (analise_curriculo, teste_tecnico, entrevista_rh, etc)
- `curriculoSnapshot` (JSON com snapshot do currículo)
- Timeline completa

---

## 🚀 COMO USAR

### Backend já está configurado com:

#### 1. **Login com LinkedIn** → Salva candidato automaticamente
Quando o usuário faz login com LinkedIn, o backend:
1. Obtém dados do LinkedIn
2. Cria/atualiza o candidato no banco
3. Retorna token JWT com ID do candidato

#### 2. **Salvar Currículo Completo**

**Endpoint:** `POST /curriculo/salvar`

**Headers:**
```
Authorization: Bearer {token_jwt}
```

**Body:**
```json
{
  "nomeCompleto": "Bruno Porto",
  "email": "bruno@exemplo.com",
  "telefone": "(11) 98765-4321",
  "cidade": "São Paulo",
  "estado": "SP",
  "linkedin": "https://linkedin.com/in/brunoporto",
  "objetivoProfissional": "Desenvolvedor Full Stack",
  
  "experiencias": [
    {
      "cargo": "Desenvolvedor Full Stack",
      "empresa": "Tech Solutions",
      "dataInicio": "2020-01-01",
      "dataFim": "2023-12-31",
      "atual": false,
      "descricao": "Desenvolvimento de aplicações web..."
    }
  ],
  
  "formacoes": [
    {
      "curso": "Ciência da Computação",
      "instituicao": "USP",
      "dataInicio": "2016-01-01",
      "dataFim": "2020-12-31",
      "status": "completo"
    }
  ],
  
  "habilidades": ["JavaScript", "React", "Node.js", "PostgreSQL"],
  
  "idiomas": [
    {
      "idioma": "Português",
      "nivel": "nativo"
    },
    {
      "idioma": "Inglês",
      "nivel": "avancado"
    }
  ],
  
  "certificacoes": [
    {
      "nome": "AWS Certified Developer",
      "instituicao": "Amazon",
      "dataEmissao": "2023-06-15"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Currículo salvo com sucesso",
  "candidatoId": "uuid-do-candidato"
}
```

#### 3. **Buscar Currículo**

**Endpoint:** `GET /curriculo/buscar`

**Headers:**
```
Authorization: Bearer {token_jwt}
```

**Response:**
```json
{
  "success": true,
  "curriculo": {
    "nomeCompleto": "Bruno Porto",
    "email": "bruno@exemplo.com",
    "telefone": "(11) 98765-4321",
    "cidade": "São Paulo",
    "estado": "SP",
    "linkedin": "https://linkedin.com/in/brunoporto",
    "fotoPerfil": "https://...",
    "objetivoProfissional": "Desenvolvedor Full Stack",
    "perfilCompleto": true,
    
    "experiencias": [...],
    "formacoes": [...],
    "habilidades": ["JavaScript", "React", ...],
    "idiomas": [...],
    "certificacoes": [...]
  }
}
```

#### 4. **Salvar Teste Comportamental**

**Endpoint:** `POST /curriculo/teste-comportamental`

**Headers:**
```
Authorization: Bearer {token_jwt}
```

**Body:**
```json
{
  "respostas": [
    {
      "questaoId": 1,
      "respostaSelecionada": "A"
    }
  ],
  "resultado": {
    "comunicador": 75,
    "executor": 50,
    "planejador": 60,
    "analista": 80
  },
  "perfilDominante": "Analista",
  "pontuacaoTotal": 265,
  "tempoTesteSegundos": 420
}
```

**Response:**
```json
{
  "success": true,
  "message": "Teste comportamental salvo com sucesso",
  "testeId": "uuid-do-teste"
}
```

#### 5. **Buscar Último Teste**

**Endpoint:** `GET /curriculo/teste-comportamental/ultimo`

**Headers:**
```
Authorization: Bearer {token_jwt}
```

**Response:**
```json
{
  "success": true,
  "teste": {
    "id": "uuid",
    "candidatoId": "uuid",
    "respostas": [...],
    "resultado": {...},
    "perfilDominante": "Analista",
    "pontuacaoTotal": 265,
    "dataRealizacao": "2024-11-07T..."
  }
}
```

---

## 📝 ESTRUTURA DE ARQUIVOS

```
backend/
├── prisma/
│   ├── schema.prisma          # Schema do Prisma (tabelas)
│   └── seed.js                # Seeds (dados iniciais)
├── lib/
│   └── prisma.js              # Singleton do Prisma Client
├── controllers/
│   └── candidato/
│       ├── authController.js       # Autenticação + Login LinkedIn
│       └── curriculoController.js  # CRUD de currículo
├── middleware/
│   └── auth.js                # Middleware de autenticação JWT
├── routes/
│   ├── auth.js                # Rotas de autenticação
│   └── curriculo.js           # Rotas de currículo
└── index.js                   # Servidor Express
```

---

## 🔧 COMANDOS ÚTEIS

```bash
# Gerar Prisma Client (após mudar schema)
npx prisma generate

# Aplicar mudanças no banco
npx prisma db push

# Ver dados no Prisma Studio (GUI)
npx prisma studio

# Iniciar servidor
npm run dev
```

---

## 🎨 EXEMPLO NO FRONTEND

### 1. Salvar Currículo
```typescript
import { authService } from '@/services/authService';

const salvarCurriculo = async (formData: CurriculoData) => {
  const token = authService.getToken();
  
  const response = await fetch('http://localhost:3001/curriculo/salvar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(formData)
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log('✅ Currículo salvo!');
  }
};
```

### 2. Buscar Currículo
```typescript
const buscarCurriculo = async () => {
  const token = authService.getToken();
  
  const response = await fetch('http://localhost:3001/curriculo/buscar', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  
  if (data.success) {
    setFormData(data.curriculo);
  }
};
```

---

## 🔐 SEGURANÇA

- ✅ Todas as rotas de currículo protegidas com JWT
- ✅ Middleware de autenticação valida token
- ✅ Cada candidato só acessa seus próprios dados
- ✅ IDs do tipo UUID para segurança

---

## 📊 PRÓXIMOS PASSOS

1. ✅ Prisma configurado e funcionando
2. ✅ Tabelas criadas no Supabase
3. ✅ Backend salvando dados do LinkedIn
4. ✅ Rotas de currículo prontas
5. 🔄 **Próximo:** Integrar frontend para chamar APIs

---

## 🆘 TROUBLESHOOTING

### Erro: "Environment variable not found: DATABASE_URL"
- Verifique se o arquivo `.env` existe em `backend/`
- Certifique-se que tem a linha: `DATABASE_URL="postgresql://..."`

### Erro: "Could not find Prisma Schema"
- Execute os comandos a partir da pasta `backend/`
- Verifique se existe `backend/prisma/schema.prisma`

### Erro: "Can't reach database server"
- Verifique a connection string do Supabase
- Teste a conexão: `npx prisma db pull`

---

## 🎉 TUDO PRONTO!

O Prisma está 100% configurado e funcionando! 🚀

Agora você pode:
- ✅ Fazer login com LinkedIn → Salva automaticamente no banco
- ✅ Salvar currículo completo
- ✅ Buscar dados do candidato
- ✅ Salvar testes comportamentais
- ✅ Ver tudo no Prisma Studio (`npx prisma studio`)

---

**Dúvidas?** Consulte a [documentação do Prisma](https://www.prisma.io/docs)

