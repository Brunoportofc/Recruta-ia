# 🚀 FLUXO COMPLETO - Sistema de Vagas LinkedIn

## 📋 **COMO FUNCIONA**

### **1️⃣ EMPRESA FAZ LOGIN COM LINKEDIN**

**Tela:** `/login` (empresa-frontend)

1. Empresa acessa o sistema
2. Clica em **"Conectar com LinkedIn"**
3. É redirecionada para autorização (Unipile → LinkedIn)
4. Autoriza a aplicação no LinkedIn
5. É redirecionada de volta: `/settings/linkedin/callback`
6. Sistema conecta automaticamente e salva `account_id` no banco
7. ✅ **Empresa está conectada e logada!**
8. Redireciona para Dashboard

---

### **2️⃣ EMPRESA CRIA VAGA**

**Tela:** `/vagas/nova`

1. Empresa preenche formulário da vaga
2. Clica em **"Criar Vaga no LinkedIn"**
3. Backend:
   - Salva vaga no banco local
   - Busca `account_id` da empresa
   - Cria rascunho no LinkedIn (via Unipile)
   - Publica automaticamente
   - Salva URL do LinkedIn no banco
4. ✅ **Vaga publicada no LinkedIn!**
5. Empresa volta para lista de vagas

---

### **3️⃣ CANDIDATO VÊ VAGA NO LINKEDIN**

**LinkedIn:**

1. Candidato navega pelo LinkedIn
2. Encontra a vaga publicada
3. Clica em **"Candidatar-se"**
4. Se `apply_method.type = "external"`:
   - É redirecionado para: `area.candidato.com/vagas/{vaga_id}`
5. Se `apply_method.type = "linkedin"`:
   - Preenche formulário dentro do LinkedIn
   - Empresa recebe email com candidatura

---

## 🎯 **ARQUITETURA**

```
EMPRESA                    SISTEMA                     UNIPILE                LINKEDIN
   │                          │                           │                      │
   ├─1. Clica "Conectar"──────►                           │                      │
   │                          │                           │                      │
   │                          ├─2. GET /empresa/linkedin/connect                 │
   │                          │   (gera URL autorização)  │                      │
   │                          │                           │                      │
   │                          ├─3. POST /accounts/hosted►│                      │
   │                          │                           │                      │
   │                          │◄──4. authUrl + token──────┤                      │
   │                          │                           │                      │
   │◄──5. Redireciona para────┤                           │                      │
   │   authUrl (Unipile)      │                           │                      │
   │                          │                           │                      │
   ├─────────────6. Autoriza no LinkedIn──────────────────────────────────────►│
   │                          │                           │                      │
   │◄─────────────7. Callback com code────────────────────────────────────────┤
   │   /callback?code=abc     │                           │                      │
   │                          │                           │                      │
   ├─8. Envia code────────────►                           │                      │
   │                          │                           │                      │
   │                          ├─9. POST /finalize────────►│                      │
   │                          │   (troca code por account)│                      │
   │                          │                           │                      │
   │                          │◄──10. account_id──────────┤                      │
   │                          │                           │                      │
   │                          ├─11. Salva no banco        │                      │
   │                          │     empresa.unipileAccountId                     │
   │                          │                           │                      │
   │◄──12. "Conectado!"───────┤                           │                      │
   │   Redireciona para /     │                           │                      │
```

---

## 🗄️ **ESTRUTURA DO BANCO**

### **Tabela: empresas**

```sql
CREATE TABLE empresas (
  id                     UUID PRIMARY KEY,
  nome                   TEXT NOT NULL,
  email                  TEXT UNIQUE NOT NULL,
  cnpj                   TEXT UNIQUE,
  telefone               TEXT,
  
  -- UNIPILE/LINKEDIN
  unipile_account_id     TEXT UNIQUE,      -- ID da conta LinkedIn no Unipile
  unipile_connected      BOOLEAN DEFAULT false,
  unipile_connected_at   TIMESTAMP,
  
  created_at             TIMESTAMP DEFAULT NOW(),
  updated_at             TIMESTAMP DEFAULT NOW()
);
```

### **Tabela: jobs**

```sql
CREATE TABLE jobs (
  id                     UUID PRIMARY KEY,
  job_title              TEXT NOT NULL,
  company                TEXT NOT NULL,
  workplace              TEXT NOT NULL,     -- REMOTE, HYBRID, ON_SITE
  location               TEXT NOT NULL,     -- ID do LinkedIn
  description            TEXT NOT NULL,
  
  -- UNIPILE/LINKEDIN
  unipile_id             TEXT UNIQUE,       -- ID da vaga no Unipile
  linkedin_url           TEXT,              -- URL da vaga no LinkedIn
  status                 TEXT DEFAULT 'syncing', -- syncing, active, closed, error, draft
  error_message          TEXT,
  
  -- Dados do recruiter (JSON)
  recruiter_functions    JSONB,
  recruiter_industries   JSONB,
  recruiter_seniority    TEXT,
  recruiter_apply_method_type TEXT,         -- linkedin ou external
  recruiter_apply_method_url  TEXT,        -- Para tipo external
  
  created_at             TIMESTAMP DEFAULT NOW(),
  updated_at             TIMESTAMP DEFAULT NOW()
);
```

---

## 🔧 **CONFIGURAÇÃO NECESSÁRIA**

### **Backend (.env)**

