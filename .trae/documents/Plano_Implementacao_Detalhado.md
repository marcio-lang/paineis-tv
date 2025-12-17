# Plano de Implementação Detalhado - Sistema de Painéis TV

## 1. Visão Geral da Migração

Este documento detalha a implementação da migração do sistema atual para React + TypeScript + Tailwind usando a base "LAYOUT NOVO", seguindo as fases definidas no IMPLEMENTACAO.md.

### 1.1 Objetivos da Migração

- **Modernização**: Migrar de React JS para React + TypeScript + Vite
- **UI/UX**: Implementar design system consistente com componentes reutilizáveis
- **Funcionalidades**: Manter todas as funcionalidades existentes + adicionar CRUD de usuários e autenticação
- **Arquitetura**: Estrutura escalável com contextos, roteamento e componentes modulares

### 1.2 Estrutura do Projeto Final

```
FRONTEND_NOVO/
├── src/
│   ├── components/
│   │   ├── base/           # Componentes do LAYOUT NOVO
│   │   ├── panels/         # Componentes específicos de painéis
│   │   ├── actions/        # Componentes específicos de ações
│   │   ├── users/          # Componentes específicos de usuários
│   │   ├── acougue/        # Componentes específicos do açougue
│   │   └── layout/         # Layout e navegação
│   ├── contexts/
│   │   ├── AuthContext.tsx # Autenticação e usuário logado
│   │   ├── ThemeContext.tsx # Tema claro/escuro
│   │   └── ColorContext.tsx # Cores personalizadas
│   ├── pages/
│   │   ├── auth/           # Login, registro, recuperação
│   │   ├── dashboard/      # Dashboard principal
│   │   ├── panels/         # Gerenciamento de painéis
│   │   ├── actions/        # Gerenciamento de ações
│   │   ├── users/          # Gerenciamento de usuários
│   │   ├── acougue/        # Admin e TV do açougue
│   │   └── player/         # Player público para TVs
│   ├── router/             # Configuração de rotas
│   ├── utils/              # Utilitários e helpers
│   └── i18n/               # Internacionalização
```

## 2. Fase 0 - Preparação (CONCLUÍDA)

### 2.1 Documentação Técnica ✅
- [x] PRD - Documento de Requisitos do Produto
- [x] Arquitetura Técnica - Especificações técnicas e APIs
- [x] Plano de Implementação Detalhado

### 2.2 Próximos Passos da Fase 0
- [ ] Copiar estrutura base do LAYOUT NOVO
- [ ] Configurar Vite + TypeScript + Tailwind
- [ ] Configurar roteamento base
- [ ] Configurar contextos (Auth, Theme, Color)

## 3. Fase 1 - Backend: Autenticação e Usuários

### 3.1 Modelo de Dados
```python
# models/user.py
class User(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='user')  # 'admin' | 'user'
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

### 3.2 Rotas de Autenticação
```python
# routes/auth.py
@app.route('/api/auth/login', methods=['POST'])
@app.route('/api/auth/register', methods=['POST'])
@app.route('/api/auth/me', methods=['GET'])
@app.route('/api/auth/logout', methods=['POST'])
```

### 3.3 Rotas de Usuários
```python
# routes/users.py
@app.route('/api/users', methods=['GET', 'POST'])
@app.route('/api/users/<user_id>', methods=['GET', 'PUT', 'DELETE'])
```

### 3.4 Middleware de Autenticação
```python
# utils/auth.py
def require_auth(role=None):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Validar JWT token
            # Verificar role se especificado
            return f(*args, **kwargs)
        return decorated_function
    return decorator
```

## 4. Fase 2 - Frontend: Autenticação e Usuários

### 4.1 AuthContext
```typescript
// contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
}
```

### 4.2 Páginas de Autenticação
- `/auth/login` - Reutilizar do LAYOUT NOVO
- `/auth/register` - Reutilizar do LAYOUT NOVO
- `/auth/forgot-password` - Reutilizar do LAYOUT NOVO

### 4.3 Gerenciamento de Usuários
```typescript
// pages/users/index.tsx
- Tabela com componente Table do LAYOUT NOVO
- Formulários com Modal + Input do LAYOUT NOVO
- Ações: Criar, Editar, Ativar/Desativar, Excluir
- Paginação e busca
```

### 4.4 Proteção de Rotas
```typescript
// components/ProtectedRoute.tsx
- Verificar autenticação
- Verificar permissões por role
- Redirecionar para login se necessário
```

## 5. Fase 3 - Migração das Telas Existentes

### 5.1 Dashboard Principal
```typescript
// pages/dashboard/index.tsx
- Cards de estatísticas (painéis ativos, ações em execução)
- Gráficos simples com recharts
- Navegação principal
- Layout responsivo
```

### 5.2 Gerenciamento de Painéis
```typescript
// pages/panels/index.tsx
- Listagem com Table component
- CRUD completo com Modal + Form
- Geração de URL fixa
- Status ativo/inativo
```

### 5.3 Gerenciamento de Ações
```typescript
// pages/actions/index.tsx
- Listagem com Table component
- Upload múltiplo de imagens
- Associação com múltiplos painéis
- Controle de período de validade
```

### 5.4 Player de TV
```typescript
// pages/player/[fixedUrl].tsx
- Layout fullscreen para TV
- Rotação automática de ações ativas
- Transições suaves
- Otimizado para controle remoto
```

### 5.5 Açougue
```typescript
// pages/acougue/admin.tsx - Administração
- CRUD de produtos
- Import/Export CSV
- Upload de imagem de fundo
- Configurações de polling

