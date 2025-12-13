# Plano de Implementação do Novo App (React + Tailwind) usando "LAYOUT NOVO"

Este documento orienta a recriação do sistema atual utilizando o layout da pasta `LAYOUT NOVO`, preservando as funcionalidades existentes e adicionando o CRUD completo de usuário e autenticação. Estrutura-se por grupos e ordem cronológica de execução.

---

## 1. Escopo e Objetivos
- **Objetivo principal**: Migrar o frontend atual para React com o layout de `LAYOUT NOVO`, mantendo as funcionalidades de Painéis/Ações e Painel do Açougue (Admin + TV), e acrescentando um **CRUD completo de Usuários** com autenticação de sessões (login, manter sessão, logout).
- **Backend**: Reaproveitar o Flask já existente em `BACKEND/app.py` (APIs de painéis, ações, mídia e açougue). Incluir novas rotas para usuários e sessões.
- **Frontend**: Basear em `LAYOUT NOVO` (Vite + TS + Tailwind), integrando rotas e contextos, e portar telas atuais.

---

## 2. Funcionalidades Atuais (para manter)
- **Painéis (Panel)**: CRUD e listagem, estatísticas, abrir player por `fixed_url`.
- **Ações (Action)**: CRUD, associação a múltiplos painéis, upload/remoção de imagens, listagem e status (ativas/expiradas).
- **Player**: Endpoint `/api/player/<fixed_url>` exibindo ações ativas com imagens e layout.
- **Mídia legada**: Upload/listagem/remoção por painel (compatibilidade).
- **Açougue**:
  - Admin: CRUD de `ButcherProduct`, import/export, upload de fundo, configurações (polling interval).
  - TV: Grid 6x4 com preços, carrossel e overlay, consumo de `/api/acougue`.

---

## 3. Novas Funcionalidades (acréscimos)
- **CRUD completo de Usuário** (backend + frontend):
  - Cadastro, listagem paginada, detalhar/editar, inativar/ativar, excluir.
  - Validações mínimas (nome, email único, senha hash).
- **Autenticação e Sessão**:
  - Telas de login e registro (reusar `LAYOUT NOVO/src/pages/auth/*`).
  - Criação de sessão (login) e verificação em cada request (JWT ou cookie de sessão).
  - Manter sessão (persistência em `localStorage`/cookie + refresh do contexto).
  - Logout.

---

## 4. Arquitetura Alvo
- **Frontend (Vite + React + TS)**
  - Reaproveitar `LAYOUT NOVO` como base (componentes `base/*`, `contexts/*`, `router/*`, `pages/auth/*`).
  - Criar páginas: `pages/panels`, `pages/actions`, `pages/acougue/admin`, `pages/acougue/tv`, `pages/player`.
  - Contextos: `AuthContext` (adaptado para API real), `ThemeContext`, `ColorContext`.
  - Estilo: Tailwind com tokens do layout; manter gradientes existentes.
- **Backend (Flask + SQLAlchemy)**
  - Modelos existentes: `Panel`, `Action`, `ActionImage`, `ButcherProduct`, `ButcherPanelConfig`.
  - Novos modelos: `User` (id, name, email único, password_hash, role, active, timestamps).
  - Sessões: JWT (header Authorization: Bearer) ou cookie de sessão (HttpOnly). Sugestão: JWT simples.

---

## 5. Ordem Cronológica (Fases e Tarefas)

### Fase 0 — Preparação
1. Criar novo app base usando `LAYOUT NOVO` (Vite + TS) na pasta `FRONTEND` (ou migrar código atual para a base TS do layout).
2. Configurar Tailwind (`tailwind.config.ts`) e PostCSS conforme `LAYOUT NOVO`.
3. Habilitar rotas com `react-router-dom` usando `LAYOUT NOVO/src/router/*`.