```bash
# Unipile API
UNIPILE_API_URL=https://api23.unipile.com:15378/api/v1
UNIPILE_API_KEY=t2tWg6dg.p7sFTiyLTj0E+kGsl5hiB+i0fHdovvHVyNspe0KG4d4=
UNIPILE_REDIRECT_URI=http://localhost:8080/settings/linkedin/callback
```

**IMPORTANTE:** 
- Frontend EMPRESA: `http://localhost:8080`
- Frontend CANDIDATO: `http://localhost:5174`

### **Obter Credenciais:**

1. Acesse: https://dashboard.unipile.com
2. Crie conta
3. Vá em **Access Tokens** → **Create new token**
4. Copie a API Key
5. Cole no `.env`

---

## 📡 **ENDPOINTS CRIADOS**

### **Conexão LinkedIn:**

```
GET  /empresa/linkedin/connect      # Inicia conexão (retorna authUrl)
GET  /empresa/linkedin/callback     # Callback após autorização
POST /empresa/linkedin/disconnect   # Desconecta LinkedIn
GET  /empresa/linkedin/status       # Verifica se está conectado
```

### **Vagas:**

```
GET  /jobs                          # Lista todas as vagas
POST /jobs?empresaId=temp-empresa-id # Cria e publica vaga
```

---

## 🎯 **FLUXO DE PUBLICAÇÃO DE VAGA**

### **Com LinkedIn Conectado:**

```javascript
// 1. Frontend envia dados da vaga
POST /jobs?empresaId=temp-empresa-id
{
  job_title: { text: "Desenvolvedor" },
  company: { text: "Tech Solutions" },
  workplace: "REMOTE",
  location: "103119278",
  description: "...",
  recruiter: {
    // ...
    apply_method: {
      type: "external",
      url: "https://area.candidato.com/vagas/{vaga_id}"
    }
  }
}

// 2. Backend:
// - Salva vaga no banco → job_id gerado
// - Busca empresa.unipileAccountId
// - Cria rascunho no Unipile (usando account_id da empresa)
// - Publica automaticamente no LinkedIn
// - Atualiza vaga com unipile_id, linkedin_url, status='active'

// 3. Resposta:
{
  "message": "Vaga criada e publicada no LinkedIn com sucesso!",
  "data": {
    "id": "abc-123-def-456",
    "jobTitle": "Desenvolvedor",
    "status": "active",
    "linkedinUrl": "https://www.linkedin.com/jobs/view/12345",
    "unipileId": "draft_xyz789"
  }
}
```

### **Sem LinkedIn Conectado:**

```javascript
// Mesmo fluxo, mas:
// - Vaga salva apenas localmente
// - status = 'draft'
// - unipile_id = null
// - linkedin_url = null

// Empresa precisa conectar LinkedIn para publicar
```

---

## ✅ **TESTANDO O SISTEMA**

### **1. Inicie o Backend:**

```bash
cd backend
npm run dev
```

Você verá:
```
🚀 Servidor rodando na porta 3001
🏢 Empresa API: http://localhost:3001/empresa
```

### **2. Inicie o Frontend:**

```bash
cd empresa-frontend
npm run dev
```

### **3. Teste a Conexão:**

1. Acesse: http://localhost:8080/login
2. Clique em **"Conectar com LinkedIn"**
3. Autorize no LinkedIn
4. Você será redirecionado de volta
5. ✅ Conectado!

### **4. Teste a Publicação:**

1. Vá em **Vagas** → **Nova Vaga**
2. Preencha o formulário
3. Clique em **"Criar Vaga no LinkedIn"**
4. Aguarde 5-10 segundos
5. ✅ Vaga publicada!
6. Veja no LinkedIn!

---

## 🔗 **URLs IMPORTANTES**

- **Dashboard Unipile:** https://dashboard.unipile.com
- **Documentação API:** https://developer.unipile.com
- **Frontend EMPRESA:** http://localhost:8080
- **Frontend CANDIDATO:** http://localhost:5174
- **Backend Local:** http://localhost:3001
- **Callback URL:** http://localhost:8080/settings/linkedin/callback

---

## 🎨 **PRÓXIMOS PASSOS**

### **Para Produção:**

1. **Autenticação Real:**
   - Implementar JWT para empresas
   - Pegar `empresaId` do token
   - Remover `temp-empresa-id`

2. **Variáveis de Ambiente:**
   - Atualizar `UNIPILE_REDIRECT_URI` para produção
   - Usar domínio real

3. **Link de Candidatura Dinâmico:**
   - Gerar URL: `https://area.candidato.com/vagas/{job_id}`
   - Criar página de candidatura
   - Vincular candidato → vaga

4. **Gerenciamento de Vagas:**
   - Implementar edição de vagas
   - Implementar fechamento de vagas
   - Buscar candidatos via Unipile API

---

## 🎉 **RESUMO**

✅ **Empresa conecta LinkedIn direto no login**
✅ **System salva account_id no banco vinculado à empresa**
✅ **Cada empresa tem sua própria conta LinkedIn**
✅ **Vagas são publicadas no LinkedIn da empresa**
✅ **Candidatos veem a vaga no LinkedIn**
✅ **Podem ser redirecionados para seu sistema**
✅ **Tudo automatizado via Unipile API**

**Você não precisa mais acessar o dashboard da Unipile!** 🚀

