import axios from 'axios';

async function testNovaAPI() {
  const apiKey = '6zrHfB8m.wL+zMdMfs/8/ECxPh7M2ln/AP5k66H8yO4I83zgpDuU=';
  
  // Tentar diferentes URLs
  const urls = [
    'https://api23.unipile.com:15395/api/v1',
    'https://api1.unipile.com:13111/api/v1',
    'https://api.unipile.com/api/v1'
  ];
  
  console.log('🧪 Testando nova API Key em diferentes URLs...\n');
  
  for (const apiUrl of urls) {
    console.log(`📍 Testando: ${apiUrl}`);
    
    try {
      const response = await axios.get(
        `${apiUrl}/accounts`,
        {
          headers: {
            'accept': 'application/json',
            'X-API-KEY': apiKey
          },
          timeout: 5000
        }
      );
      
      console.log('✅ FUNCIONOU!');
      console.log('📊 Status:', response.status);
      console.log('📦 Contas:', response.data.items?.length || 0);
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ USE ESTA URL NO .env:');
      console.log(`UNIPILE_API_URL=${apiUrl}`);
      console.log(`UNIPILE_API_KEY=${apiKey}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return;
      
    } catch (error) {
      const status = error.response?.status || error.code;
      console.log(`   ❌ ${status}\n`);
    }
  }
  
  console.log('\n⚠️  Todas as URLs falharam!');
  console.log('💡 Verifique:');
  console.log('   1. API Key está correta?');
  console.log('   2. Conta Unipile está ativa?');
  console.log('   3. Servidor Unipile está online?');
}

testNovaAPI();

