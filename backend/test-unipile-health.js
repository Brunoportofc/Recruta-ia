import axios from 'axios';

async function testUnipileHealth() {
  const apiUrl = 'https://api23.unipile.com:15378/api/v1';
  const apiKey = 't2tWg6dg.p7sFTiyLTj0E+kGsl5hiB+i0fHdovvHVyNspe0KG4d4=';
  
  console.log('🏥 Testando saúde da API Unipile...\n');
  
  // Teste 1: Listar contas
  console.log('1️⃣ Testando GET /accounts...');
  try {
    const response = await axios.get(
      `${apiUrl}/accounts`,
      {
        headers: {
          'accept': 'application/json',
          'X-API-KEY': apiKey
        },
        timeout: 10000 // 10 segundos
      }
    );
    console.log('✅ API respondendo! Status:', response.status);
    console.log('📊 Contas:', response.data.items?.length || 0);
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️  TIMEOUT - API muito lenta');
    } else if (error.response?.status === 502) {
      console.error('❌ 502 Bad Gateway - Servidor da Unipile indisponível');
    } else {
      console.error('❌ Erro:', error.response?.status || error.message);
    }
  }
  
  console.log('\n');
  
  // Teste 2: Criar link hosted
  console.log('2️⃣ Testando POST /hosted/accounts/link...');
  try {
    const expiresOn = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const response = await axios.post(
      `${apiUrl}/hosted/accounts/link`,
      {
        type: 'create',
        expiresOn: expiresOn,
        providers: ['LINKEDIN'],
        api_url: apiUrl,
        success_redirect_url: 'http://localhost:8080/callback',
        failure_redirect_url: 'http://localhost:8080/error',
        notify_url: 'http://localhost:3001/webhook',
        name: 'test-health-check'
      },
      {
        headers: {
          'accept': 'application/json',
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    console.log('✅ Endpoint respondendo! Status:', response.status);
    console.log('🔗 Link gerado com sucesso');
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️  TIMEOUT - API muito lenta');
    } else if (error.response?.status === 502) {
      console.error('❌ 502 Bad Gateway - Servidor da Unipile indisponível');
    } else {
      console.error('❌ Erro:', error.response?.status || error.message);
    }
  }
  
  console.log('\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💡 DIAGNÓSTICO:');
  console.log('   Se ambos os testes falharam com 502:');
  console.log('   → Servidor da Unipile está temporariamente indisponível');
  console.log('   → Aguarde alguns minutos e tente novamente');
  console.log('   → Verifique status: https://status.unipile.com (se existir)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

testUnipileHealth();