### Fase 1 — Autenticação e Usuários (Backend)
1. Modelo `User` (Flask/SQLAlchemy): `id`, `name`, `email` (unique), `password_hash`, `role` ('admin'|'user'), `active` (bool), timestamps.
2. Utilitários: hash de senha (Werkzeug `generate_password_hash`/`check_password_hash`).
3. Rotas:
   - `POST /api/auth/register` (admin-only opcional para criar outros usuários; público para primeiro usuário).
   - `POST /api/auth/login` (retorna JWT ou seta cookie de sessão).
   - `POST /api/auth/logout` (invalidar token no cliente; se cookie, limpar cookie).
   - `GET /api/auth/me` (retorna usuário atual).
   - `GET /api/users` (lista paginada; admin-only), `POST /api/users` (admin-only).
   - `GET /api/users/:id`, `PUT /api/users/:id`, `DELETE /api/users/:id` (admin-only).
4. Middleware simples de auth (decorator) para proteger rotas.

### Fase 2 — Autenticação e Usuários (Frontend)
1. Adaptar `AuthContext` para API real:
   - `login(email, password)`: chama `/api/auth/login`, salva token/cookie, carrega `/api/auth/me` e persiste `user`.
   - `logout()`: limpa token/cookie e estado.
   - `useEffect` inicial: verificar token/cookie, chamar `/api/auth/me`.
2. Rotas de Auth: reusar telas de `LAYOUT NOVO/src/pages/auth/*` (login/register/forgot/reset/etc). Conectar com API real nas telas de `login` e `register`.
3. Rota protegida (HOC ou componente `ProtectedRoute`) para páginas internas (painéis, ações, açougue admin). Player e TV do açougue podem ser públicos.
4. CRUD de usuários no frontend:
   - Nova página `pages/users` com tabela (usar `components/base/Table`), formulários (usar `Input`, `Modal`, `Button`).
   - Ações: criar/editar/ativar/desativar/excluir; paginação client-side inicial (ou server-side com query params).

### Fase 3 — Migração das Telas Atuais para o Layout Novo
1. Painéis/Actions Dashboard (migrar `FRONTEND/src/components/Dashboard.js`):
   - Criar `pages/panels/index.tsx` e `pages/actions/index.tsx` com layout e componentes do `LAYOUT NOVO`.
   - Importar estatísticas e tabs usando componentes do layout (Cards/Badge/Tabs/Button).
   - Conectar APIs existentes: `/api/panels`, `/api/actions`, `/api/actions/:id`, `/api/panels/:id`.
2. Formulários de Painel e Ação:
   - Criar `components/panels/PanelForm.tsx` e `components/actions/ActionForm.tsx` com Inputs/Modal do layout.
   - Upload de imagens das ações: `/api/actions/:id/images` (multifile).
3. Player:
   - `pages/player/[fixedUrl].tsx`: consumir `/api/player/<fixed_url>`, renderizar layouts.
4. Açougue:
   - Admin: `pages/acougue/admin.tsx` (migrar de `ButcherAdmin.js`), usar `Table`, `Input`, `Button`, upload, import/export.
   - TV: `pages/acougue/tv.tsx` (migrar de `ButcherTV.js`), manter gradientes e estilos, consumir `/api/acougue`.

### Fase 4 — Refinos e Integração Visual
1. Aplicar `Header` e navegação do `LAYOUT NOVO` às páginas internas.
2. i18n: manter `pt-BR` como padrão (pasta `i18n/local/pt-BR`).
3. Temas e cores: `ThemeContext`/`ColorContext`; manter gradientes nos componentes principais.
4. Acessibilidade e feedbacks (loaders, estados vazios, erros).

### Fase 5 — Deploy e Testes
1. Variáveis de ambiente (`VITE_API_URL` no frontend, `PORT`/`HOST` no backend).
2. Testar com `ngrok` (`ngrok http http://localhost:5173/`) para validar o frontend remotamente.
3. Docker (opcional): usar `Dockerfile` existentes e ajustar se necessário.

---

## 6. Detalhamento Técnico — CRUD de Usuários e Auth

### Backend (Flask)
- Modelo `User`:
  - Campos: `id` (uuid), `name`, `email` (unique), `password_hash`, `role` ('admin'|'user'), `active` (bool), `created_at`, `updated_at`.
