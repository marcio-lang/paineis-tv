#!/usr/bin/env node

/**
 * Script de Verificação de Saúde - TV Panel System
 * Verifica se o sistema está funcionando corretamente
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Cores para output no terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function makeRequest(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      timeout: timeout,
      headers: {
        'User-Agent': 'TV-Panel-System-Health-Check/1.0'
      }
    };
    
    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          responseTime: Date.now() - startTime
        });
      });
    });
    
    const startTime = Date.now();
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

async function checkEndpoint(name, url, expectedStatus = 200) {
  try {
    logInfo(`Verificando ${name}: ${url}`);
    const response = await makeRequest(url);
    
    if (response.statusCode === expectedStatus) {
      logSuccess(`${name} - OK (${response.responseTime}ms)`);
      return { success: true, responseTime: response.responseTime };
    } else {
      logError(`${name} - Status inesperado: ${response.statusCode}`);
      return { success: false, statusCode: response.statusCode };
    }
  } catch (error) {
    logError(`${name} - Erro: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function checkFrontend(baseUrl) {
  log('\n🌐 Verificando Frontend', 'cyan');
  
  const checks = [
    { name: 'Página Principal', url: baseUrl },
    { name: 'Assets CSS', url: `${baseUrl}/assets/index.css`, expectedStatus: [200, 404] },
    { name: 'Assets JS', url: `${baseUrl}/assets/index.js`, expectedStatus: [200, 404] }
  ];
  
  const results = [];
  for (const check of checks) {
    const result = await checkEndpoint(check.name, check.url, check.expectedStatus);
    results.push({ ...check, ...result });
  }
  
  return results;
}

async function checkBackend(baseUrl) {
  log('\n🔧 Verificando Backend APIs', 'cyan');
  
  const checks = [
    { name: 'Health Check', url: `${baseUrl}/health` },
    { name: 'API Status', url: `${baseUrl}/api/status` },
    { name: 'Auth Endpoint', url: `${baseUrl}/api/auth/status`, expectedStatus: [200, 401] },
    { name: 'Users API', url: `${baseUrl}/api/users`, expectedStatus: [200, 401] },
    { name: 'Panels API', url: `${baseUrl}/api/panels`, expectedStatus: [200, 401] },
    { name: 'Actions API', url: `${baseUrl}/api/actions`, expectedStatus: [200, 401] },
    { name: 'Butcher API', url: `${baseUrl}/api/butcher/queue`, expectedStatus: [200, 401] }
  ];
  
  const results = [];
  for (const check of checks) {
    const result = await checkEndpoint(check.name, check.url, check.expectedStatus);
    results.push({ ...check, ...result });
  }
  
  return results;
}

async function checkDatabase(backendUrl) {
  log('\n🗄️  Verificando Banco de Dados', 'cyan');
  
  try {
    logInfo('Verificando conectividade do banco via API');
    const response = await makeRequest(`${backendUrl}/api/health/db`);
    
    if (response.statusCode === 200) {
      logSuccess('Banco de dados - Conectado');
      return { success: true };
    } else {
      logError('Banco de dados - Erro de conectividade');
      return { success: false };
    }
  } catch (error) {
    logError(`Banco de dados - Erro: ${error.message}`);
    return { success: false, error: error.message };
  }
}

function generateReport(frontendResults, backendResults, dbResult) {
  log('\n📊 Relatório de Saúde do Sistema', 'bright');
  log('================================', 'bright');
  
  const allResults = [...frontendResults, ...backendResults];
  const successCount = allResults.filter(r => r.success).length;
  const totalCount = allResults.length;
  const successRate = ((successCount / totalCount) * 100).toFixed(1);
  
  log(`\n📈 Taxa de Sucesso: ${successRate}% (${successCount}/${totalCount})`);
  
  // Calcula tempo médio de resposta
  const responseTimes = allResults
    .filter(r => r.responseTime)
    .map(r => r.responseTime);
  
  if (responseTimes.length > 0) {
    const avgResponseTime = (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(0);
    log(`⏱️  Tempo Médio de Resposta: ${avgResponseTime}ms`);
  }
  
  // Status por categoria
  const frontendSuccess = frontendResults.filter(r => r.success).length;
  const backendSuccess = backendResults.filter(r => r.success).length;
  
  log(`\n🌐 Frontend: ${frontendSuccess}/${frontendResults.length} OK`);
  log(`🔧 Backend: ${backendSuccess}/${backendResults.length} OK`);
  log(`🗄️  Database: ${dbResult.success ? 'OK' : 'ERRO'}`);
  
  // Lista falhas
  const failures = allResults.filter(r => !r.success);
  if (failures.length > 0) {
    log('\n❌ Falhas Detectadas:', 'red');
    failures.forEach(failure => {
      log(`   - ${failure.name}: ${failure.error || failure.statusCode || 'Erro desconhecido'}`, 'red');
    });
  }
  
  // Status geral
  const overallHealth = successRate >= 80 && dbResult.success;
  log(`\n🏥 Status Geral: ${overallHealth ? 'SAUDÁVEL' : 'REQUER ATENÇÃO'}`, overallHealth ? 'green' : 'yellow');
  
  return {
    successRate,
    overallHealth,
    frontendSuccess,
    backendSuccess,
    dbSuccess: dbResult.success,
    failures: failures.length
  };
}

async function main() {
  log('🏥 Verificação de Saúde - TV Panel System', 'bright');
  log('=========================================', 'bright');
  
  // Obtém URLs dos argumentos ou usa padrões
  const args = process.argv.slice(2);
  const frontendUrl = args[0] || 'http://localhost:3000';
  const backendUrl = args[1] || 'http://localhost:5000';
  
  log(`\n🎯 Frontend URL: ${frontendUrl}`);
  log(`🎯 Backend URL: ${backendUrl}`);
  
  const startTime = Date.now();
  
  try {
    // Executa verificações
    const frontendResults = await checkFrontend(frontendUrl);
    const backendResults = await checkBackend(backendUrl);
    const dbResult = await checkDatabase(backendUrl);
    
    // Gera relatório
    const report = generateReport(frontendResults, backendResults, dbResult);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    log(`\n⏱️  Verificação concluída em ${duration}s`, 'blue');
    
    // Salva relatório em arquivo
    const reportData = {
      timestamp: new Date().toISOString(),
      frontendUrl,
      backendUrl,
      duration: parseFloat(duration),
      results: {
        frontend: frontendResults,
        backend: backendResults,
        database: dbResult
      },
      summary: report
    };
    
    const fs = require('fs');
    const path = require('path');
    
    try {
      const reportsDir = path.join(process.cwd(), 'health-reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      
      const reportFile = path.join(reportsDir, `health-check-${new Date().toISOString().split('T')[0]}.json`);
      fs.writeFileSync(reportFile, JSON.stringify(reportData, null, 2));
      
      logSuccess(`Relatório salvo: ${reportFile}`);
    } catch (error) {
      logWarning(`Não foi possível salvar relatório: ${error.message}`);
    }
    
    // Exit code baseado na saúde geral
    process.exit(report.overallHealth ? 0 : 1);
    
  } catch (error) {
    logError(`Erro durante verificação: ${error.message}`);
    process.exit(1);
  }
}

// Executa apenas se chamado diretamente
if (require.main === module) {
  main().catch(error => {
    logError(`Erro inesperado: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { main, checkEndpoint, checkFrontend, checkBackend };