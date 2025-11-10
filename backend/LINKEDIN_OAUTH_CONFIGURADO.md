# ✅ LinkedIn OAuth 2.0 Configurado!

## 🎉 **IMPLEMENTAÇÃO COMPLETA**

O sistema agora está configurado para que empresas conectem suas contas LinkedIn **diretamente pela plataforma** usando OAuth 2.0 oficial do LinkedIn!

---

## 🔧 **VARIÁVEL DE AMBIENTE NECESSÁRIA**

Adicione esta linha ao seu arquivo `.env`:

```bash
# LinkedIn OAuth (EMPRESA) - Redirect URI específico para área da empresa
LINKEDIN_EMPRESA_REDIRECT_URI=http://localhost:8080/auth/linkedin/callback
```

### **📋 Seu `.env` completo deve ter:**

```bash
# LinkedIn OAuth 2.0 (usa o mesmo app para candidato E empresa)
LINKEDIN_CLIENT_ID=86xmzv42q5v899
LINKEDIN_CLIENT_SECRET=WPL_AP1.NDFloNcXOXs0pdpV.c/5XSg==
LINKEDIN_REDIRECT_URI=http://localhost:5174/auth/linkedin/callback  # Candidato
LINKEDIN_EMPRESA_REDIRECT_URI=http://localhost:8080/auth/linkedin/callback  # Empresa

# JWT Secret
JWT_SECRET=recruta-ai-super-secret-jwt-key-2024

# Servidor
PORT=3001
FRONTEND_URL=http://localhost:5174

# Database
DATABASE_URL=postgresql://postgres.pmcuejsknpsirjfmawhj:Recrutaia12@aws-1-us-east-2.pooler.supabase.com:5432/postgres

# Unipile API (para postagem de vagas no LinkedIn)
UNIPILE_API_URL=https://api23.unipile.com:15378/api/v1
UNIPILE_API_KEY=t2tWg6dg.p7sFTiyLTj0E+kGsl5hiB+i0fHdovvHVyNspe0KG4d4=
UNIPILE_REDIRECT_URI=http://localhost:8080/settings/linkedin/callback
```

---

## 🔑 **CONFIGURAÇÃO NO LINKEDIN DEVELOPER PORTAL**

### **1. Adicionar Nova Redirect URI**

1. Acesse: https://www.linkedin.com/developers/apps
2. Selecione seu app: **86xmzv42q5v899**
3. Vá em **Auth** → **OAuth 2.0 settings**
4. Em **Redirect URLs**, adicione:
   ```
   http://localhost:8080/auth/linkedin/callback
   ```
5. Clique em **Update**

**Agora você terá 2 redirect URIs:**
- ✅ `http://localhost:5174/auth/linkedin/callback` (Candidato)
- ✅ `http://localhost:8080/auth/linkedin/callback` (Empresa)

---

## 🚀 **COMO FUNCIONA**

### **FLUXO COMPLETO:**

```
1. Empresa acessa http://localhost:8080/login
2. Clica em "Conectar com LinkedIn"
3. Backend gera URL de autorização do LinkedIn
4. Empresa é redirecionada para LinkedIn oficial
5. Digita email e senha do LinkedIn
6. Autoriza a aplicação
7. LinkedIn redireciona para: http://localhost:8080/auth/linkedin/callback?code=ABC123
8. Backend troca code por access_token
9. Backend busca perfil do LinkedIn
10. Backend conecta access_token na Unipile (POST /accounts)
11. Unipile retorna account_id
12. Backend salva account_id no banco (tabela empresas)
13. Empresa é redirecionada para dashboard
14. ✅ PRONTO! Empresa conectada!
```

---

## 📂 **ARQUIVOS CRIADOS/MODIFICADOS**

### **Backend:**

1. ✅ **`controllers/empresa/linkedinAuthController.js`**
   - Controller para OAuth 2.0 do LinkedIn
   - Métodos: `initiateAuth`, `handleCallback`, `disconnect`, `checkStatus`

2. ✅ **`routes/empresa.js`**
   - Rotas atualizadas para usar `linkedinAuthController`
   - Endpoints: `/linkedin/auth`, `/linkedin/callback`, `/linkedin/disconnect`, `/linkedin/status`

### **Frontend:**

3. ✅ **`pages/Login.tsx`**
   - Atualizado para chamar `/empresa/linkedin/auth`
   - Redireciona para LinkedIn oficial

4. ✅ **`pages/LinkedInCallback.tsx`**
   - Nova página para lidar com callback do LinkedIn
   - Mostra status: loading, success ou error

5. ✅ **`App.tsx`**
   - Rota adicionada: `/auth/linkedin/callback`

---

## 🧪 **TESTAR AGORA**

