/**
 * Testes Finais do Sistema - Sistema de Painéis TV
 * 
 * Este arquivo contém testes manuais para verificar todas as funcionalidades
 * principais do sistema antes do deploy em produção.
 */

console.log('🚀 Iniciando Testes Finais do Sistema - Sistema de Painéis TV');
console.log('='.repeat(60));

// Configurações de teste
const TEST_CONFIG = {
  FRONTEND_URL: 'http://localhost:3000',
  BACKEND_URL: 'http://localhost:5000',
  TEST_USER: {
    email: 'admin@paineltv.com',
    password: 'admin123'
  }
};

// Função para testar conectividade com o backend
async function testBackendConnectivity() {
  console.log('\n📡 Testando conectividade com o backend...');
  
  try {
    const response = await fetch(`${TEST_CONFIG.BACKEND_URL}/api/health`);
    if (response.ok) {
      console.log('✅ Backend está respondendo corretamente');
      return true;
    } else {
      console.log('❌ Backend retornou status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro ao conectar com o backend:', error.message);
    return false;
  }
}

// Função para testar autenticação
async function testAuthentication() {
  console.log('\n🔐 Testando sistema de autenticação...');
  
  try {
    const response = await fetch(`${TEST_CONFIG.BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(TEST_CONFIG.TEST_USER)
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.token && data.user) {
        console.log('✅ Login funcionando corretamente');
        console.log('✅ Token JWT gerado com sucesso');
        return data.token;
      }
    }
    
    console.log('❌ Falha no sistema de autenticação');
    return null;
  } catch (error) {
    console.log('❌ Erro no teste de autenticação:', error.message);
    return null;
  }
}

// Função para testar APIs de usuários
async function testUserAPI(token) {
  console.log('\n👥 Testando API de usuários...');
  
  try {
    const response = await fetch(`${TEST_CONFIG.BACKEND_URL}/api/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const users = await response.json();
      console.log(`✅ API de usuários funcionando - ${users.length} usuários encontrados`);
      return true;
    }
    
    console.log('❌ Falha na API de usuários');
    return false;
  } catch (error) {
    console.log('❌ Erro no teste da API de usuários:', error.message);
    return false;
  }
}

// Função para testar APIs de painéis
async function testPanelAPI(token) {
  console.log('\n📺 Testando API de painéis...');
  
  try {
    const response = await fetch(`${TEST_CONFIG.BACKEND_URL}/api/panels`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const panels = await response.json();
      console.log(`✅ API de painéis funcionando - ${panels.length} painéis encontrados`);
      return true;
    }
    
    console.log('❌ Falha na API de painéis');
    return false;
  } catch (error) {
    console.log('❌ Erro no teste da API de painéis:', error.message);
    return false;
  }
}

// Função para testar APIs de ações
async function testActionAPI(token) {
  console.log('\n⚡ Testando API de ações...');
  
  try {
    const response = await fetch(`${TEST_CONFIG.BACKEND_URL}/api/actions`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const actions = await response.json();
      console.log(`✅ API de ações funcionando - ${actions.length} ações encontradas`);
      return true;
    }
    
    console.log('❌ Falha na API de ações');
    return false;
  } catch (error) {
    console.log('❌ Erro no teste da API de ações:', error.message);
    return false;
  }
}

// Função para testar API do açougue
async function testButcherAPI(token) {
  console.log('\n🥩 Testando API do açougue...');
  
  try {
    const [productsResponse, configResponse] = await Promise.all([
      fetch(`${TEST_CONFIG.BACKEND_URL}/api/acougue/produtos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`${TEST_CONFIG.BACKEND_URL}/api/acougue/config`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    ]);
    
    if (productsResponse.ok && configResponse.ok) {
      const products = await productsResponse.json();
      const config = await configResponse.json();
      console.log(`✅ API do açougue funcionando - ${products.length} produtos, config OK`);
      return true;
    }
    
    console.log('❌ Falha na API do açougue');
    return false;
  } catch (error) {
    console.log('❌ Erro no teste da API do açougue:', error.message);
    return false;
  }
}

// Função principal de teste
async function runSystemTests() {
  console.log('🔍 Executando testes do sistema...\n');
  
  const results = {
    backend: false,
    auth: false,
    users: false,
    panels: false,
    actions: false,
    butcher: false
  };
  
  // Teste 1: Conectividade do backend
  results.backend = await testBackendConnectivity();
  
  if (!results.backend) {
    console.log('\n❌ Backend não está disponível. Verifique se o servidor Flask está rodando.');
    return results;
  }
  
  // Teste 2: Autenticação
  const token = await testAuthentication();
  results.auth = !!token;
  
  if (!token) {
    console.log('\n❌ Falha na autenticação. Não é possível continuar os testes.');
    return results;
  }
  
  // Teste 3: APIs principais
  results.users = await testUserAPI(token);
  results.panels = await testPanelAPI(token);
  results.actions = await testActionAPI(token);
  results.butcher = await testButcherAPI(token);
  
  return results;
}

// Função para exibir relatório final
function displayTestReport(results) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO FINAL DOS TESTES');
  console.log('='.repeat(60));
  
  const tests = [
    { name: 'Conectividade Backend', status: results.backend },
    { name: 'Sistema de Autenticação', status: results.auth },
    { name: 'API de Usuários', status: results.users },
    { name: 'API de Painéis', status: results.panels },
    { name: 'API de Ações', status: results.actions },
    { name: 'API do Açougue', status: results.butcher }
  ];
  
  tests.forEach(test => {
    const icon = test.status ? '✅' : '❌';
    const status = test.status ? 'PASSOU' : 'FALHOU';
    console.log(`${icon} ${test.name}: ${status}`);
  });
  
  const passedTests = tests.filter(t => t.status).length;
  const totalTests = tests.length;
  
  console.log('\n' + '-'.repeat(60));
  console.log(`📈 Resultado: ${passedTests}/${totalTests} testes passaram`);
  
  if (passedTests === totalTests) {
    console.log('🎉 TODOS OS TESTES PASSARAM! Sistema pronto para produção.');
  } else {
    console.log('⚠️  Alguns testes falharam. Verifique os problemas antes do deploy.');
  }
  
  console.log('\n📋 CHECKLIST MANUAL:');
  console.log('□ Testar login no frontend (http://localhost:3000/login)');
  console.log('□ Verificar responsividade em dispositivos móveis');
  console.log('□ Testar CRUD de usuários na interface');
  console.log('□ Testar CRUD de painéis na interface');
  console.log('□ Testar CRUD de ações na interface');
  console.log('□ Verificar funcionamento da TV do açougue');
  console.log('□ Testar upload de imagens');
  console.log('□ Verificar performance da aplicação');
  console.log('□ Testar logout e proteção de rotas');
  
  console.log('\n🚀 Para executar o build de produção:');
  console.log('   npm run build:prod');
  console.log('\n📦 Para testar o build:');
  console.log('   npm run preview');
}

// Executar testes
runSystemTests()
  .then(displayTestReport)
  .catch(error => {
    console.error('\n💥 Erro crítico durante os testes:', error);
    process.exit(1);
  });