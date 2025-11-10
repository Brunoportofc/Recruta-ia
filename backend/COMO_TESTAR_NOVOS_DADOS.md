# 🧪 COMO TESTAR A EXTRAÇÃO DE DADOS COMPLETA

## ⚡ **TESTE RÁPIDO (5 MINUTOS)**

### **1. Prepare o Ambiente:**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd empresa-frontend
npm run dev
```

### **2. Limpe Dados Anteriores:**

**Opção A: Via Prisma Studio**
```bash
cd backend
npx prisma studio

# Vá em "empresas"
# Delete todos os registros
```

**Opção B: Via Dashboard Unipile**
```
https://account.unipile.com/
# Delete a conta LinkedIn conectada
```

### **3. Conecte o LinkedIn:**

```
1. Acesse: http://localhost:8080/login
2. Clique em "Conectar com LinkedIn"
3. Faça login no LinkedIn
4. Conecte sua conta
5. Clique em "Close" na Unipile
6. Aguarde até 60 segundos
```

### **4. Observe os Logs do Backend:**

Você deve ver algo assim:

```bash
📦 [CALLBACK] Dados do LinkedIn recebidos: {...}

👤 [CALLBACK] Nome da pessoa: Seu Nome
📸 [CALLBACK] Avatar encontrado: https://...
💼 [CALLBACK] Headline: Sua descrição
📍 [CALLBACK] Location: Sua cidade
✉️  [CALLBACK] Email gerado: seuusername@linkedin.com

🏢 [CALLBACK] Company Page encontrada!
🏢 [CALLBACK] Nome da empresa: FACTORIA
🎨 [CALLBACK] Logo da empresa: https://...
🏭 [CALLBACK] Indústria: Technology
📝 [CALLBACK] Descrição: Somos uma empresa...
🌐 [CALLBACK] Website: https://factoria.com
👥 [CALLBACK] Funcionários: 11-50
📍 [CALLBACK] Location da empresa: São Paulo, Brasil

💾 [CALLBACK] Salvando dados no banco...
✅ [CALLBACK] Empresa atualizada com sucesso!
```

### **5. Verifique as Configurações:**

```
1. Acesse: http://localhost:8080/settings
2. Você deve ver:
   ✅ Logo da empresa (imagem)
   ✅ Nome: FACTORIA
   ✅ Slogan/Headline
   ✅ Setor: Technology
   ✅ Localização
   ✅ Funcionários: 11-50
   ✅ Website
   ✅ Descrição completa
```

### **6. Verifique no Banco de Dados:**

```bash
cd backend
npx prisma studio

