# Como Encontrar seu DSN da Unipile

A Unipile usa um DSN (Domain Name System) personalizado para cada conta. Você precisa configurar esse DSN no arquivo `.env` ou diretamente no código.

## Onde Encontrar seu DSN

1. **Painel da Unipile**
   - Acesse o painel da sua conta Unipile
   - Procure por "API Settings" ou "API Configuration"
   - O DSN geralmente está na forma: `https://sua-conta.unipile.com` ou similar

2. **Documentação da API**
   - A Unipile menciona que o schema da API está em: `https://{YOUR_DSN}/api-json`
   - Se você souber onde está a documentação da API, o DSN estará lá

3. **Teste Direto**
   - Tente acessar no navegador: `https://{SEU_DSN}/api-json`
   - Se funcionar, você verá o schema OpenAPI em JSON

## Como Configurar

### Opção 1: Variável de Ambiente (Recomendado)

Crie ou edite o arquivo `.env` na raiz do backend:

```bash
UNIPILE_DSN=https://seu-dsn-aqui.unipile.com
UNIPILE_API_KEY=sua_api_key_aqui
UNIPILE_ACCOUNT_ID=seu_account_id_aqui
```

### Opção 2: Direto no Código (Temporário)

Edite o arquivo `backend/services/unipileService.js`:

```javascript
this.dsn = 'https://seu-dsn-aqui.unipile.com'; // Substitua pelo seu DSN
```

## Verificação

Após configurar, reinicie o backend e verifique os logs. Você deve ver:

```
📖 Buscando schema da API OpenAPI...
📖 URL do schema: https://seu-dsn/api-json
✅ Schema da API obtido!
📋 Total de paths disponíveis: X
```

Se aparecer erro, verifique se o DSN está correto.

