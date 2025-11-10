# 🔧 CONFIGURAÇÃO DO AMBIENTE

## ⚠️ **IMPORTANTE - PORTAS**

- **Frontend EMPRESA:** `http://localhost:8080`
- **Frontend CANDIDATO:** `http://localhost:5174`
- **Backend API:** `http://localhost:3001`

---

## 📝 **ARQUIVO `.env` - Backend**

Abra o arquivo `backend/.env` e adicione/atualize estas variáveis:

```bash
# Database
DATABASE_URL="postgresql://usuario:senha@localhost:5432/recruta_ai"

# JWT Secret (gere uma chave aleatória)
JWT_SECRET="sua_chave_secreta_jwt_aqui"

# Server
PORT=3001
FRONTEND_URL=http://localhost:8080

# LinkedIn OAuth 2.0 (para candidatos - se já tiver)
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...
LINKEDIN_REDIRECT_URI=...

# ========================================
# 🔵 UNIPILE API (para postagem de vagas)
# ========================================
UNIPILE_API_URL=https://api23.unipile.com:15378/api/v1
UNIPILE_API_KEY=t2tWg6dg.p7sFTiyLTj0E+kGsl5hiB+i0fHdovvHVyNspe0KG4d4=
UNIPILE_REDIRECT_URI=http://localhost:8080/settings/linkedin/callback
```

---

## ✅ **CONFIGURAÇÃO COMPLETA**

### **1. API URL da Unipile**
```bash
UNIPILE_API_URL=https://api23.unipile.com:15378/api/v1
```
- ✅ **Já está correto!** Use `api23` (seu DSN específico)

### **2. API Key da Unipile**
```bash
UNIPILE_API_KEY=t2tWg6dg.p7sFTiyLTj0E+kGsl5hiB+i0fHdovvHVyNspe0KG4d4=
```
- ✅ **Já está correto!** Esta é sua chave API

### **3. Redirect URI (Callback)**
```bash
UNIPILE_REDIRECT_URI=http://localhost:8080/settings/linkedin/callback
```
- ✅ **Porta 8080** = Frontend da EMPRESA

---

## 🧪 **TESTE SE ESTÁ FUNCIONANDO**

### **1. Teste Manual via cURL:**

```bash
curl --request GET \
  --url https://api23.unipile.com:15378/api/v1/accounts \
  --header "X-API-KEY: t2tWg6dg.p7sFTiyLTj0E+kGsl5hiB+i0fHdovvHVyNspe0KG4d4=" \
  --header "accept: application/json"
```

**Resposta Esperada:**
```json
{
  "items": [],
  "cursor": null
}
```
✅ Se receber isso, sua API Key está funcionando!

### **2. Inicie o Backend:**

```bash
cd backend
npm run dev
```

**Você DEVE ver:**
```
🚀 Servidor rodando na porta 3001
🏢 Empresa API: http://localhost:3001/empresa
```

**NÃO DEVE ver:**
```
⚠️  UNIPILE_API_KEY não configurada no .env
⚠️  UNIPILE_ACCOUNT_ID não configurada no .env
```

### **3. Inicie o Frontend da Empresa:**

```bash
cd empresa-frontend
npm run dev
```

Deve abrir em: **http://localhost:8080**

### **4. Teste a Conexão:**

1. Acesse: `http://localhost:8080/login`
2. Clique em **"Conectar com LinkedIn"**
3. Você será redirecionado para autorizar no LinkedIn
4. Após autorizar, voltará para `http://localhost:8080/settings/linkedin/callback`
5. ✅ **Conectado com sucesso!**

---

## 🔍 **ESTRUTURA DE PORTAS**

```
┌─────────────────────────────────────────────┐
│  SISTEMA RECRUTA.AI                        │
├─────────────────────────────────────────────┤
│                                             │
│  Frontend EMPRESA:    localhost:8080       │
│  ├─ Login                                   │
│  ├─ Conexão LinkedIn (botão)               │
│  ├─ Callback: /settings/linkedin/callback  │
│  ├─ Dashboard                               │
│  └─ Gestão de Vagas                         │
│                                             │
│  Frontend CANDIDATO:  localhost:5174       │
│  ├─ Login                                   │
│  ├─ Perfil                                  │
│  ├─ Vagas: /vagas/{job_id}                │
│  └─ Candidaturas                            │
│                                             │
│  Backend API:         localhost:3001       │
│  ├─ /empresa/linkedin/connect              │
│  ├─ /empresa/linkedin/callback             │
│  ├─ /empresa/linkedin/disconnect           │
│  └─ /jobs                                   │
│                                             │
│  Unipile API:                               │
│  └─ https://api23.unipile.com:15378        │
└─────────────────────────────────────────────┘
```

---

## 🚨 **ERROS COMUNS**

### **Erro 401 - Missing credentials**
```
❌ [UNIPILE ACCOUNT] Erro ao gerar URL: {
  status: 401,
  type: 'errors/missing_credentials',
  title: 'Missing credentials'
}
```
**Solução:** Verifique se a API Key está correta no `.env`

### **CORS Error**
```
Access to fetch at 'http://localhost:3001' from origin 'http://localhost:8080' has been blocked by CORS policy
```
**Solução:** ✅ Já corrigido! O backend aceita porta 8080

### **Callback não funciona**
```
Error: Cannot GET /settings/linkedin/callback
```
**Solução:** Verifique se a rota está registrada em `App.tsx`

---

## 📋 **CHECKLIST FINAL**

Antes de testar, confirme:

- [ ] ✅ `.env` atualizado com API Key
- [ ] ✅ `UNIPILE_API_URL` usando `api23`
- [ ] ✅ `UNIPILE_REDIRECT_URI` usando porta `8080`
- [ ] ✅ Backend rodando na porta `3001`
- [ ] ✅ Frontend empresa rodando na porta `8080`
- [ ] ✅ Sem avisos de credenciais faltando

---

## 🎯 **PRÓXIMOS PASSOS**

1. ✅ Ajuste o `.env` conforme acima
2. ✅ Reinicie o backend (`npm run dev`)
3. ✅ Acesse `localhost:8080/login`
4. ✅ Clique em "Conectar com LinkedIn"
5. ✅ Autorize e veja a mágica acontecer! 🚀

---

**Sua configuração está pronta!** 🎉

