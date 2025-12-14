set -e
cd "$(dirname "$0")/.."
if command -v npm >/dev/null 2>&1 && [ -f package.json ]; then npm ci --omit=dev; npm run build || true; fi
if command -v composer >/dev/null 2>&1 && [ -f composer.json ]; then composer install --no-dev --optimize-autoloader; fi
if command -v pip3 >/dev/null 2>&1; then
  if [ -f requirements.txt ]; then pip3 install -r requirements.txt; fi
  if [ -f pyproject.toml ]; then pip3 install -U . || true; fi
fi
if command -v pm2 >/dev/null 2>&1; then pm2 restart all || true; fi
