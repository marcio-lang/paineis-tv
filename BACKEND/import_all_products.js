const fs = require('fs');
const https = require('https');
const http = require('http');

// Ler o arquivo TXT
const text = fs.readFileSync('../sistema-paineis-tv/ITENSMGV.TXT', 'utf8');
const lines = text.split('\n');
const pattern = /^(\d{6})(\d{3})(\d{6})(\d{3})(.+)$/;

console.log('🔄 Processando arquivo TXT...');
console.log('📄 Total de linhas:', lines.length);

const produtos = [];

for (let i = 0; i < lines.length; i++) {
  const linha = lines[i].trim();
  if (linha) {
    const match = linha.match(pattern);
    if (match) {
      const prefixo = match[1]; // 010000 (ignorado)
      const codigo = match[2]; // 3 dígitos do código
      const precoStr6Digitos = match[3]; // 6 dígitos do preço
      const sufixo = match[4]; // 3 dígitos (ignorado)
      let nome = match[5].trim(); // nome do produto
      
      // Converter preço: usar os 6 dígitos completos (001899 = R$ 18,99)
      const precoEmCentavos = parseInt(precoStr6Digitos);
      const preco = precoEmCentavos / 100;
      
      // Limpeza e formatação do nome
      nome = nome.replace(/\bkg\b/gi, '').trim();
      nome = nome.replace(/^\d+/, ''); // Remover números no início
      nome = nome.trim(); // Remover espaços extras
      
      // Correções específicas de acentuação
      nome = nome.replace(/\bPAO\b/g, 'PÃO');
      nome = nome.replace(/\bFRANCES\b/g, 'FRANCÊS');
      nome = nome.replace(/\bFILE\b/g, 'FILÉ');
      nome = nome.replace(/\bCOXAO\b/g, 'COXÃO');
      nome = nome.replace(/\bMUSCULO\b/g, 'MÚSCULO');
      
      // Aplicar Title Case
      const nomeFormatado = nome.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
      
      const produto = {
        codigo: codigo,
        name: nomeFormatado,
        price: preco,
        is_active: true
      };
      
      produtos.push(produto);
    }
  }
}

console.log('✅ Produtos processados:', produtos.length);

// Enviar para a API
const payload = JSON.stringify({ produtos: produtos });

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/acougue/import-processed',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

console.log('🚀 Enviando produtos para a API...');

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('📊 Resultado da importação:');
      console.log('✅ Produtos importados:', result.imported_count);
      if (result.errors && result.errors.length > 0) {
        console.log('❌ Erros encontrados:', result.errors.length);
        result.errors.slice(0, 5).forEach(error => console.log('  -', error));
        if (result.errors.length > 5) {
          console.log(`  ... e mais ${result.errors.length - 5} erros`);
        }
      }
    } catch (e) {
      console.log('📄 Resposta da API:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Erro na requisição:', e.message);
});

req.write(payload);
req.end();
