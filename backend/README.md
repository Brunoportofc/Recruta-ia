# Backend - Recruta.ai

Backend Express.js para o sistema Recruta.ai com autenticação OAuth 2.0 do LinkedIn.

## 🚀 Instalação

```bash
npm install
```

## 🔑 Configuração

1. Configure as credenciais do LinkedIn OAuth 2.0:
   - Veja o guia completo em **[LINKEDIN_SETUP.md](./LINKEDIN_SETUP.md)**

2. Crie um arquivo `.env` na raiz do backend com as seguintes variáveis:

```bash
# LinkedIn OAuth 2.0
LINKEDIN_CLIENT_ID=seu_client_id
LINKEDIN_CLIENT_SECRET=seu_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:5173/auth/linkedin/callback

# JWT Secret (gere uma string aleatória segura)
JWT_SECRET=seu_jwt_secret_super_seguro_aqui

# Servidor
PORT=3001
FRONTEND_URL=http://localhost:5173

# Supabase (opcional)
SUPABASE_URL=sua_url_supabase
SUPABASE_ANON_KEY=sua_key_supabase
```

## 🏃 Execução

### Desenvolvimento (com hot reload):
```bash
npm run dev
```

### Produção:
```bash
npm start
```

O servidor estará disponível em `http://localhost:3001`

## 📚 API Endpoints

### 🔐 Autenticação

#### `GET /auth/login/linkedin`
Inicia o fluxo de autenticação OAuth 2.0 com LinkedIn.

**Resposta:**
```json
{
  "success": true,
  "authUrl": "https://www.linkedin.com/oauth/v2/authorization?...",
  "state": "token_de_seguranca"
}
```

#### `GET /auth/linkedin/callback?code=...&state=...`
Callback do LinkedIn após autorização. Retorna dados do usuário e currículo.

**Resposta:**
```json
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "id": "linkedin_id",
    "name": "Nome Completo",
    "email": "email@exemplo.com",
    "linkedinId": "linkedin_id",
    "avatar": "url_foto_perfil"
  },
  "resumeData": {
    "nomeCompleto": "Nome Completo",
    "email": "email@exemplo.com",
    "fotoPerfil": "url_foto",
    "experiencias": [...],
    "formacoes": [...],
    "habilidades": [...],
    ...
  }
}
```

#### `POST /auth/login/email`
Login com email e senha (modo demo).

**Body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "name": "Nome",
    "email": "email@exemplo.com",
    "avatar": "url_avatar"
  }
}
```

#### `POST /auth/verify`
Verifica se um token JWT é válido.

**Headers:**
```
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "email@exemplo.com",
    "name": "Nome"
  }
}
```

#### `POST /auth/logout`
Faz logout do usuário.

**Headers:**
```
Authorization: Bearer {token}
```

### 💼 Jobs (Vagas)

#### `GET /jobs`
Lista todas as vagas cadastradas.

#### `POST /jobs`
Cria uma nova vaga.

### 🏥 Health Check

#### `GET /health`
Verifica o status do servidor.

**Resposta:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🏗️ Estrutura do Projeto

```
backend/
├── config/
│   └── supabase.js              # Configuração do Supabase
├── controllers/
│   ├── candidato/
│   │   └── authController.js    # Lógica de autenticação
│   └── empresa/
│       └── jobsController.js    # Lógica de vagas
├── services/
│   └── linkedinService.js       # Serviço de integração LinkedIn
├── repositories/
│   └── empresa/
│       └── jobsRepository.js    # Acesso ao banco de dados
├── routes/
│   ├── auth.js                  # Rotas de autenticação
│   └── jobs.js                  # Rotas de vagas
├── middleware/                   # Middlewares (futuros)
├── index.js                     # Arquivo principal do servidor
├── package.json
├── schema.sql                   # Estrutura do banco de dados
├── README.md                    # Este arquivo
└── LINKEDIN_SETUP.md           # Guia de configuração do LinkedIn
```

## 🔐 Autenticação com LinkedIn OAuth 2.0

O sistema utiliza **OAuth 2.0** do LinkedIn para autenticação e importação de dados profissionais:

### Fluxo de Autenticação:

1. **Frontend** solicita URL de autorização (`GET /auth/login/linkedin`)
2. **Frontend** redireciona usuário para LinkedIn
3. **Usuário** autoriza a aplicação no LinkedIn
4. **LinkedIn** redireciona de volta com código de autorização
5. **Backend** troca código por access token
6. **Backend** obtém dados do perfil do LinkedIn
7. **Backend** mapeia dados para formato do currículo
8. **Backend** retorna JWT token + dados do usuário + currículo preenchido
9. **Frontend** salva token e exibe formulário com dados preenchidos

### Dados Obtidos do LinkedIn:

✅ **Disponíveis:**
- Nome completo
- Email
- Foto de perfil
- ID do LinkedIn
- URL do perfil

⚠️ **Limitações da API básica:**
- Experiências profissionais (requer API especial)
- Formação acadêmica (requer API especial)
- Habilidades (requer API especial)
- Telefone (não disponível)
- Endereço (não disponível)

> **Nota**: Para acessar dados completos de experiência e formação, é necessário solicitar acesso à **Marketing Developer Platform** do LinkedIn.

## 🛠️ Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **JWT** (jsonwebtoken) - Autenticação com tokens
- **Axios** - Cliente HTTP para API do LinkedIn
- **Cookie Parser** - Parsing de cookies
- **CORS** - Controle de acesso entre origens
- **Supabase** - Banco de dados (opcional)
- **dotenv** - Gerenciamento de variáveis de ambiente

## 📖 Guias Adicionais

- **[LINKEDIN_SETUP.md](./LINKEDIN_SETUP.md)** - Guia completo de configuração do LinkedIn OAuth 2.0

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.