# Vá em "empresas"
# Clique no registro
# Veja TODOS os campos preenchidos:
# - avatar
# - logo
# - headline
# - description
# - industry
# - location
# - website
# - employeeCount
```

---

## ✅ **CHECKLIST DE VERIFICAÇÃO**

Use esta checklist para confirmar que tudo está funcionando:

### **Backend:**
- [ ] Servidor rodando sem erros
- [ ] Logs mostram extração de dados
- [ ] Logs mostram "Company Page encontrada!" (se tiver)
- [ ] Logs mostram todos os campos sendo extraídos
- [ ] Logs mostram "Empresa atualizada com sucesso!"

### **Frontend - Login:**
- [ ] Botão "Conectar com LinkedIn" funciona
- [ ] Redireciona para Unipile
- [ ] Aguarda até 60 segundos após clicar "Close"
- [ ] Exibe "LinkedIn conectado! Entrando no sistema..."
- [ ] Redireciona para dashboard

### **Frontend - Dashboard:**
- [ ] Nome da empresa aparece
- [ ] Badge "LinkedIn conectado" aparece

### **Frontend - Configurações:**
- [ ] Logo da empresa aparece (se houver)
- [ ] Nome da empresa preenchido
- [ ] Email/LinkedIn ID preenchido
- [ ] Slogan/Headline aparece (se houver)
- [ ] Setor/Indústria aparece (se houver)
- [ ] Localização aparece (se houver)
- [ ] Funcionários aparece (se houver)
- [ ] Website aparece (se houver)
- [ ] Descrição aparece (se houver)
- [ ] Badge verde "LinkedIn conectado em [data]"

### **Banco de Dados:**
- [ ] Tabela `empresas` tem todos os novos campos
- [ ] Registro da empresa tem dados preenchidos
- [ ] `unipileConnected` está `true`
- [ ] `unipileConnectedAt` tem data/hora

---

## 🐛 **TROUBLESHOOTING**

### **Problema: Logo não aparece**

**Possíveis causas:**
1. Você não administra nenhuma Company Page
2. A Company Page não tem logo configurada
3. Unipile não retornou o campo `organizations[]`

**Solução:**
- Verifique nos logs se aparece "Company Page encontrada!"
- Se não aparecer, você está usando dados do perfil pessoal
- Avatar aparecerá no lugar do logo

### **Problema: Alguns campos não aparecem**

**Possíveis causas:**
1. Campos não configurados no LinkedIn
2. Unipile não retornou esses campos

**Solução:**
- É normal! Nem todos os campos são obrigatórios
- Configure os campos no LinkedIn e reconecte

### **Problema: "Nenhuma Company Page encontrada"**

**Possíveis causas:**
1. Você não administra nenhuma página de empresa no LinkedIn
2. Sua conta não tem permissão de admin na página

**Solução:**
- Crie uma Company Page no LinkedIn
- Torne-se admin da página
- Reconecte o LinkedIn

### **Problema: Campos aparecem vazios**

**Possíveis causas:**
1. Dados ainda não foram salvos (ainda processando)
2. Erro ao salvar no banco

**Solução:**
- Aguarde 60 segundos após clicar "Close"
- Verifique logs do backend para erros
- Recarregue a página de Configurações

---

## 📸 **EXEMPLOS DE DADOS EXTRAÍDOS**

### **Exemplo 1: Com Company Page (Ideal)**

```json
{
  "nome": "FACTORIA",
  "email": "factoria@linkedin.com",
  "avatar": "https://media.licdn.com/dms/image/.../profile-photo.jpg",
  "logo": "https://media.licdn.com/dms/image/.../company-logo.png",
  "headline": "Inovação em Tecnologia",
  "description": "Somos uma empresa de tecnologia focada em inovação...",
  "industry": "Technology, Information Technology",
  "location": "São Paulo, Brasil",
  "website": "https://factoria.com",
  "employeeCount": "11-50",
  "unipileConnected": true
}
```

### **Exemplo 2: Sem Company Page (Perfil Pessoal)**

```json
{
  "nome": "João Silva",
  "email": "joaosilva@linkedin.com",
  "avatar": "https://media.licdn.com/dms/image/.../profile-photo.jpg",
  "logo": null,
  "headline": "CEO & Founder | Empreendedor",
  "description": null,
  "industry": null,
  "location": "Rio de Janeiro",
  "website": null,
  "employeeCount": null,
  "unipileConnected": true
}
```

---

## 🎯 **PRÓXIMO TESTE: Reconexão**

Após conectar com sucesso uma vez, teste:

```
1. Faça logout
2. Volte para /login
3. Clique em "Conectar com LinkedIn"
4. ✅ Deve fazer login automático (sem pedir conexão novamente)
5. ✅ Deve redirecionar direto para dashboard
```

---

## 🚀 **TESTE AVANÇADO: Múltiplas Company Pages**

Se você administra múltiplas páginas:

```
1. Conecte LinkedIn
2. Observe logs: quantas organizações aparecem?
3. Sistema usa a PRIMEIRA (organizations[0])
4. Futuro: permitir escolher qual usar
```

---

**Pronto para testar! Siga o passo a passo e observe os logs! 🎉**

