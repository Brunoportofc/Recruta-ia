# 🚀 COMECE AQUI - Configuração Rápida

## ✅ **AJUSTES COMPLETOS!**

Todas as configurações foram ajustadas para suas portas corretas:
- ✅ **Frontend EMPRESA:** `http://localhost:8080`
- ✅ **Frontend CANDIDATO:** `http://localhost:5174`
- ✅ **API Key da Unipile:** Já configurada
- ✅ **CORS:** Aceita porta 8080
- ✅ **Redirect URI:** Aponta para 8080

---

## 📝 **PASSO 1: Ajuste seu arquivo `.env`**

Abra `backend/.env` e **adicione estas linhas** (ou atualize se já existirem):

```bash
# Unipile API
UNIPILE_API_URL=https://api23.unipile.com:15378/api/v1
UNIPILE_API_KEY=t2tWg6dg.p7sFTiyLTj0E+kGsl5hiB+i0fHdovvHVyNspe0KG4d4=
UNIPILE_REDIRECT_URI=http://localhost:8080/settings/linkedin/callback

# LinkedIn OAuth (Empresa) - Redirect URI específico
LINKEDIN_EMPRESA_REDIRECT_URI=http://localhost:8080/auth/linkedin/callback
```

**⚠️ IMPORTANTE:** Você também precisa adicionar esta redirect URI no LinkedIn Developer Portal:
- Acesse: https://www.linkedin.com/developers/apps
- Seu app: `86xmzv42q5v899`
- Auth → OAuth 2.0 settings → Redirect URLs
- Adicione: `http://localhost:8080/auth/linkedin/callback`

**Pronto!** Só isso! 🎉

---

## 🧪 **PASSO 2: Teste**

### **1. Inicie o Backend:**

```bash
cd backend
npm run dev
```

**✅ Você DEVE ver:**
```
🚀 Servidor rodando na porta 3001
🏢 Empresa API: http://localhost:3001/empresa
```

**❌ NÃO deve ver:**
```
⚠️  UNIPILE_API_KEY não configurada no .env
```

Se ainda ver o aviso, o `.env` não foi atualizado corretamente.

---

### **2. Inicie o Frontend da Empresa:**

```bash
cd empresa-frontend
npm run dev
```

Deve abrir em: `http://localhost:8080`

---

### **3. Teste a Conexão:**

1. ✅ Acesse: `http://localhost:8080/login`
2. ✅ Clique em **"Conectar com LinkedIn"**
3. ✅ Autorize no LinkedIn
4. ✅ Volte para o sistema
5. ✅ **CONECTADO!** 🎉

---

## 📊 **ESTRUTURA DO SISTEMA**

```
┌────────────────────────────────────────┐
│  FRONTEND EMPRESA (porta 8080)        │
│  ├─ Login com LinkedIn                 │
│  ├─ Dashboard                           │
│  ├─ Criar Vagas                         │
│  └─ Gerenciar Vagas                     │
└────────────────────────────────────────┘
          ↓
┌────────────────────────────────────────┐
│  BACKEND API (porta 3001)              │
│  ├─ /empresa/linkedin/connect          │
│  ├─ /empresa/linkedin/callback         │
│  └─ /jobs                               │
└────────────────────────────────────────┘
          ↓
┌────────────────────────────────────────┐
│  UNIPILE API                            │
│  ├─ Conecta LinkedIn da empresa        │
│  ├─ Publica vagas no LinkedIn          │
│  └─ Gerencia candidaturas               │
└────────────────────────────────────────┘
          ↓
┌────────────────────────────────────────┐
│  LINKEDIN                               │
│  └─ Vagas publicadas aparecem aqui     │
└────────────────────────────────────────┘
```

---

## 🎯 **O QUE VOCÊ PODE FAZER AGORA**

### **1. Conectar LinkedIn:**
- Empresa clica em "Conectar com LinkedIn" no login
- Autoriza no LinkedIn
- ✅ Conta conectada!

### **2. Publicar Vaga:**
- Empresa cria uma vaga no sistema
- Sistema publica automaticamente no LinkedIn
- ✅ Vaga ao vivo!

### **3. Gerenciar Vagas:**
- Ver todas as vagas publicadas
- Editar vagas (em breve)
- Fechar vagas (em breve)

---

## 🔍 **VERIFICAÇÃO RÁPIDA**

Execute este comando para testar sua API Key:

```bash
curl --request GET \
  --url https://api23.unipile.com:15378/api/v1/accounts \
  --header "X-API-KEY: t2tWg6dg.p7sFTiyLTj0E+kGsl5hiB+i0fHdovvHVyNspe0KG4d4=" \
  --header "accept: application/json"
```

**Resposta esperada:**
```json
{
  "items": [],
  "cursor": null
}
```

✅ Se ver isso, sua API Key está funcionando!

---

## 📚 **DOCUMENTAÇÃO COMPLETA**

- **`CONFIGURACAO_ENV.md`** - Guia detalhado de configuração
- **`FLUXO_COMPLETO.md`** - Como funciona todo o sistema
- **`UNIPILE_CONFIG.md`** - Detalhes da integração Unipile

---

## 🚨 **PROBLEMAS?**

### **Erro 401 - Missing credentials**
👉 Verifique se copiou a API Key corretamente no `.env`

### **Erro CORS**
👉 ✅ Já corrigido! Backend aceita porta 8080

### **Callback não funciona**
👉 Verifique se a rota existe em `App.tsx`

---

## ✅ **CHECKLIST**

Antes de testar:

- [ ] `.env` atualizado com as 3 variáveis
- [ ] Backend rodando (porta 3001)
- [ ] Frontend empresa rodando (porta 8080)
- [ ] Sem avisos de credenciais no console

---

**Tudo pronto! Agora é só testar! 🚀**

Acesse: `http://localhost:8080/login` e clique em **"Conectar com LinkedIn"**

