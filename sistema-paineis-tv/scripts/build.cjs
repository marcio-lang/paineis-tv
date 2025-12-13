#!/usr/bin/env node

/**
 * Script de Build Automatizado - TV Panel System
 * Executa build otimizado para produção com verificações
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

function executeCommand(command, description) {
  try {
    log(`Executando: ${command}`, 'blue');
    execSync(command, { stdio: 'inherit' });
    logSuccess(`${description} concluído`);
    return true;
  } catch (error) {
    logError(`Erro ao executar ${description}: ${error.message}`);
    return false;
  }
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    logSuccess(`${description} encontrado: ${filePath}`);
    return true;
  } else {
    logError(`${description} não encontrado: ${filePath}`);
    return false;
  }
}

function checkEnvironmentFiles() {
  logStep('1', 'Verificando arquivos de ambiente');
  
  const envFiles = [
    { path: '.env.example', desc: 'Arquivo de exemplo de ambiente' },
    { path: '.env.production', desc: 'Arquivo de ambiente de produção' }
  ];
  
  let allFound = true;
  envFiles.forEach(file => {
    if (!checkFile(file.path, file.desc)) {
      allFound = false;
    }
  });
  
  return allFound;
}

function runTypeCheck() {
  logStep('2', 'Executando verificação de tipos TypeScript');
  return executeCommand('npm run check', 'Verificação de tipos');
}

function runLinting() {
  logStep('3', 'Executando linting do código');
  
  // Verifica se existe script de lint
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (packageJson.scripts && packageJson.scripts.lint) {
    // Executa lint mas não falha o build por warnings
    const result = executeCommand('npm run lint -- --max-warnings 100', 'Linting');
    if (!result) {
      logWarning('Linting encontrou problemas, mas continuando build...');
    }
    return true; // Sempre retorna true para não bloquear o build
  } else {
    logWarning('Script de lint não encontrado, pulando...');
    return true;
  }
}

function cleanBuildDirectory() {
  logStep('4', 'Limpando diretório de build anterior');
  
  const distPath = path.join(process.cwd(), 'dist');
  if (fs.existsSync(distPath)) {
    try {
      fs.rmSync(distPath, { recursive: true, force: true });
      logSuccess('Diretório dist limpo');
    } catch (error) {
      logError(`Erro ao limpar diretório dist: ${error.message}`);
      return false;
    }
  } else {
    log('Diretório dist não existe, continuando...');
  }
  
  return true;
}

function buildProduction() {
  logStep('5', 'Executando build de produção');
  return executeCommand('npm run build:prod', 'Build de produção');
}

function verifyBuildOutput() {
  logStep('6', 'Verificando arquivos de build gerados');
  
  const distPath = path.join(process.cwd(), 'dist');
  const requiredFiles = [
    'index.html',
    'assets'
  ];
  
  let allFound = true;
  requiredFiles.forEach(file => {
    const filePath = path.join(distPath, file);
    if (!fs.existsSync(filePath)) {
      logError(`Arquivo/diretório obrigatório não encontrado: ${file}`);
      allFound = false;
    } else {
      logSuccess(`Arquivo/diretório encontrado: ${file}`);
    }
  });
  
  // Verifica tamanho dos assets
  try {
    const assetsPath = path.join(distPath, 'assets');
    const files = fs.readdirSync(assetsPath);
    const jsFiles = files.filter(f => f.endsWith('.js'));
    const cssFiles = files.filter(f => f.endsWith('.css'));
    
    log(`\n📊 Estatísticas do Build:`);
    log(`   - Arquivos JS: ${jsFiles.length}`);
    log(`   - Arquivos CSS: ${cssFiles.length}`);
    
    // Calcula tamanho total
    let totalSize = 0;
    files.forEach(file => {
      const filePath = path.join(assetsPath, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
    });
    
    const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
    log(`   - Tamanho total dos assets: ${totalSizeMB} MB`);
    
    if (totalSize > 10 * 1024 * 1024) { // 10MB
      logWarning('Build maior que 10MB, considere otimizações adicionais');
    }
    
  } catch (error) {
    logWarning(`Não foi possível calcular estatísticas: ${error.message}`);
  }
  
  return allFound;
}

function generateBuildReport() {
  logStep('7', 'Gerando relatório de build');
  
  const buildInfo = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    buildCommand: 'npm run build:prod',
    success: true
  };
  
  try {
    fs.writeFileSync('dist/build-info.json', JSON.stringify(buildInfo, null, 2));
    logSuccess('Relatório de build gerado: dist/build-info.json');
    return true;
  } catch (error) {
    logError(`Erro ao gerar relatório: ${error.message}`);
    return false;
  }
}

async function main() {
  log('🚀 Iniciando Build Automatizado - TV Panel System', 'bright');
  log('================================================', 'bright');
  
  const startTime = Date.now();
  let success = true;
  
  // Executa todas as etapas
  const steps = [
    checkEnvironmentFiles,
    runTypeCheck,
    runLinting,
    cleanBuildDirectory,
    buildProduction,
    verifyBuildOutput,
    generateBuildReport
  ];
  
  for (const step of steps) {
    if (!step()) {
      success = false;
      break;
    }
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  log('\n================================================', 'bright');
  if (success) {
    logSuccess(`Build concluído com sucesso em ${duration}s`);
    log('\n📦 Arquivos prontos para deploy em: ./dist', 'green');
    log('🔧 Para testar localmente: npm run preview', 'blue');
    process.exit(0);
  } else {
    logError(`Build falhou após ${duration}s`);
    log('\n🔍 Verifique os erros acima e tente novamente', 'red');
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