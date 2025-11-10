import axios from 'axios';

async function testNovaAPI() {
  const apiUrl = 'https://api23.unipile.com:15395/api/v1';
  const apiKey = '6zrHfB8m.wL+zMdMfs/8/ECxPh7M2ln/AP5k66H8yO4I83zgpDuU=';
  
  console.log('🧪 Testando nova API Key da Unipile...\n');
  
  try {
    const response = await axios.get(
      `${apiUrl}/accounts`,
      {
        headers: {
          'accept': 'application/json',
          'X-API-KEY': apiKey
        }
      }
    );
    
    console.log('✅ API FUNCIONANDO!');
    console.log('📊 Status:', response.status);
    console.log('📦 Contas conectadas:', response.data.items?.length || 0);
    
    if (response.data.items && response.data.items.length > 0) {
      console.log('\n🔍 Contas encontradas:');
      response.data.items.forEach((account, index) => {
        console.log(`\n  ${index + 1}. ${account.name}`);
        console.log(`     ID: ${account.id}`);
        console.log(`     Type: ${account.type}`);
      });
    } else {
      console.log('\n⚠️  Nenhuma conta conectada ainda');
      console.log('💡 Você pode conectar contas:');
      console.log('   - Via dashboard: https://dashboard.unipile.com');
      console.log('   - Ou via sistema (após configurar)');
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ CONFIGURAÇÃO CORRETA!');
    console.log('📝 Adicione no seu .env:');
    console.log('');
    console.log('UNIPILE_API_URL=https://api23.unipile.com:15395/api/v1');
    console.log('UNIPILE_API_KEY=6zrHfB8m.wL+zMdMfs/8/ECxPh7M2ln/AP5k66H8yO4I83zgpDuU=');
    console.log('UNIPILE_REDIRECT_URI=http://localhost:8080/auth/linkedin/callback');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('❌ ERRO:', error.response?.status || error.message);
    console.error('📦 Detalhes:', error.response?.data);
  }
}

testNovaAPI();

