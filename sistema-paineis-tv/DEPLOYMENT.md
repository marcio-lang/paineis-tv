# Guia de Deploy - Sistema de Painéis TV

Este documento fornece instruções detalhadas para deploy do Sistema de Painéis TV em diferentes ambientes.

## 📋 Pré-requisitos para Deploy

### Servidor de Produção
- Node.js 20.15.0 ou superior
- Python 3.8 ou superior
- Nginx ou Apache (recomendado)
- SSL/TLS certificado
- Domínio configurado

### Ferramentas Necessárias
- Git
- PM2 (para gerenciamento de processos)
- Certbot (para SSL gratuito)

## 🚀 Deploy Automatizado

### Usando Vercel (Recomendado para Frontend)

1. **Instalar Vercel CLI**:
```bash
npm i -g vercel
```

2. **Configurar Projeto**:
```bash
# Na raiz do projeto frontend
vercel login
vercel init
```

3. **Configurar Variáveis de Ambiente**:
```bash
vercel env add VITE_API_URL
vercel env add VITE_BACKEND_URL
```

4. **Deploy**:
```bash
vercel --prod
```

### Usando Netlify

1. **Build do Projeto**:
```bash
npm run build:prod
```

2. **Deploy via CLI**:
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

## 🖥️ Deploy Manual em Servidor

### 1. Preparação do Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar Python
sudo apt install python3 python3-pip python3-venv -y

# Instalar Nginx
sudo apt install nginx -y

# Instalar PM2
sudo npm install -g pm2
```

### 2. Configuração do Backend

```bash
# Criar diretório do projeto
sudo mkdir -p /var/www/paineis-tv
cd /var/www/paineis-tv

# Clonar repositório
git clone <url-do-repositorio> .

# Configurar backend
cd BACKEND
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configurar banco de dados
python init_db.py

