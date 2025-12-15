set -e
MAX="${UPLOAD_MAX:-100M}"
if command -v nginx >/dev/null 2>&1; then
  CONF="/etc/nginx/conf.d/00_client_max_body_size.conf"
  LINE="client_max_body_size $MAX;"
  if command -v sudo >/dev/null 2>&1; then
    echo "$LINE" | sudo tee "$CONF" >/dev/null
    sudo nginx -t
    sudo systemctl reload nginx || sudo service nginx reload || true
  else
    echo "$LINE" > "$CONF"
    nginx -t
    systemctl reload nginx || service nginx reload || true
  fi
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
