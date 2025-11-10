# 🔧 Configuração da Unipile API

## Variáveis de Ambiente Necessárias

Adicione as seguintes variáveis no seu arquivo `.env`:

```bash
# Unipile API (para postagem de vagas no LinkedIn)
UNIPILE_API_URL=https://api23.unipile.com:15378/api/v1
UNIPILE_API_KEY=t2tWg6dg.p7sFTiyLTj0E+kGsl5hiB+i0fHdovvHVyNspe0KG4d4=
UNIPILE_REDIRECT_URI=http://localhost:8080/settings/linkedin/callback
```

⚠️ **PORTAS IMPORTANTES:**
- Frontend EMPRESA: `http://localhost:8080`
- Frontend CANDIDATO: `http://localhost:5174`

⚠️ **IMPORTANTE:** 
- Substitua `api23` pelo número do seu DSN (veja no dashboard)
- `UNIPILE_ACCOUNT_ID` não é mais necessário - cada empresa terá seu próprio account_id!

## Como Obter as Credenciais

### 1. Criar Conta na Unipile
1. Acesse: https://dashboard.unipile.com
2. Crie sua conta
3. Faça login

### 2. Gerar API Key
1. No dashboard, vá em **API Keys** (menu lateral)
2. Clique em **Create New Key**
3. Dê um nome (ex: "Recruta.AI Production")
4. Copie a chave gerada
5. Cole no `.env` como `UNIPILE_API_KEY`

### 3. ~~Conectar Conta LinkedIn~~ (NÃO É MAIS NECESSÁRIO!)

**✅ NOVIDADE:** As empresas agora conectam o LinkedIn diretamente pela sua plataforma!

Cada empresa terá sua própria conta LinkedIn conectada através do sistema:
1. Empresa acessa **Settings** → **Integrações**
2. Clica em **"Conectar LinkedIn"**
3. É redirecionada para autorização (via Unipile)
4. Autoriza a aplicação
5. ✅ LinkedIn conectado!

O `account_id` é salvo automaticamente no banco de dados vinculado à empresa.

## Exemplo Completo do .env

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# JWT Secret
JWT_SECRET="seu_jwt_secret_super_seguro_aqui"

# Server
PORT=3001
FRONTEND_URL=http://localhost:8080

# LinkedIn OAuth 2.0 (para candidatos)
LINKEDIN_CLIENT_ID=seu_client_id
LINKEDIN_CLIENT_SECRET=seu_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:5174/auth/linkedin/callback

# Unipile API (para postagem de vagas pela EMPRESA)
UNIPILE_API_URL=https://api23.unipile.com:15378/api/v1
UNIPILE_API_KEY=t2tWg6dg.p7sFTiyLTj0E+kGsl5hiB+i0fHdovvHVyNspe0KG4d4=
UNIPILE_REDIRECT_URI=http://localhost:8080/settings/linkedin/callback

# Supabase (opcional)
SUPABASE_URL=sua_url_supabase
SUPABASE_ANON_KEY=sua_key_supabase
```

## Testando a Configuração

Depois de adicionar as variáveis:

1. Reinicie o servidor backend:
```bash
npm run dev
```

2. Verifique os logs. Se as credenciais não estiverem configuradas, você verá:
```
⚠️  UNIPILE_API_KEY não configurada no .env
⚠️  UNIPILE_ACCOUNT_ID não configurada no .env
```

3. Se estiver tudo OK, você não verá avisos e poderá publicar vagas no LinkedIn!

## Comportamento do Sistema

### ✅ Com Credenciais Configuradas:
- Vagas são criadas localmente E publicadas no LinkedIn
- Status da vaga: `syncing` → `active`
- URL do LinkedIn é salva no banco
- Empresa pode gerenciar vagas pelo sistema

### ⚠️ Sem Credenciais Configuradas:
- Vagas são criadas apenas localmente
- Status da vaga: `draft`
- Não são publicadas no LinkedIn
- Sistema funciona normalmente para testes

## Links Úteis

- Dashboard Unipile: https://dashboard.unipile.com
- Documentação API: https://developer.unipile.com/reference/linkedincontroller_createjobposting
- Suporte: contato@unipile.com

