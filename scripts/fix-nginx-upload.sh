#!/bin/bash
# Script para corrigir problema de upload de imagens no Nginx
# Execute na VPS: bash fix-nginx-upload.sh

set -e

echo "🔧 Corrigindo configuração do Nginx para uploads..."

# Detectar arquivo de configuração do site
SITE_CONF=""
for f in /etc/nginx/sites-available/paineis* /etc/nginx/sites-available/oferta* /etc/nginx/sites-enabled/default; do
    [ -f "$f" ] && SITE_CONF="$f" && break
done

if [ -z "$SITE_CONF" ]; then
    echo "❌ Não foi possível encontrar arquivo de configuração do Nginx"
    echo "   Listando sites disponíveis:"
    ls -la /etc/nginx/sites-available/ 2>/dev/null || echo "   (pasta não existe)"
    ls -la /etc/nginx/sites-enabled/ 2>/dev/null || echo "   (pasta não existe)"
    exit 1
fi

echo "📄 Arquivo de configuração encontrado: $SITE_CONF"

# Criar configuração global de upload
UPLOAD_CONF="/etc/nginx/conf.d/00_upload_tuning.conf"
echo "📝 Criando configuração global de upload em: $UPLOAD_CONF"

sudo tee "$UPLOAD_CONF" > /dev/null << 'EOF'
# Configuração global de upload - PainelTV
# Gerado automaticamente pelo fix-nginx-upload.sh

client_max_body_size 150M;
client_body_timeout 600s;
client_body_buffer_size 128M;
EOF

echo "✅ Configuração global criada"

# Verificar se a configuração do site precisa ser atualizada
echo ""
echo "📋 Verificando configuração do site..."

# Mostrar configuração atual de timeouts
if grep -q "proxy_read_timeout" "$SITE_CONF"; then
    current_timeout=$(grep "proxy_read_timeout" "$SITE_CONF" | head -1)
    echo "   Timeout atual: $current_timeout"
    
    if echo "$current_timeout" | grep -q "60s"; then
        echo "⚠️  ATENÇÃO: Timeout muito curto (60s) detectado!"
        echo ""
        echo "   Para corrigir, edite o arquivo $SITE_CONF"
        echo "   Encontre o bloco 'location /api {' e atualize para:"
        echo ""
        echo "   location /api {"
        echo "       ..."
        echo "       # Upload settings"
        echo "       client_max_body_size 150M;"
        echo "       client_body_timeout 600s;"
        echo "       client_body_buffer_size 128M;"
        echo ""
        echo "       # Timeout settings"
        echo "       proxy_connect_timeout 60s;"
        echo "       proxy_send_timeout 600s;"
        echo "       proxy_read_timeout 600s;"
        echo "       proxy_request_buffering on;"
        echo "   }"
    fi
else
    echo "   Nenhum proxy_read_timeout encontrado na configuração"
fi

# Testar configuração do Nginx
echo ""
echo "🧪 Testando configuração do Nginx..."
if sudo nginx -t; then
    echo "✅ Configuração válida!"
    
    # Recarregar Nginx
    echo "🔄 Recarregando Nginx..."
    sudo systemctl reload nginx || sudo service nginx reload
    echo "✅ Nginx recarregado!"
else
    echo "❌ Erro na configuração do Nginx!"
    echo "   Verifique os erros acima e corrija manualmente."
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ CORREÇÃO APLICADA COM SUCESSO!"
echo "=========================================="
echo ""
echo "A configuração global de upload foi criada."
echo ""
echo "Se o problema persistir, você precisa editar"
echo "manualmente o arquivo: $SITE_CONF"
echo ""
echo "Adicione dentro do bloco 'location /api {':"
echo "   client_max_body_size 150M;"
echo "   proxy_read_timeout 600s;"
echo "   proxy_send_timeout 600s;"
echo ""
echo "Depois execute: sudo nginx -t && sudo systemctl reload nginx"