// pages/acougue/tv.tsx - Exibição TV
- Grid 6x4 fixo
- Carrossel automático
- Overlay de informações
- Atualização em tempo real
```

## 6. Fase 4 - Refinos e Integração Visual

### 6.1 Temas e Cores
- Implementar ThemeContext (claro/escuro)
- Implementar ColorContext (cores personalizadas)
- Gradientes consistentes
- Transições suaves

### 6.2 Internacionalização
- Configurar i18next
- Traduzir todas as strings
- Suporte a pt-BR como padrão

### 6.3 Responsividade
- Mobile-first para admin
- Desktop-optimized para TV
- Touch-friendly para tablets

### 6.4 Acessibilidade
- ARIA labels
- Navegação por teclado
- Contraste adequado
- Screen reader support

## 7. Fase 5 - Deploy e Testes

### 7.1 Configuração de Ambiente
```bash
# .env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME="Sistema Painéis TV"
```

### 7.2 Build e Deploy
```bash
npm run build
npm run preview
```

### 7.3 Testes com ngrok
```bash
ngrok http 5173
# Testar em dispositivos móveis e TVs
```

## 8. Componentes Base Reutilizados

### 8.1 Componentes Principais
- **Table**: Listagens de painéis, ações, usuários, produtos
- **Modal**: Formulários de criação/edição
- **Input**: Campos de formulário com validação
- **Button**: Ações primárias e secundárias
- **Tabs**: Navegação entre seções
- **Dropdown**: Menus de ações

### 8.2 Padrões de Uso
```typescript
// Exemplo de uso do Table
const columns = [
  { key: 'name', title: 'Nome', sortable: true },
  { key: 'email', title: 'Email' },
  { key: 'role', title: 'Perfil' },
  { key: 'active', title: 'Status', render: (v) => v ? 'Ativo' : 'Inativo' },
  { 
    key: 'actions', 
    title: 'Ações', 
    render: (_, record) => (
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onEdit(record)}>Editar</Button>
        <Button size="sm" variant="outline" onClick={() => onToggle(record)}>
          {record.active ? 'Desativar' : 'Ativar'}
        </Button>
        <Button size="sm" variant="danger" onClick={() => onDelete(record.id)}>
          Excluir
        </Button>
      </div>
    )
  }
];
```

## 9. Integração com Backend Existente

### 9.1 APIs Existentes (manter)
- `/api/panels` - CRUD de painéis
- `/api/actions` - CRUD de ações
- `/api/actions/:id/images` - Upload de imagens
- `/api/player/:fixedUrl` - Player público
- `/api/acougue` - Produtos do açougue

### 9.2 Novas APIs (implementar)
- `/api/auth/*` - Autenticação
- `/api/users` - CRUD de usuários

### 9.3 Configuração de Requisições
```typescript
// utils/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = {
  get: (url: string) => fetch(`${API_BASE_URL}${url}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  }),
  post: (url: string, data: any) => fetch(`${API_BASE_URL}${url}`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  })
};
```

## 10. Checklist de Implementação

### Fase 0 - Preparação
- [x] Documentação técnica completa
- [ ] Copiar estrutura do LAYOUT NOVO
- [ ] Configurar Vite + TS + Tailwind
- [ ] Configurar roteamento
- [ ] Configurar contextos

### Fase 1 - Backend Auth/Users
- [ ] Modelo User
- [ ] Rotas de autenticação
- [ ] Rotas de usuários
- [ ] Middleware de auth
- [ ] Testes das APIs

### Fase 2 - Frontend Auth/Users
- [ ] AuthContext funcional
- [ ] Páginas de auth
- [ ] CRUD de usuários
- [ ] Proteção de rotas
- [ ] Persistência de sessão

### Fase 3 - Migração Telas
- [ ] Dashboard
- [ ] Painéis
- [ ] Ações
- [ ] Player TV
- [ ] Açougue Admin/TV

### Fase 4 - Refinos
- [ ] Temas e cores
- [ ] i18n
- [ ] Responsividade
- [ ] Acessibilidade

### Fase 5 - Deploy
- [ ] Configuração ambiente
- [ ] Build otimizado
- [ ] Testes ngrok
- [ ] Documentação final

## 11. Cronograma Estimado

- **Fase 0**: 1 dia
- **Fase 1**: 2 dias
- **Fase 2**: 2 dias
- **Fase 3**: 3 dias
- **Fase 4**: 1 dia
- **Fase 5**: 1 dia

**Total**: 10 dias de desenvolvimento