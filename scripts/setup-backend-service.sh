set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/BACKEND"
if command -v python3 >/dev/null 2>&1; then
  if [ ! -d ".venv" ]; then python3 -m venv .venv; fi
  . ".venv/bin/activate"
fi
if [ -f requirements.txt ]; then pip3 install -r requirements.txt || pip install -r requirements.txt; fi
if ! "$ROOT/BACKEND/.venv/bin/gunicorn" --version >/dev/null 2>&1; then pip install gunicorn || pip3 install gunicorn; fi
mkdir -p uploads
if command -v sudo >/dev/null 2>&1; then sudo chown -R www-data:www-data uploads || true; else chown -R www-data:www-data uploads || true; fi
TMP="$(mktemp)"
cat > "$TMP" <<EOF
[Unit]
Description=PainelTV Backend
After=network.target
[Service]
Type=simple
WorkingDirectory=$ROOT/BACKEND
Environment=PYTHONUNBUFFERED=1
ExecStart=$ROOT/BACKEND/.venv/bin/gunicorn -w 3 -b 127.0.0.1:5000 app:app
Restart=always
User=www-data
[Install]
WantedBy=multi-user.target
EOF
if command -v sudo >/dev/null 2>&1; then
  sudo cp "$TMP" /etc/systemd/system/paineltv-backend.service
  sudo systemctl daemon-reload
  sudo systemctl enable paineltv-backend || true
  sudo systemctl restart paineltv-backend
else
  cp "$TMP" /etc/systemd/system/paineltv-backend.service
  systemctl daemon-reload
  systemctl enable paineltv-backend || true
  systemctl restart paineltv-backend
fi
