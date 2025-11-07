# Configuração da Integração Unipile

Este documento descreve como configurar a integração com a API da Unipile para buscar localizações de vagas do LinkedIn.

## Variáveis de Ambiente

Adicione as seguintes variáveis de ambiente no arquivo `.env` do backend:

```bash
# Unipile API Configuration
UNIPILE_API_KEY=sua_api_key_aqui
UNIPILE_DSN=https://seu-dsn.unipile.com  # IMPORTANTE: DSN personalizado da sua conta
UNIPILE_ACCOUNT_ID=seu_account_id_aqui
```

**IMPORTANTE**: A Unipile usa um DSN (Domain Name System) personalizado para cada conta. O DSN não é `https://api.unipile.com`, mas sim um URL único fornecido pela Unipile para sua conta.

Você pode encontrar seu DSN:
- No painel da Unipile
- Na documentação da API da sua conta
- O schema da API está disponível em: `https://{YOUR_DSN}/api-json`

## Como Obter as Credenciais

1. **UNIPILE_API_KEY**: 
   - Acesse o painel da Unipile
   - Vá em Configurações > API
   - Gere ou copie sua API Key

2. **UNIPILE_ACCOUNT_ID**:
   - Pode ser obtido no painel da Unipile
   - Geralmente está disponível em Configurações > Conta

3. **UNIPILE_BASE_URL**:
   - URL base da API da Unipile
   - Padrão: `https://api.unipile.com`
   - Ajuste se necessário conforme a documentação oficial

## Endpoint de Localizações

O serviço tenta buscar localizações nos seguintes endpoints (nessa ordem):

1. `/v1/linkedin/locations`
2. `/v1/linkedin/job-postings/locations`
3. `/api/v1/linkedin/locations`

Se nenhum funcionar, verifique a documentação oficial da Unipile para o endpoint correto.

## Formato de Resposta Esperado

A API pode retornar localizações em diferentes formatos. O serviço aceita:

- Array direto: `[{ id: "...", name: "..." }]`
- Objeto com `data`: `{ data: [{ id: "...", name: "..." }] }`
- Objeto com `locations`: `{ locations: [{ id: "...", name: "..." }] }`
- Objeto com `results`: `{ results: [{ id: "...", name: "..." }] }`

## Testando a Integração

Para testar se a integração está funcionando:

```bash
# No backend
curl http://localhost:3001/jobs/locations
```

Você deve receber uma lista de localizações no formato:

```json
{
  "data": [
    {
      "id": "103119278",
      "name": "São Paulo - SP"
    },
    ...
  ]
}
```

## Troubleshooting

### Erro: "UNIPILE_API_KEY não configurada"
- Verifique se a variável `UNIPILE_API_KEY` está no arquivo `.env`
- Certifique-se de que o arquivo `.env` está na raiz do backend
- Reinicie o servidor após adicionar as variáveis

### Erro: "Não foi possível buscar as localizações"
- Verifique se a API Key está correta
- Verifique se o account_id está correto (se necessário)
- Consulte a documentação oficial da Unipile para o endpoint correto
- Verifique os logs do servidor para mais detalhes do erro

### Nenhuma localização retornada
- A API pode estar retornando um formato diferente
- Verifique os logs do servidor para ver a resposta completa
- Ajuste o serviço `unipileService.js` conforme necessário

## Documentação da Unipile

Para mais informações, consulte:
- [Documentação oficial da Unipile](https://www.unipile.com/br/integracao/)
- [Comunidade no Slack](https://www.unipile.com/br/integracao/) (mais de 800 desenvolvedores)

## Suporte

Se precisar de ajuda:
1. Verifique os logs do servidor
2. Consulte a documentação oficial da Unipile
3. Entre em contato com o suporte da Unipile

