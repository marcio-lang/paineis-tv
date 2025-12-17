# Guia de Deploy — Sistema de Painéis TV (VPS Hostinger, HTTP)

Este guia adapta o template de deploy para a sua aplicação atual, com backend Python (Flask) e domínio HTTP ativo.

## Contexto do Ambiente
- Domínio: `http://ofertascaique.cloud/`
- IP: `212.85.10.184`
- Backend: Python Flask (`/api`); endpoint de saúde referenciado em `BACKEND/app.py:442`
- Uploads: pasta configurada no backend (`BACKEND/uploads`), referenciada em `BACKEND/app.py:991` e listada em `.gitignore:1`
- Caminho recomendado na VPS: `/var/www/paineis-tv`
- Proxy: Nginx com HTTP (sem SSL por enquanto)

## Pré‑requisitos
- VPS com Ubuntu/Debian acessível via SSH
- Nginx instalado e ativo
- Python 3 e `pip3` disponíveis
- Git instalado na VPS

## Secrets do GitHub Actions
Crie em `Settings → Secrets and variables → Actions`:
- `SSH_HOST`: `212.85.10.184`
- `SSH_PORT`: `22`
- `SSH_USER`: `root` (ou `deploy`, se preferir usuário dedicado)
- `SSH_PASSWORD`: senha do usuário escolhido (se usar autenticação por senha)
- `SERVER_PATH`: `/var/www/paineis-tv`
- Opcional para pull do repositório:
  - `REPO_DEPLOY_KEY`: chave privada cuja pública está em Deploy Keys do repositório
  - ou `GH_PAT`: token de acesso (apenas leitura ao repositório) para usar HTTPS
- Opcional para upload:
  - `UPLOAD_MAX`: exemplo `150M` para ajustar `client_max_body_size`/`LimitRequestBody`

## Como o Deploy Funciona
- O workflow em `.github/workflows/deploy.yml`:
  - Conecta na VPS via SSH (senha ou chave)
  - Define `DEST` (`SERVER_PATH` ou fallback `/var/www/paineis-tv`)
  - Clona ou atualiza o repositório em `DEST`:
    - Preferência por Deploy Key SSH; caso ausente, usa `GH_PAT` via HTTPS
  - Executa `scripts/post-deploy.sh` (instala dependências e gera build quando aplicável)
  - Executa `scripts/server-tuning.sh` para aumentar limite de upload (se `UPLOAD_MAX` definido)
  - Pontos do workflow relevantes: `.github/workflows/deploy.yml:20–55` e `.github/workflows/deploy.yml:41–52`

## Disparo do Deploy
- Automático: push na branch `main`
- Manual: `Actions → Deploy to Hostinger VPS → Run workflow` (input `branch`)

## Pós‑Deploy (Backend Python)
- O script `scripts/post-deploy.sh` aplica:
  - `pip3 install -r requirements.txt` (se existir)
  - `pip3 install -U .` se houver `pyproject.toml`
- Se utilizar `gunicorn`/`systemd`, adicione um serviço:
  - Arquivo `/etc/systemd/system/paineis-tv.service` com ExecStart apontando para `gunicorn` carregando sua app Flask
  - Comandos:
    - `sudo systemctl daemon-reload`
    - `sudo systemctl enable paineis-tv`
    - `sudo systemctl restart paineis-tv`

## Nginx/Apache — Limite de Upload
- `scripts/server-tuning.sh` cria/atualiza:
  - Nginx: `/etc/nginx/conf.d/00_client_max_body_size.conf` com `client_max_body_size <UPLOAD_MAX>;`
  - Apache: `LimitRequestBody` (50 MB padrão no script)
- Reload automático após validação da configuração
- Defina `UPLOAD_MAX` em Actions para ajustar (exemplo: `150M`)

## Variáveis de Frontend
- Como o domínio é HTTP, configure URLs do frontend como:
  - `FRONTEND_API_URL`: `http://ofertascaique.cloud/api`
  - `FRONTEND_BACKEND_URL`: `http://ofertascaique.cloud`

## Resolução de Problemas
- 413 Request Entity Too Large:
  - Verifique `UPLOAD_MAX` e a execução de `scripts/server-tuning.sh`
  - Cheque Nginx: `sudo nginx -t && sudo systemctl reload nginx`
- missing server host (no Actions):
  - Falta de `SSH_HOST`/`DEPLOY_HOST`; garanta secrets preenchidos
- Permission denied (publickey) (pull via VPS):
  - Configure `REPO_DEPLOY_KEY` com Deploy Key no repo, ou use `GH_PAT` para HTTPS
- Processo do backend:
  - Se não usar `gunicorn`, o Flask embutido é apenas para desenvolvimento; recomendo `gunicorn + systemd` em produção

## Comandos Úteis (VPS)
- Testar HTTP:
  - `curl -I http://ofertascaique.cloud/`
  - `curl -s http://ofertascaique.cloud/api/health`
- Gerenciar Nginx:
  - `sudo nginx -t`
  - `sudo systemctl reload nginx`
- Atualização manual do código:
  - `cd /var/www/paineis-tv && git fetch --all --prune && git reset --hard origin/main`

## Checklist
- [ ] Secrets configurados (`SSH_*`/`DEPLOY_*`, `SERVER_PATH`)
- [ ] Credenciais de pull (`REPO_DEPLOY_KEY` ou `GH_PAT`)
- [ ] `UPLOAD_MAX` definido conforme necessidade de upload
- [ ] Nginx testado e recarregado sem erro
- [ ] Backend inicializado (`gunicorn + systemd` recomendado)
- [ ] `http://ofertascaique.cloud/api/health` retorna OK

## Observações
- O backend expõe informações úteis em `BACKEND/app.py:442` (saúde) e salva uploads conforme `BACKEND/app.py:991`
- A pasta de uploads é persistida em `BACKEND/uploads` (ver `.gitignore:1`)
- O workflow possui `workflow_dispatch` para execução manual e `concurrency` para evitar jobs concorrentes (`.github/workflows/deploy.yml:3–17`)

