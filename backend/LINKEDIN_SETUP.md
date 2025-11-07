# Configuração do LinkedIn OAuth 2.0

Este guia explica como configurar a autenticação com LinkedIn na aplicação Recruta.ai.

## 1. Criar App no LinkedIn Developers

1. Acesse [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Clique em **"Create app"**
3. Preencha as informações:
   - **App name**: Recruta.ai (ou o nome da sua aplicação)
   - **LinkedIn Page**: Selecione ou crie uma página da empresa
   - **App logo**: Upload do logo da aplicação
   - **Legal agreement**: Aceite os termos

## 2. Configurar Produtos (Products)

1. Na página do app, vá para a aba **"Products"**
2. Adicione o produto **"Sign In with LinkedIn using OpenID Connect"**
3. Aguarde aprovação (geralmente é instantâneo)

## 3. Configurar OAuth 2.0 Settings

1. Vá para a aba **"Auth"**
2. Em **"OAuth 2.0 settings"**, adicione as URLs de redirecionamento:

   **Para desenvolvimento:**
   ```
   http://localhost:5173/auth/linkedin/callback
   ```

   **Para produção:**
   ```
   https://seudominio.com/auth/linkedin/callback
   ```

3. Anote o **Client ID** e **Client Secret**

## 4. Configurar Scopes

Na mesma aba **"Auth"**, certifique-se de que os seguintes scopes estão habilitados:

- ✅ `openid`
- ✅ `profile`
- ✅ `email`
- ✅ `w_member_social` (opcional, para acesso a mais dados)

## 5. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na pasta `backend` com as seguintes variáveis:

```bash
# LinkedIn OAuth 2.0
LINKEDIN_CLIENT_ID=seu_client_id_aqui
LINKEDIN_CLIENT_SECRET=seu_client_secret_aqui
LINKEDIN_REDIRECT_URI=http://localhost:5173/auth/linkedin/callback

# JWT Secret (gere uma string aleatória segura)
JWT_SECRET=seu_secret_jwt_super_seguro_aqui

# Outras configurações
PORT=3001
FRONTEND_URL=http://localhost:5173
```

## 6. Instalar Dependências

```bash
cd backend
npm install
```

## 7. Iniciar o Servidor

```bash
npm run dev
```

## 8. Testar a Integração

1. Acesse o frontend: `http://localhost:5173`
2. Clique em "Continuar com LinkedIn"
3. Você será redirecionado para o LinkedIn
4. Após autorizar, voltará para o aplicativo com os dados preenchidos

## Dados Obtidos do LinkedIn

A API do LinkedIn fornece os seguintes dados básicos:

✅ **Disponíveis via API:**
- Nome completo
- Email
- Foto de perfil
- ID do LinkedIn

⚠️ **Limitações da API básica:**
- Experiências profissionais (requer API especial)
- Formação acadêmica (requer API especial)
- Habilidades (requer API especial)
- Telefone (não disponível)
- Endereço completo (não disponível)

> **Nota**: Para acessar experiências e formação, é necessário solicitar acesso à **Marketing Developer Platform** do LinkedIn, que tem um processo de aprovação mais rigoroso.

## Troubleshooting

### Erro: "redirect_uri_mismatch"
- Verifique se a URL de redirecionamento no LinkedIn Developer Portal corresponde exatamente à configurada no `.env`
- URLs devem incluir `http://` ou `https://`
- Não use trailing slash (`/`)

### Erro: "invalid_scope"
- Verifique se o produto "Sign In with LinkedIn using OpenID Connect" está ativado
- Aguarde alguns minutos após adicionar o produto

### Erro: "unauthorized_client"
- Verifique se o Client ID e Client Secret estão corretos
- Certifique-se de que o app está publicado (não em modo draft)

## Referências

- [LinkedIn OAuth 2.0 Documentation](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication)
- [Sign In with LinkedIn using OpenID Connect](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2)

