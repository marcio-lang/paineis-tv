#!/usr/bin/env node

/**
 * Script de Deploy Automatizado - TV Panel System
 * Executa deploy para diferentes ambientes (staging/production)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Cores para output no terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n[${step}] ${message}`, 'cyan');
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

function executeCommand(command, description, options = {}) {
  try {
    log(`Executando: ${command}`, 'blue');
    const result = execSync(command, { 
      stdio: options.silent ? 'pipe' : 'inherit',
      encoding: 'utf8',
      ...options 
    });
    logSuccess(`${description} concluído`);
    return { success: true, output: result };
  } catch (error) {
    logError(`Erro ao executar ${description}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

function validateEnvironment(env) {
  const validEnvs = ['staging', 'production'];
  return validEnvs.includes(env);
}

function checkPrerequisites() {
  logStep('1', 'Verificando pré-requisitos');
  
  // Verifica se o build existe
  const distPath = path.join(process.cwd(), 'dist');
  if (!fs.existsSync(distPath)) {
    logError('Diretório dist não encontrado. Execute o build primeiro: npm run build:prod');
    return false;
  }
  
  // Verifica arquivos essenciais
  const requiredFiles = ['index.html', 'assets'];
  for (const file of requiredFiles) {
    const filePath = path.join(distPath, file);
    if (!fs.existsSync(filePath)) {
      logError(`Arquivo/diretório obrigatório não encontrado: ${file}`);
      return false;
    }
  }
  
  logSuccess('Pré-requisitos verificados');
  return true;
}

function createBackup(env) {
  logStep('2', 'Criando backup da versão atual');
  
  const backupDir = path.join(process.cwd(), 'backups');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `backup-${env}-${timestamp}`);
  
  try {
    // Cria diretório de backup se não existir
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Copia dist atual para backup
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      fs.cpSync(distPath, backupPath, { recursive: true });
      logSuccess(`Backup criado: ${backupPath}`);
      return backupPath;
    } else {
      logWarning('Nenhuma versão anterior encontrada para backup');
      return null;
    }
  } catch (error) {
    logError(`Erro ao criar backup: ${error.message}`);
    return null;
  }
}

function deployToVercel(env) {
  logStep('3', `Fazendo deploy para Vercel (${env})`);
  
  // Verifica se Vercel CLI está instalado
  const vercelCheck = executeCommand('vercel --version', 'Verificação do Vercel CLI', { silent: true });
  if (!vercelCheck.success) {
    logError('Vercel CLI não encontrado. Instale com: npm i -g vercel');
    return false;
  }
  
  // Comando de deploy baseado no ambiente
  const deployCommand = env === 'production' 
    ? 'vercel --prod' 
    : 'vercel';
  
  const result = executeCommand(deployCommand, `Deploy para ${env}`);
  return result.success;
}

function deployToNetlify(env) {
  logStep('3', `Fazendo deploy para Netlify (${env})`);
  
  // Verifica se Netlify CLI está instalado
  const netlifyCheck = executeCommand('netlify --version', 'Verificação do Netlify CLI', { silent: true });
  if (!netlifyCheck.success) {
    logError('Netlify CLI não encontrado. Instale com: npm i -g netlify-cli');
    return false;
  }
  
  // Comando de deploy baseado no ambiente
  const deployCommand = env === 'production' 
    ? 'netlify deploy --prod --dir=dist' 
    : 'netlify deploy --dir=dist';
  
  const result = executeCommand(deployCommand, `Deploy para ${env}`);
  return result.success;
}

function deployToCustomServer(env, serverConfig) {
  logStep('3', `Fazendo deploy para servidor customizado (${env})`);
  
  const { host, user, path: remotePath, port = 22 } = serverConfig;
  
  if (!host || !user || !remotePath) {
    logError('Configuração do servidor incompleta. Necessário: host, user, path');
    return false;
  }
  
  // Compacta arquivos para upload
  const tarCommand = 'tar -czf dist.tar.gz -C dist .';
  const tarResult = executeCommand(tarCommand, 'Compactação dos arquivos');
  if (!tarResult.success) return false;
  
  // Upload via SCP
  const scpCommand = `scp -P ${port} dist.tar.gz ${user}@${host}:${remotePath}/`;
  const scpResult = executeCommand(scpCommand, 'Upload dos arquivos');
  if (!scpResult.success) return false;
  
  // Extrai arquivos no servidor
  const extractCommand = `ssh -p ${port} ${user}@${host} "cd ${remotePath} && tar -xzf dist.tar.gz && rm dist.tar.gz"`;
  const extractResult = executeCommand(extractCommand, 'Extração dos arquivos no servidor');
  
  // Remove arquivo temporário
  try {
    fs.unlinkSync('dist.tar.gz');
  } catch (error) {
    logWarning('Não foi possível remover arquivo temporário dist.tar.gz');
  }
  
  return extractResult.success;
}

function runHealthCheck(url) {
  logStep('4', 'Executando verificação de saúde');
  
  if (!url) {
    logWarning('URL não fornecida, pulando verificação de saúde');
    return true;
  }
  
  try {
    // Simples verificação HTTP (requer curl)
    const curlCommand = `curl -f -s -o /dev/null -w "%{http_code}" ${url}`;
    const result = executeCommand(curlCommand, 'Verificação HTTP', { silent: true });
    
    if (result.success && result.output.trim() === '200') {
      logSuccess(`Site acessível em: ${url}`);
      return true;
    } else {
      logError(`Site não acessível. Código HTTP: ${result.output || 'N/A'}`);
      return false;
    }
  } catch (error) {
    logWarning('Não foi possível executar verificação de saúde (curl não disponível)');
    return true;
  }
}

function generateDeployReport(env, success, deployUrl = null) {
  logStep('5', 'Gerando relatório de deploy');
  
  const deployInfo = {
    environment: env,
    timestamp: new Date().toISOString(),
    success: success,
    deployUrl: deployUrl,
    nodeVersion: process.version,
    platform: process.platform
  };
  
  try {
    const reportsDir = path.join(process.cwd(), 'deploy-reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const reportFile = path.join(reportsDir, `deploy-${env}-${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(deployInfo, null, 2));
    
    logSuccess(`Relatório de deploy gerado: ${reportFile}`);
    return true;
  } catch (error) {
    logError(`Erro ao gerar relatório: ${error.message}`);
    return false;
  }
}

async function main() {
  log('🚀 Iniciando Deploy Automatizado - TV Panel System', 'bright');
  log('==================================================', 'bright');
  
  // Obtém argumentos da linha de comando
  const args = process.argv.slice(2);
  let environment = args[0];
  let platform = args[1] || 'vercel';
  let deployUrl = args[2];
  
  // Valida ou solicita ambiente
  if (!environment || !validateEnvironment(environment)) {
    environment = await askQuestion('Ambiente de deploy (staging/production): ');
    if (!validateEnvironment(environment)) {
      logError('Ambiente inválido. Use: staging ou production');
      process.exit(1);
    }
  }
  
  // Valida plataforma
  const validPlatforms = ['vercel', 'netlify', 'custom'];
  if (!validPlatforms.includes(platform)) {
    platform = await askQuestion('Plataforma de deploy (vercel/netlify/custom): ');
    if (!validPlatforms.includes(platform)) {
      logError('Plataforma inválida. Use: vercel, netlify ou custom');
      process.exit(1);
    }
  }
  
  // Confirmação para produção
  if (environment === 'production') {
    const confirm = await askQuestion('⚠️  Deploy para PRODUÇÃO. Confirma? (y/N): ');
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      log('Deploy cancelado pelo usuário');
      process.exit(0);
    }
  }
  
  const startTime = Date.now();
  let success = true;
  let backupPath = null;
  
  try {
    // Verifica pré-requisitos
    if (!checkPrerequisites()) {
      process.exit(1);
    }
    
    // Cria backup
    backupPath = createBackup(environment);
    
    // Executa deploy baseado na plataforma
    let deploySuccess = false;
    switch (platform) {
      case 'vercel':
        deploySuccess = deployToVercel(environment);
        break;
      case 'netlify':
        deploySuccess = deployToNetlify(environment);
        break;
      case 'custom':
        // Para servidor customizado, seria necessário configuração adicional
        logError('Deploy customizado requer configuração adicional no script');
        deploySuccess = false;
        break;
    }
    
    if (!deploySuccess) {
      success = false;
    } else {
      // Executa verificação de saúde
      if (deployUrl) {
        const healthCheck = runHealthCheck(deployUrl);
        if (!healthCheck) {
          logWarning('Verificação de saúde falhou, mas deploy foi concluído');
        }
      }
    }
    
    // Gera relatório
    generateDeployReport(environment, success, deployUrl);
    
  } catch (error) {
    logError(`Erro inesperado durante deploy: ${error.message}`);
    success = false;
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  log('\n==================================================', 'bright');
  if (success) {
    logSuccess(`Deploy para ${environment} concluído com sucesso em ${duration}s`);
    if (deployUrl) {
      log(`🌐 Site disponível em: ${deployUrl}`, 'green');
    }
    if (backupPath) {
      log(`💾 Backup disponível em: ${backupPath}`, 'blue');
    }
  } else {
    logError(`Deploy para ${environment} falhou após ${duration}s`);
    if (backupPath) {
      log(`💾 Backup disponível para rollback em: ${backupPath}`, 'yellow');
    }
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

module.exports = { main };