- Rotas:
  - `POST /api/auth/register`: cria usuário (validar email único; hash de senha).
  - `POST /api/auth/login`: valida credenciais; retorna `{ token, user }`.
  - `GET /api/auth/me`: requer token; retorna `user`.
  - `POST /api/auth/logout`: client-side; opcional server invalidation.
  - `GET /api/users` (admin), `POST /api/users` (admin).
  - `GET/PUT/DELETE /api/users/:id` (admin).
- Autorização:
  - Decorator `@require_auth(role='admin'|None)` lendo JWT no header `Authorization`.
  - Senhas com `werkzeug.security`.

### Frontend (React + Vite + TS)
- `contexts/AuthContext.tsx` (adaptar):
  - Estado: `user`, `isLoading`, `token` (se JWT).
  - `login`: chama `/api/auth/login`, salva `token` em `localStorage`, popula `user` com `/api/auth/me`.
  - `logout`: limpa storage e estado.
  - Persistência: `useEffect` on mount para revalidar `/api/auth/me` se houver token.
- Rotas de Auth: reusar `pages/auth/login/page.tsx` e `pages/auth/register/page.tsx` para chamar API real.
- Proteção de rotas: componente `ProtectedRoute` que lê `useAuth()` e redireciona para `/auth/login`.
- Página `pages/users/index.tsx`:
  - Tabela com `Table` (colunas: Nome, Email, Papel, Status, Criado em, Ações).
  - Modais de criar/editar; validação básica.
  - Botões: Ativar/Desativar, Excluir (confirmação), Salvar.

---

## 7. Escolha do Componente Representativo e Detalhes
- **Componente representativo**: `Table` (`LAYOUT NOVO/src/components/base/Table.tsx`) — cobre a maior parte das necessidades das telas de listagem (Painéis, Ações, Usuários, Produtos do Açougue).
- **Como aplicar**:
  - Padrão de colunas:
    ```ts
    const columns = [
      { key: 'name', title: 'Nome', sortable: true },
      { key: 'email', title: 'Email' },
      { key: 'role', title: 'Perfil' },
      { key: 'active', title: 'Status', render: (v) => v ? 'Ativo' : 'Inativo' },
      { key: 'actions', title: 'Ações', render: (_, r) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onEdit(r)}>Editar</Button>
          <Button size="sm" variant="outline" onClick={() => onToggle(r)}>{r.active ? 'Desativar' : 'Ativar'}</Button>
          <Button size="sm" variant="danger" onClick={() => onDelete(r.id)}>Excluir</Button>
        </div>
      )}
    ];
    ```
  - Paginação: usar prop `pagination` do componente e salvar `current`, `pageSize`, `total` no estado; implementar busca/ordenação simples no client (ou via query params no servidor).
  - Estilo: o `Table` já herda tema claro/escuro; manter gradientes nas áreas de header/cards.

---

## 8. Mapeamento de Rotas (Frontend)
- Públicas:
  - `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-email`, `/auth/two-factor` (se aplicável).
  - `/p/:fixedUrl` (Player), `/acougue/tv` (TV do Açougue).
- Protegidas (requer login):
  - `/` (Dashboard), `/panels`, `/actions`, `/users`, `/acougue` (Admin).

---

## 9. Integração com Backend
- Base URL dinâmica (mantendo lógica atual): se `localhost`, usar `http://localhost:5000`; senão, `protocol//host:5000`.
- Envio de `Authorization: Bearer <token>` nas requisições autenticadas.
- Uploads via `multipart/form-data` para endpoints de imagens e import.

---

## 10. Considerações de UX e UI
- Manter gradientes para temas claro/escuro, respeitando preferência do usuário.
- Estados vazios, carregamento e erro coerentes (componentes Alert/Badge/Modal do layout).
- Confirm dialogs antes de excluir; feedbacks via toasts ou alerts.

---

## 11. Checklist por Fase
- F0: Vite + Tailwind ok; rotas base; providers de tema e auth registrados.
- F1: Modelo `User` + rotas auth + hash de senha + middleware.
- F2: `AuthContext` integrado + telas login/registro + rota protegida.
- F3: Páginas migradas (painéis, ações, player, açougue admin/TV) + formulários + upload.
- F4: UI refinada + i18n + temas + acessibilidade.
- F5: Variáveis ambiente + testes locais + `ngrok` para validação externa.