### **1. Adicione a variável ao `.env`:**

```bash
LINKEDIN_EMPRESA_REDIRECT_URI=http://localhost:8080/auth/linkedin/callback
```

### **2. Adicione a Redirect URI no LinkedIn Developer Portal:**

Siga as instruções acima na seção "CONFIGURAÇÃO NO LINKEDIN DEVELOPER PORTAL"

### **3. Inicie o backend:**

```bash
cd backend
npm run dev
```

**Você DEVE ver:**
```
🚀 Servidor rodando na porta 3001
🏢 Empresa API: http://localhost:3001/empresa
```

**SEM erros de importação!**

### **4. Inicie o frontend:**

```bash
cd empresa-frontend
npm run dev
```

### **5. Teste:**

1. Acesse: http://localhost:8080/login
2. Clique em **"Conectar com LinkedIn"**
3. Você será redirecionado para **LinkedIn.com** (não Unipile!)
4. Digite email e senha do LinkedIn
5. Autorize a aplicação
6. Será redirecionado de volta
7. ✅ **CONECTADO!**

---

## 📊 **ENDPOINTS DA API**

### **GET `/empresa/linkedin/auth`**

Inicia o fluxo OAuth e retorna URL de autorização do LinkedIn.

**Query Params:**
- `empresaId` (opcional): ID da empresa

**Resposta:**
```json
{
  "success": true,
  "authUrl": "https://www.linkedin.com/oauth/v2/authorization?..."
}
```

---

### **GET `/empresa/linkedin/callback`**

Callback do LinkedIn após autorização (processado automaticamente).

**Query Params:**
- `code`: Código de autorização do LinkedIn
- `state`: ID da empresa

**Resposta:**
- Redireciona para: `http://localhost:8080/?connected=true`

---

### **POST `/empresa/linkedin/disconnect`**

Desconecta LinkedIn da empresa.

**Query Params:**
- `empresaId` (opcional): ID da empresa

**Resposta:**
```json
{
  "success": true,
  "message": "LinkedIn desconectado com sucesso"
}
```

---

### **GET `/empresa/linkedin/status`**

Verifica se empresa está conectada.

**Query Params:**
- `empresaId` (opcional): ID da empresa

**Resposta:**
```json
{
  "success": true,
  "connected": true,
  "connectedAt": "2024-01-15T10:30:00.000Z",
  "accountId": "abc123xyz"
}
```

---

## ✅ **VANTAGENS DESTA IMPLEMENTAÇÃO**

1. ✅ **Usa o mesmo app do LinkedIn** (não precisa criar outro)
2. ✅ **NÃO afeta o fluxo do candidato** (redirect URIs diferentes)
3. ✅ **OAuth 2.0 oficial** (mais seguro e confiável)
4. ✅ **Conecta automaticamente na Unipile** após autorização
5. ✅ **UX melhor** (empresa digita credenciais no LinkedIn oficial)
6. ✅ **Escalável** (cada empresa tem seu próprio account_id)

---

## 🎯 **PRÓXIMOS PASSOS**

Após testar e confirmar que está funcionando:

1. [ ] Remover controller antigo: `linkedinConnectionController.js` (se não usar mais)
2. [ ] Remover service antigo: `unipileAccountService.js` (se não usar mais)
3. [ ] Implementar autenticação real e pegar `empresaId` do token
4. [ ] Em produção, atualizar redirect URIs para domínio real

---

## 🆘 **TROUBLESHOOTING**

### **Erro: "redirect_uri_mismatch"**
- **Causa:** A URI não está cadastrada no LinkedIn Developer Portal
- **Solução:** Adicione `http://localhost:8080/auth/linkedin/callback` nas Redirect URLs

### **Erro: "invalid_client"**
- **Causa:** CLIENT_ID ou CLIENT_SECRET incorretos
- **Solução:** Verifique as credenciais no `.env`

### **Erro: "Erro ao conectar na Unipile"**
- **Causa:** API Key da Unipile inválida ou access_token não aceito
- **Solução:** Verifique `UNIPILE_API_KEY` e teste manualmente

### **Backend não inicia (erro de importação)**
- **Causa:** Arquivo `empresaRepository` não encontrado
- **Solução:** ✅ **JÁ CORRIGIDO!** Importação atualizada para `default export`

---

## 📞 **SUPORTE**

Se encontrar problemas:

1. Verifique os logs do backend (console)
2. Verifique os logs do navegador (console)
3. Confirme que as variáveis de ambiente estão corretas
4. Teste o endpoint manualmente: `GET http://localhost:3001/empresa/linkedin/auth?empresaId=test`

---

**Tudo pronto! Agora é só testar! 🚀**

