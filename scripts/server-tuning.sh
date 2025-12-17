set -e
MAX="${UPLOAD_MAX:-150M}"
echo "🔧 Configurando limites de upload para: $MAX"

if command -v nginx >/dev/null 2>&1; then
  echo "📦 Nginx detectado, aplicando configurações..."
  
  # Configuração global de upload em conf.d
  CONF="/etc/nginx/conf.d/00_upload_tuning.conf"
  CONTENT="# Upload tuning - gerado automaticamente
client_max_body_size $MAX;
client_body_timeout 600s;
client_body_buffer_size 128M;
client_body_temp_path /tmp/nginx_uploads 1 2;"

  if command -v sudo >/dev/null 2>&1; then
    echo "$CONTENT" | sudo tee "$CONF" >/dev/null
  else
    echo "$CONTENT" > "$CONF"
  fi

  # Verificar e atualizar configuração do site se existir
  SITE_CONF=""
  for f in /etc/nginx/sites-available/paineis* /etc/nginx/sites-available/oferta*; do
    [ -f "$f" ] && SITE_CONF="$f" && break
  done

  if [ -n "$SITE_CONF" ] && [ -f "$SITE_CONF" ]; then
    echo "📝 Atualizando configuração do site: $SITE_CONF"
    
    # Verificar se location /api tem proxy_read_timeout adequado
    if ! grep -q "proxy_read_timeout 600" "$SITE_CONF" 2>/dev/null; then
      echo "⚠️  Timeouts insuficientes no site config. Recomendado atualizar manualmente."
      echo "   Adicione dentro de 'location /api {':"
      echo "     proxy_read_timeout 600s;"
      echo "     proxy_send_timeout 600s;"
      echo "     proxy_connect_timeout 60s;"
      echo "     client_max_body_size $MAX;"
    fi
  fi

  # Testar e recarregar Nginx
  if command -v sudo >/dev/null 2>&1; then
    sudo nginx -t && (sudo systemctl reload nginx || sudo service nginx reload || true)
  else
    nginx -t && (systemctl reload nginx || service nginx reload || true)
  fi
  
  echo "✅ Nginx configurado com sucesso!"
fi
if command -v apache2ctl >/dev/null 2>&1; then
  CONF="/etc/apache2/conf-available/upload-limit.conf"
  SIZE_BYTES="104857600"
  CONTENT="LimitRequestBody $SIZE_BYTES"
  if command -v sudo >/dev/null 2>&1; then
    echo "$CONTENT" | sudo tee "$CONF" >/dev/null
    sudo a2enconf upload-limit || true
    sudo systemctl reload apache2 || sudo service apache2 reload || true
  else
    echo "$CONTENT" > "$CONF"
    a2enconf upload-limit || true
    systemctl reload apache2 || service apache2 reload || true
  fi
fi