---

## 12. Pós-implantação
- Auditar logs de erros (backend e frontend) e ajustar limites (ex.: upload 100MB).
- Planejar autorização por papel (role-based) nas páginas sensíveis.
- Backup do SQLite e política de arquivo estático em `uploads/`.

---

## 13. Instruções de Implementação — Passo a Passo (Auth + Usuários)

### 13.1 Backend (Flask)
1. Dependências:
   - Já presente: Flask, Flask-CORS, Flask-SQLAlchemy, Werkzeug. Se optar por JWT, adicionar `PyJWT` (ou usar um token simples assinado).
2. Modelo `User` em `BACKEND/app.py` (após demais modelos):
   - Criar classe `User` com campos: `id`, `name`, `email` (unique), `password_hash`, `role`, `active`, `created_at`, `updated_at`.
   - Utilizar `uuid.uuid4()` para `id`, `get_brazil_now()` para timestamps.
3. Utilitários de senha:
   - `from werkzeug.security import generate_password_hash, check_password_hash`.
   - Funções: `hash_password(plain) -> str` e `verify_password(plain, hashed) -> bool`.
4. Sessão (opção A — JWT simples):
   - Secret em env: `JWT_SECRET` (fallback dev: string fixa).
   - Funções: `generate_token(user) -> str`, `decode_token(token) -> user_id`.
   - Decorator `require_auth(role: Optional[str])` valida header `Authorization` e injeta `g.current_user`.
5. Rotas de auth (prefixo `/api/auth`):
   - `POST /register`: body `{ name, email, password }`; cria usuário (se vazio, primeiro usuário vira admin; caso contrário, requer admin logado).
   - `POST /login`: valida credenciais; retorna `{ token, user }`.
   - `GET /me`: retorna usuário atual; requer auth.
   - `POST /logout`: no server é no-op; client remove token.
6. Rotas de usuários (prefixo `/api/users`, admin-only):
   - `GET /`: lista paginada com filtros básicos (nome/email), ordenação; retorna `{ data, total }`.
   - `POST /`: cria usuário (admin define `role`, `active`).
   - `GET /:id` | `PUT /:id` | `DELETE /:id`.
   - Operação de ativar/desativar via `PUT` (campo `active`).
7. Testar com `curl`/Insomnia: login->me->CRUD.

### 13.2 Frontend (Vite/React/TS)
1. Contexto `AuthContext.tsx`:
   - Adicionar estado `token` e persistir em `localStorage`.
   - `login(email, password)`: POST `/api/auth/login`; salvar `{ token, user }`; setar cabeçalho default em axios.
   - `logout()`: limpar token/localStorage e `user`.
   - Verificação inicial: se houver token, chamar `/api/auth/me` para restaurar sessão.
2. Rota protegida:
   - Criar `components/auth/ProtectedRoute.tsx` que verifica `user` e `isLoading`; redireciona para `/auth/login`.
3. Páginas:
   - `pages/users/index.tsx`: listar (Table), buscar, paginação, criar/editar (Modal + Input), ativar/desativar, excluir.
   - Conectar com `/api/users` e usar `Authorization` header.
4. Integração de telas de auth do layout:
   - `pages/auth/login/page.tsx`: chamar `login` do contexto.
   - `pages/auth/register/page.tsx`: chamar `/api/auth/register` (se público para primeiro user, redirecionar para login).
5. Navegação e Header:
   - Mostrar usuário logado e ação de logout.

---

## 14. Pontos de Atenção
- Não duplicar lógicas de CRUD já existentes; centralizar acesso HTTP em um serviço (ex.: `services/api.ts`).
- Respeitar a lógica de base URL dinâmica já usada no projeto para ambientes locais e `ngrok`.
- Garantir tratamento de timezone (datas de Ações usam `America/Sao_Paulo`).
- Tamanhos de upload (100MB) e manipulação de arquivos em `/uploads/`.