# Criar arquivo de configuração PM2
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'paineis-tv-backend',
    script: 'app.py',
    interpreter: './venv/bin/python',
    cwd: '/var/www/paineis-tv/BACKEND',
    env: {
      FLASK_ENV: 'production',
      PORT: 5000
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
EOF

# Iniciar backend com PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 3. Configuração do Frontend

```bash
# Navegar para frontend
cd /var/www/paineis-tv/sistema-paineis-tv

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cat > .env.production << EOF
NODE_ENV=production
VITE_API_URL=https://seu-dominio.com/api
VITE_BACKEND_URL=https://seu-dominio.com
VITE_BUILD_MODE=production
VITE_ENABLE_SOURCEMAP=false
EOF

# Build para produção
npm run build:prod

# Copiar arquivos para Nginx
sudo cp -r dist/* /var/www/html/
```

### 4. Configuração do Nginx

```bash
# Criar configuração do site
sudo cat > /etc/nginx/sites-available/paineis-tv << EOF
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com www.seu-dominio.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Frontend
    location / {
        root /var/www/html;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Upload settings - CRÍTICO para upload de imagens
        client_max_body_size 100M;
        client_body_timeout 600s;
        client_body_buffer_size 128M;
        
        # Timeout settings - aumentados para uploads grandes
        proxy_connect_timeout 60s;
        proxy_send_timeout 600s;
        proxy_read_timeout 600s;
        proxy_request_buffering on;
    }
    
    # Media files
    location /media {
        proxy_pass http://localhost:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Ativar site
sudo ln -s /etc/nginx/sites-available/paineis-tv /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Configuração SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado SSL
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Configurar renovação automática
sudo crontab -e
# Adicionar linha:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 Scripts de Deploy

### Script de Deploy Completo

```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Iniciando deploy do Sistema de Painéis TV..."

# Configurações
PROJECT_DIR="/var/www/paineis-tv"
FRONTEND_DIR="$PROJECT_DIR/sistema-paineis-tv"
BACKEND_DIR="$PROJECT_DIR/BACKEND"

# Backup do banco de dados
echo "📦 Fazendo backup do banco de dados..."
cp $BACKEND_DIR/database.db $BACKEND_DIR/database.db.backup.$(date +%Y%m%d_%H%M%S)

# Atualizar código
echo "📥 Atualizando código..."
cd $PROJECT_DIR
git pull origin main

# Atualizar backend
echo "🐍 Atualizando backend..."
cd $BACKEND_DIR
source venv/bin/activate
pip install -r requirements.txt

# Atualizar frontend
echo "⚛️ Atualizando frontend..."
cd $FRONTEND_DIR
npm install
npm run build:prod

# Copiar arquivos para Nginx
echo "📋 Copiando arquivos para servidor web..."
sudo cp -r dist/* /var/www/html/

# Reiniciar serviços
echo "🔄 Reiniciando serviços..."
pm2 restart paineis-tv-backend
sudo systemctl reload nginx

echo "✅ Deploy concluído com sucesso!"
echo "🌐 Site disponível em: https://seu-dominio.com"
```

### Script de Rollback

```bash
#!/bin/bash
# rollback.sh

set -e

echo "⏪ Iniciando rollback..."

PROJECT_DIR="/var/www/paineis-tv"
BACKEND_DIR="$PROJECT_DIR/BACKEND"

# Restaurar backup do banco
LATEST_BACKUP=$(ls -t $BACKEND_DIR/database.db.backup.* | head -n1)
if [ -f "$LATEST_BACKUP" ]; then
    echo "📦 Restaurando backup: $LATEST_BACKUP"
    cp "$LATEST_BACKUP" "$BACKEND_DIR/database.db"
fi

# Voltar para commit anterior
cd $PROJECT_DIR
git reset --hard HEAD~1

# Rebuild e restart
cd $PROJECT_DIR/sistema-paineis-tv
npm run build:prod
sudo cp -r dist/* /var/www/html/
pm2 restart paineis-tv-backend

echo "✅ Rollback concluído!"
```

## 📊 Monitoramento

### Configuração de Logs

```bash
# Logs do PM2
pm2 logs paineis-tv-backend

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Configurar logrotate
sudo cat > /etc/logrotate.d/paineis-tv << EOF
/var/www/paineis-tv/BACKEND/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}
EOF
```

### Monitoramento de Performance

```bash
# Instalar htop para monitoramento
sudo apt install htop -y

# Configurar alertas de disco
echo "df -h | awk 'NR>1 && \$5+0 > 80 {print \$0}'" > /usr/local/bin/check-disk
chmod +x /usr/local/bin/check-disk

# Adicionar ao crontab
echo "0 */6 * * * /usr/local/bin/check-disk" | sudo crontab -
```

## 🔒 Segurança

### Configurações de Firewall

```bash
# Configurar UFW
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw status
```

### Backup Automático

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/var/backups/paineis-tv"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup do banco de dados
cp /var/www/paineis-tv/BACKEND/database.db $BACKUP_DIR/database_$DATE.db

# Backup dos uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/paineis-tv/BACKEND/uploads/

# Limpar backups antigos (manter últimos 30 dias)
find $BACKUP_DIR -name "*.db" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup concluído: $DATE"
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro 502 Bad Gateway**:
```bash
# Verificar se backend está rodando
pm2 status
pm2 restart paineis-tv-backend

# Verificar logs
pm2 logs paineis-tv-backend
```

2. **Erro de Permissões**:
```bash
# Corrigir permissões
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html
```

3. **Erro de SSL**:
```bash
# Renovar certificado
sudo certbot renew
sudo systemctl reload nginx
```

4. **Alto Uso de Memória**:
```bash
# Reiniciar PM2
pm2 restart all
pm2 flush  # Limpar logs
```

### Comandos Úteis

```bash
# Status dos serviços
sudo systemctl status nginx
pm2 status

# Verificar conectividade
curl -I https://seu-dominio.com
curl -I https://seu-dominio.com/api/health

# Monitorar recursos
htop
df -h
free -h

# Verificar logs em tempo real
tail -f /var/log/nginx/access.log
pm2 logs --lines 100
```

## 📞 Suporte Pós-Deploy

### Checklist Pós-Deploy

- [ ] Site acessível via HTTPS
- [ ] API respondendo corretamente
- [ ] Login funcionando
- [ ] Upload de imagens funcionando
- [ ] TV player carregando
- [ ] Responsividade em dispositivos móveis
- [ ] Performance adequada (< 3s carregamento)
- [ ] Backup automático configurado
- [ ] Monitoramento ativo
- [ ] SSL válido e renovação automática

### Contatos de Emergência

- **Servidor**: Provedor de hospedagem
- **DNS**: Registrar do domínio
- **SSL**: Let's Encrypt ou provedor SSL
- **Monitoramento**: Configurar alertas por email/SMS

---

**Deploy realizado com sucesso! 🎉**