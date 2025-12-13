from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import os
from datetime import datetime, timedelta
import uuid
import pytz
import re
import jwt
import threading
import time

app = Flask(__name__)

# Configuração CORS específica para resolver problemas com DELETE
CORS(app, 
     origins=['*'], 
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
     allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'],
     supports_credentials=True,
     expose_headers=['*'])

# Configurações
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INSTANCE_DIR = os.path.join(BASE_DIR, 'instance')
os.makedirs(INSTANCE_DIR, exist_ok=True)

# Configuração do banco de dados - usar SQLite sempre
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL and 'postgres' in DATABASE_URL:
    print("[INFO] Ignorando DATABASE_URL PostgreSQL, usando SQLite local")
    
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(INSTANCE_DIR, 'paineltv.db')}"
print(f"[INFO] Usando SQLite: {app.config['SQLALCHEMY_DATABASE_URI']}")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.path.join(BASE_DIR, 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
app.config['PRICE_DELTA_LIMIT_PCT'] = float(os.environ.get('PRICE_DELTA_LIMIT_PCT', '40'))
app.config['NAME_SIMILARITY_MIN'] = float(os.environ.get('NAME_SIMILARITY_MIN', '0.6'))

db = SQLAlchemy(app)

# Configurar timezone do Brasil
BRAZIL_TZ = pytz.timezone('America/Sao_Paulo')

def get_brazil_now():
    """Retorna o datetime atual no timezone do Brasil"""
    return datetime.now(BRAZIL_TZ)

# Modelos do banco de dados
class Panel(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    layout_type = db.Column(db.String(20), nullable=False, default='layout_1')  # layout_1, layout_2, layout_3, layout_4
    fixed_url = db.Column(db.String(100), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=get_brazil_now)
    updated_at = db.Column(db.DateTime, default=get_brazil_now, onupdate=get_brazil_now)
    # Relacionamento many-to-many com Action
    actions = db.relationship('Action', secondary='action_panel', back_populates='panels', lazy='select')
    # Relacionamento com MediaFile (modelo legado)
    media_files = db.relationship('MediaFile', backref='panel', lazy=True, cascade='all, delete-orphan')
    
    def __init__(self, **kwargs):
        super(Panel, self).__init__(**kwargs)
        if not self.fixed_url:
            self.fixed_url = str(uuid.uuid4())[:8]  # URL fixa de 8 caracteres

class Action(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    has_border = db.Column(db.Boolean, default=False)  # Campo para controlar bordas no layout 2x2
    created_at = db.Column(db.DateTime, default=get_brazil_now)
    updated_at = db.Column(db.DateTime, default=get_brazil_now, onupdate=get_brazil_now)
    # Relacionamento many-to-many com Panel
    panels = db.relationship('Panel', secondary='action_panel', back_populates='actions', lazy='select')
    images = db.relationship('ActionImage', backref='action', lazy=True, cascade='all, delete-orphan')

class ActionImage(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    action_id = db.Column(db.String(36), db.ForeignKey('action.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=get_brazil_now)

# Tabela de associação para relacionamento many-to-many entre Action e Panel
action_panel_association = db.Table('action_panel',
    db.Column('action_id', db.String(36), db.ForeignKey('action.id'), primary_key=True),
    db.Column('panel_id', db.String(36), db.ForeignKey('panel.id'), primary_key=True)
)

# Modelo legado - manter para compatibilidade
class MediaFile(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(10), nullable=False)  # 'image' ou 'video'
    file_path = db.Column(db.String(500), nullable=False)
    panel_id = db.Column(db.String(36), db.ForeignKey('panel.id'), nullable=False)  # Relacionamento com Panel
    created_at = db.Column(db.DateTime, default=get_brazil_now)

# Modelo de usuário para autenticação
class User(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='user')  # 'admin' ou 'user'
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=get_brazil_now)
    updated_at = db.Column(db.DateTime, default=get_brazil_now, onupdate=get_brazil_now)
    
    def set_password(self, password):
        """Define a senha do usuário com hash"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verifica se a senha está correta"""
        return check_password_hash(self.password_hash, password)
    
    def generate_token(self):
        """Gera token JWT para o usuário"""
        payload = {
            'user_id': self.id,
            'email': self.email,
            'role': self.role,
            'exp': datetime.utcnow() + app.config['JWT_ACCESS_TOKEN_EXPIRES']
        }
        return jwt.encode(payload, app.config['JWT_SECRET_KEY'], algorithm='HS256')
    
    @staticmethod
    def verify_token(token):
        """Verifica e decodifica token JWT"""
        try:
            payload = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            return User.query.get(payload['user_id'])
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    def to_dict(self):
        """Converte usuário para dicionário (sem senha)"""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'active': self.active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

# Novos modelos para o painel de açougue
class ButcherProduct(db.Model):
    __tablename__ = 'butcher_product'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    codigo = db.Column(db.String(10), nullable=False, unique=True)  # Código único do produto
    nome = db.Column(db.String(100), nullable=False)
    preco = db.Column(db.Numeric(10, 2), nullable=False)
    posicao = db.Column(db.Integer, nullable=False)  # Posição na tela (1-24, grid 6x4)
    ativo = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=get_brazil_now)
    updated_at = db.Column(db.DateTime, default=get_brazil_now, onupdate=get_brazil_now)

class ButcherPanelConfig(db.Model):
    __tablename__ = 'butcher_panel_config'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    polling_interval = db.Column(db.Integer, default=10)  # Intervalo em segundos
    title = db.Column(db.String(100), default='AÇOUGUE PREMIUM')  # Título do painel
    subtitle = db.Column(db.String(100), default='Carnes Selecionadas')  # Subtítulo
    footer_text = db.Column(db.String(255), default='Horário de funcionamento: Segunda a Sábado das 7h às 19h')  # Texto do rodapé
    created_at = db.Column(db.DateTime, default=get_brazil_now)
    updated_at = db.Column(db.DateTime, default=get_brazil_now, onupdate=get_brazil_now)

class PriceHistory(db.Model):
    __tablename__ = 'price_history'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    codigo = db.Column(db.String(10), nullable=False)
    nome = db.Column(db.String(100))
    preco_anterior = db.Column(db.Numeric(10, 2))
    preco_novo = db.Column(db.Numeric(10, 2))
    delta_pct = db.Column(db.Numeric(10, 4))
    job_id = db.Column(db.String(36))
    created_at = db.Column(db.DateTime, default=get_brazil_now)

class ImportJob(db.Model):
    __tablename__ = 'import_job'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    source = db.Column(db.String(50))
    filename = db.Column(db.String(255))
    total_lines = db.Column(db.Integer)
    valid_count = db.Column(db.Integer)
    quarantine_count = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=get_brazil_now)

class ImportLine(db.Model):
    __tablename__ = 'import_line'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id = db.Column(db.String(36))
    codigo = db.Column(db.String(10))
    nome_raw = db.Column(db.String(255))
    preco_raw = db.Column(db.String(50))
    status = db.Column(db.String(20))
    motivo = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=get_brazil_now)

class ImportConflict(db.Model):
    __tablename__ = 'import_conflict'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id = db.Column(db.String(36))
    codigo = db.Column(db.String(10))
    tipo = db.Column(db.String(20))
    nome_atual = db.Column(db.String(255))
    nome_novo = db.Column(db.String(255))
    preco_atual = db.Column(db.Numeric(10, 2))
    preco_novo = db.Column(db.Numeric(10, 2))
    delta_pct = db.Column(db.Numeric(10, 4))
    created_at = db.Column(db.DateTime, default=get_brazil_now)

# Novos modelos para sistema de múltiplos painéis segmentados por departamento
class Department(db.Model):
    __tablename__ = 'department'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False, unique=True)  # Nome do departamento (Açougue, Padaria, Hortifrúti)
    code = db.Column(db.String(20), nullable=False, unique=True)  # Código único (ACG, PAD, HRT)
    description = db.Column(db.Text)  # Descrição do departamento
    color = db.Column(db.String(7), default='#3B82F6')  # Cor tema do departamento (hex)
    icon = db.Column(db.String(50), default='Package')  # Ícone do departamento
    keywords = db.Column(db.Text)  # Palavras-chave para categorização automática (JSON array)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=get_brazil_now)
    updated_at = db.Column(db.DateTime, default=get_brazil_now, onupdate=get_brazil_now)
    
    # Relacionamentos
    panels = db.relationship('DepartmentPanel', back_populates='department', cascade='all, delete-orphan')
    
    def to_dict(self):
        # Parse keywords from JSON string to list
        keywords_list = []
        if self.keywords:
            try:
                import json
                keywords_list = json.loads(self.keywords)
            except:
                # Fallback: split by comma if not valid JSON
                keywords_list = [k.strip() for k in self.keywords.split(',') if k.strip()]
        
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'description': self.description,
            'color': self.color,
            'icon': self.icon,
            'keywords': keywords_list,
            'active': self.active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'panels_count': len(self.panels) if self.panels else 0
        }

class DepartmentPanel(db.Model):
    __tablename__ = 'department_panel'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)  # Nome do painel
    description = db.Column(db.Text)  # Descrição do painel
    department_id = db.Column(db.String(36), db.ForeignKey('department.id'), nullable=False)
    
    # Configurações visuais do painel
    title = db.Column(db.String(100))  # Título personalizado do painel
    subtitle = db.Column(db.String(100))  # Subtítulo personalizado
    footer_text = db.Column(db.String(255))  # Texto do rodapé personalizado
    polling_interval = db.Column(db.Integer, default=10)  # Intervalo de atualização em segundos
    
    # Status e configurações
    active = db.Column(db.Boolean, default=True)
    is_default = db.Column(db.Boolean, default=False)  # Painel padrão do departamento
    display_order = db.Column(db.Integer, default=0)  # Ordem de exibição
    
    created_at = db.Column(db.DateTime, default=get_brazil_now)
    updated_at = db.Column(db.DateTime, default=get_brazil_now, onupdate=get_brazil_now)
    
    # Relacionamentos
    department = db.relationship('Department', back_populates='panels')
    product_associations = db.relationship('ProductPanelAssociation', back_populates='panel', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'department_id': self.department_id,
            'department_name': self.department.name if self.department else None,
            'title': self.title,
            'subtitle': self.subtitle,
            'footer_text': self.footer_text,
            'polling_interval': self.polling_interval,
            'active': self.active,
            'is_default': self.is_default,
            'display_order': self.display_order,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'products_count': len([assoc for assoc in self.product_associations if assoc.active_in_panel and assoc.product and assoc.product.ativo]) if self.product_associations else 0
        }

class ProductPanelAssociation(db.Model):
    __tablename__ = 'product_panel_association'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = db.Column(db.String(36), db.ForeignKey('butcher_product.id'), nullable=False)
    panel_id = db.Column(db.String(36), db.ForeignKey('department_panel.id'), nullable=False)
    
    # Configurações específicas do produto no painel
    position_override = db.Column(db.Integer)  # Posição específica neste painel (sobrescreve a posição padrão)
    active_in_panel = db.Column(db.Boolean, default=True)  # Se o produto está ativo neste painel específico
    
    created_at = db.Column(db.DateTime, default=get_brazil_now)
    updated_at = db.Column(db.DateTime, default=get_brazil_now, onupdate=get_brazil_now)
    
    # Relacionamentos
    product = db.relationship('ButcherProduct', backref='panel_associations')
    panel = db.relationship('DepartmentPanel', back_populates='product_associations')
    
    # Constraint para evitar duplicatas
    __table_args__ = (db.UniqueConstraint('product_id', 'panel_id', name='unique_product_panel'),)
    
    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'panel_id': self.panel_id,
            'position_override': self.position_override,
            'active_in_panel': self.active_in_panel,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'product': self.product.to_dict() if self.product else None
        }

# Adicionar método to_dict ao modelo ButcherProduct existente
def butcher_product_to_dict(self):
    return {
        'id': self.id,
        'codigo': self.codigo,
        'nome': self.nome,
        'preco': float(self.preco),
        'posicao': self.posicao,
        'ativo': self.ativo,
        'created_at': self.created_at.isoformat(),
        'updated_at': self.updated_at.isoformat()
    }

# Adicionar método to_dict ao modelo ButcherProduct
ButcherProduct.to_dict = butcher_product_to_dict

# Extensões permitidas
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'mp4'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_file_type(filename):
    ext = filename.rsplit('.', 1)[1].lower()
    if ext in ['png', 'jpg', 'jpeg']:
        return 'image'
    elif ext == 'mp4':
        return 'video'
    return 'unknown'

# Utilitários de autenticação
def require_auth(f):
    """Decorator para proteger rotas que requerem autenticação"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        # Verificar token no header Authorization
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({'error': 'Token inválido'}), 401
        
        if not token:
            return jsonify({'error': 'Token de acesso requerido'}), 401
        
        # Verificar token
        current_user = User.verify_token(token)
        if not current_user:
            return jsonify({'error': 'Token inválido ou expirado'}), 401
        
        if not current_user.active:
            return jsonify({'error': 'Usuário inativo'}), 401
        
        # Adicionar usuário atual ao contexto da requisição
        request.current_user = current_user
        return f(*args, **kwargs)
    
    return decorated_function

def require_admin(f):
    """Decorator para proteger rotas que requerem privilégios de admin"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Primeiro verificar autenticação
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'error': 'Token inválido'}), 401
        
        if not token:
            return jsonify({'error': 'Token de acesso requerido'}), 401
        
        current_user = User.verify_token(token)
        if not current_user:
            return jsonify({'error': 'Token inválido ou expirado'}), 401
        
        if not current_user.active:
            return jsonify({'error': 'Usuário inativo'}), 401
        
        # Verificar se é admin
        if current_user.role != 'admin':
            return jsonify({'error': 'Acesso negado. Privilégios de administrador requeridos'}), 403
        
        request.current_user = current_user
        return f(*args, **kwargs)
    
    return decorated_function

# Endpoint de teste
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'message': 'Backend funcionando',
        'timestamp': get_brazil_now().isoformat(),
        'upload_folder': app.config['UPLOAD_FOLDER'],
        'upload_folder_exists': os.path.exists(app.config['UPLOAD_FOLDER'])
    })

# Rotas de autenticação
@app.route('/api/auth/register', methods=['POST'])
def register():
    """Registrar novo usuário"""
    data = request.get_json()
    
    # Validar dados obrigatórios
    if not data or not data.get('name') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Nome, email e senha são obrigatórios'}), 400
    
    # Verificar se email já existe
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email já cadastrado'}), 400
    
    try:
        # Criar novo usuário
        user = User(
            name=data['name'],
            email=data['email'].lower(),
            role=data.get('role', 'user')  # Default: user
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Gerar token
        token = user.generate_token()
        
        return jsonify({
            'message': 'Usuário criado com sucesso',
            'user': user.to_dict(),
            'token': token
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao criar usuário: {str(e)}'}), 400

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Fazer login do usuário"""
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({
            'success': False,
            'message': 'Email e senha são obrigatórios'
        }), 400
    
    # Buscar usuário
    user = User.query.filter_by(email=data['email'].lower()).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({
            'success': False,
            'message': 'Email ou senha inválidos'
        }), 401
    
    if not user.active:
        return jsonify({
            'success': False,
            'message': 'Usuário inativo'
        }), 401
    
    # Gerar token
    token = user.generate_token()
    
    return jsonify({
        'success': True,
        'message': 'Login realizado com sucesso',
        'data': {
            'user': user.to_dict(),
            'token': token
        }
    })

@app.route('/api/auth/me', methods=['GET'])
@require_auth
def get_current_user():
    """Obter dados do usuário atual"""
    return jsonify({
        'user': request.current_user.to_dict()
    })

@app.route('/api/auth/verify', methods=['GET'])
@require_auth
def verify_token():
    """Verificar se o token é válido"""
    return jsonify({
        'success': True,
        'data': request.current_user.to_dict(),
        'message': 'Token válido'
    })

# Rotas de gerenciamento de usuários
@app.route('/api/users', methods=['GET'])
@require_admin
def get_users():
    """Listar todos os usuários (apenas admin)"""
    try:
        # Obter parâmetros de paginação e busca
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        search = request.args.get('search', '')
        
        # Query base
        query = User.query
        
        # Aplicar filtro de busca se fornecido
        if search:
            query = query.filter(
                db.or_(
                    User.name.ilike(f'%{search}%'),
                    User.email.ilike(f'%{search}%')
                )
            )
        
        # Aplicar paginação
        paginated = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        users_data = [user.to_dict() for user in paginated.items]
        
        return jsonify({
            'success': True,
            'data': {
                'data': users_data,
                'total': paginated.total,
                'page': page,
                'per_page': per_page
            },
            'message': 'Usuários carregados com sucesso'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Erro ao carregar usuários: {str(e)}'
        }), 500

@app.route('/api/users', methods=['POST'])
@require_admin
def create_user():
    """Criar novo usuário (apenas admin)"""
    data = request.get_json()
    
    # Validar dados obrigatórios
    if not data or not data.get('name') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Nome, email e senha são obrigatórios'}), 400
    
    # Verificar se email já existe
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email já cadastrado'}), 400
    
    try:
        # Criar novo usuário
        user = User(
            name=data['name'],
            email=data['email'].lower(),
            role=data.get('role', 'user'),
            active=data.get('active', True)
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'Usuário criado com sucesso',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao criar usuário: {str(e)}'}), 400

@app.route('/api/users/<user_id>', methods=['GET'])
@require_admin
def get_user(user_id):
    """Obter usuário específico (apenas admin)"""
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())

@app.route('/api/users/<user_id>', methods=['PUT'])
@require_admin
def update_user(user_id):
    """Atualizar usuário (apenas admin)"""
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    
    try:
        # Atualizar campos permitidos
        if 'name' in data:
            user.name = data['name']
        
        if 'email' in data:
            # Verificar se novo email já existe (exceto o próprio usuário)
            existing = User.query.filter_by(email=data['email'].lower()).first()
            if existing and existing.id != user.id:
                return jsonify({'error': 'Email já cadastrado'}), 400
            user.email = data['email'].lower()
        
        if 'role' in data:
            user.role = data['role']
        
        if 'active' in data:
            user.active = data['active']
        
        # Atualizar senha se fornecida
        if 'password' in data and data['password']:
            user.set_password(data['password'])
        
        user.updated_at = get_brazil_now()
        db.session.commit()
        
        return jsonify({
            'message': 'Usuário atualizado com sucesso',
            'user': user.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao atualizar usuário: {str(e)}'}), 400

@app.route('/api/users/<user_id>', methods=['DELETE'])
@require_admin
def delete_user(user_id):
    """Deletar usuário (apenas admin)"""
    user = User.query.get_or_404(user_id)
    
    # Não permitir deletar o próprio usuário
    if user.id == request.current_user.id:
        return jsonify({'error': 'Não é possível deletar seu próprio usuário'}), 400
    
    try:
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'Usuário deletado com sucesso'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao deletar usuário: {str(e)}'}), 400

# Rotas da API - Painéis
@app.route('/api/panels', methods=['GET'])
def get_panels():
    panels = Panel.query.all()
    now = get_brazil_now()
    
    return jsonify([{
        'id': panel.id,
        'name': panel.name,
        'layout_type': panel.layout_type,
        'fixed_url': panel.fixed_url,
        'created_at': panel.created_at.isoformat(),
        'updated_at': panel.updated_at.isoformat(),
        'actions_count': len([action for action in panel.actions 
                             if action.start_date.replace(tzinfo=BRAZIL_TZ) <= now and action.end_date.replace(tzinfo=BRAZIL_TZ) >= now]),
        'media_count': sum(len(action.images) for action in panel.actions)
    } for panel in panels])

@app.route('/api/panels', methods=['POST'])
def create_panel():
    data = request.get_json()
    
    try:
        # Validar layout_type
        valid_layouts = ['layout_1', 'layout_2', 'layout_3', 'layout_4']
        layout_type = data.get('layout_type', 'layout_1')
        if layout_type not in valid_layouts:
            return jsonify({'error': 'Layout inválido. Use: layout_1, layout_2, layout_3 ou layout_4'}), 400
        
        panel = Panel(
            name=data['name'],
            layout_type=layout_type
        )
        db.session.add(panel)
        db.session.commit()
        
        return jsonify({
            'id': panel.id,
            'name': panel.name,
            'layout_type': panel.layout_type,
            'fixed_url': panel.fixed_url,
            'created_at': panel.created_at.isoformat(),
            'updated_at': panel.updated_at.isoformat()
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/panels/<panel_id>', methods=['GET'])
def get_panel(panel_id):
    panel = Panel.query.get_or_404(panel_id)
    
    return jsonify({
        'id': panel.id,
        'name': panel.name,
        'layout_type': panel.layout_type,
        'fixed_url': panel.fixed_url,
        'created_at': panel.created_at.isoformat(),
        'updated_at': panel.updated_at.isoformat(),
        'actions': [{
            'id': action.id,
            'name': action.name,
            'start_date': action.start_date.isoformat(),
            'end_date': action.end_date.isoformat(),
            'images_count': len(action.images)
        } for action in panel.actions]
    })

@app.route('/api/panels/<panel_id>', methods=['PUT'])
def update_panel(panel_id):
    panel = Panel.query.get_or_404(panel_id)
    data = request.get_json()
    
    try:
        panel.name = data.get('name', panel.name)
        
        # Validar layout_type se fornecido
        if 'layout_type' in data:
            valid_layouts = ['layout_1', 'layout_2', 'layout_3', 'layout_4']
            if data['layout_type'] not in valid_layouts:
                return jsonify({'error': 'Layout inválido. Use: layout_1, layout_2, layout_3 ou layout_4'}), 400
            panel.layout_type = data['layout_type']
        
        db.session.commit()
        
        return jsonify({
            'id': panel.id,
            'name': panel.name,
            'layout_type': panel.layout_type,
            'fixed_url': panel.fixed_url,
            'updated_at': panel.updated_at.isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/panels/<panel_id>', methods=['DELETE'])
def delete_panel(panel_id):
    panel = Panel.query.get_or_404(panel_id)
    
    # Deletar arquivos físicos das ações
    for action in panel.actions:
        for image in action.images:
            try:
                os.remove(image.file_path)
            except:
                pass
    
    db.session.delete(panel)
    db.session.commit()
    
    return '', 204

# Buscar painel por URL fixa
@app.route('/api/panels/url/<fixed_url>', methods=['GET'])
def get_panel_by_url(fixed_url):
    panel = Panel.query.filter_by(fixed_url=fixed_url).first_or_404()
    
    return jsonify({
        'id': panel.id,
        'name': panel.name,
        'layout_type': panel.layout_type,
        'fixed_url': panel.fixed_url,
        'created_at': panel.created_at.isoformat(),
        'updated_at': panel.updated_at.isoformat()
    })

# Rotas da API - Ações
@app.route('/api/panels/<panel_id>/actions', methods=['GET'])
def get_panel_actions(panel_id):
    panel = Panel.query.get_or_404(panel_id)
    
    actions = [{
        'id': action.id,
        'name': action.name,
        'start_date': action.start_date.isoformat(),
        'end_date': action.end_date.isoformat(),
        'created_at': action.created_at.isoformat(),
        'updated_at': action.updated_at.isoformat(),
        'images_count': len(action.images)
    } for action in panel.actions]
    
    return jsonify(actions)

@app.route('/api/panels/<panel_id>/actions', methods=['POST'])
def create_action(panel_id):
    panel = Panel.query.get_or_404(panel_id)
    data = request.get_json()
    
    try:
        # Processar datas que vêm no formato ISO sem timezone (já no horário local)
        start_date_str = data['start_date']
        end_date_str = data['end_date']
        
        # Criar datetime naive diretamente do formato ISO
        start_naive = datetime.fromisoformat(start_date_str)
        end_naive = datetime.fromisoformat(end_date_str)
        
        # Localizar para o timezone do Brasil (sem conversão)
        start_brazil = BRAZIL_TZ.localize(start_naive)
        end_brazil = BRAZIL_TZ.localize(end_naive)
        
        action = Action(
            name=data['name'],
            start_date=start_brazil,
            end_date=end_brazil,
            has_border=data.get('has_border', False)
        )
        
        # Associar ação ao painel
        action.panels.append(panel)
        
        db.session.add(action)
        db.session.commit()
        
        return jsonify({
            'id': action.id,
            'name': action.name,
            'start_date': action.start_date.isoformat(),
            'end_date': action.end_date.isoformat(),
            'has_border': action.has_border,
            'panels': [{'id': p.id, 'name': p.name} for p in action.panels],
            'created_at': action.created_at.isoformat(),
            'updated_at': action.updated_at.isoformat()
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/actions/<action_id>', methods=['GET'])
def get_action(action_id):
    action = Action.query.get_or_404(action_id)
    
    return jsonify({
        'id': action.id,
        'name': action.name,
        'start_date': action.start_date.isoformat(),
        'end_date': action.end_date.isoformat(),
        'has_border': action.has_border,
        'panels': [{
            'id': panel.id,
            'name': panel.name
        } for panel in action.panels],
        'created_at': action.created_at.isoformat(),
        'updated_at': action.updated_at.isoformat(),
        'images': [{
            'id': image.id,
            'filename': image.original_filename,
            'url': f'/api/media/{image.filename}',
            'created_at': image.created_at.isoformat()
        } for image in action.images]
    })

@app.route('/api/actions/<action_id>', methods=['PUT'])
def update_action(action_id):
    action = Action.query.get_or_404(action_id)
    data = request.get_json()
    
    try:
        action.name = data.get('name', action.name)
        action.has_border = data.get('has_border', action.has_border)
        
        if 'start_date' in data:
            # Processar data que vem no formato ISO sem timezone (já no horário local)
            start_date_str = data['start_date']
            start_naive = datetime.fromisoformat(start_date_str)
            action.start_date = BRAZIL_TZ.localize(start_naive)
            
        if 'end_date' in data:
            # Processar data que vem no formato ISO sem timezone (já no horário local)
            end_date_str = data['end_date']
            end_naive = datetime.fromisoformat(end_date_str)
            action.end_date = BRAZIL_TZ.localize(end_naive)
        
        # Atualizar painéis associados se fornecido
        if 'panel_ids' in data:
            # Limpar associações existentes - agora funciona com lazy='select'
            action.panels.clear()
            
            # Adicionar novos painéis
            for panel_id in data['panel_ids']:
                panel = Panel.query.get(panel_id)
                if panel:
                    action.panels.append(panel)
        
        db.session.commit()
        
        return jsonify({
            'id': action.id,
            'name': action.name,
            'start_date': action.start_date.isoformat(),
            'end_date': action.end_date.isoformat(),
            'panels': [{'id': p.id, 'name': p.name} for p in action.panels],
            'updated_at': action.updated_at.isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/actions/<action_id>', methods=['DELETE'])
def delete_action(action_id):
    try:
        print(f"=== ROTA DELETE CHAMADA ===")
        print(f"Action ID recebido: {action_id}")
        print(f"Método HTTP: DELETE")
        print(f"Headers da requisição: {dict(request.headers)}")
        print(f"Tentando excluir ação: {action_id}")
        action = Action.query.get_or_404(action_id)
        print(f"Ação encontrada: {action.name}")
        
        # Deletar arquivos físicos
        deleted_files = []
        for image in action.images:
            try:
                if os.path.exists(image.file_path):
                    os.remove(image.file_path)
                    deleted_files.append(image.file_path)
                    print(f"Arquivo deletado: {image.file_path}")
                else:
                    print(f"Arquivo não encontrado: {image.file_path}")
            except Exception as e:
                print(f"Erro ao deletar arquivo {image.file_path}: {e}")
        
        print(f"Deletando ação do banco de dados...")
        db.session.delete(action)
        db.session.commit()
        print(f"Ação {action_id} excluída com sucesso!")
        
        return '', 204
    except Exception as e:
        print(f"Erro ao excluir ação {action_id}: {e}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/actions/<action_id>/images', methods=['POST'])
def upload_action_images(action_id):
    action = Action.query.get_or_404(action_id)
    
    # Verificar se há arquivo na requisição (pode ser 'file' ou 'images')
    if 'file' not in request.files and 'images' not in request.files:
        return jsonify({'error': 'Nenhum arquivo enviado'}), 400
    
    # Obter arquivos da requisição
    if 'file' in request.files:
        files = [request.files['file']]
    else:
        files = request.files.getlist('images')
    
    # Remover limitação de imagens por layout
    # Uma ação pode ter quantas imagens quiser, independente do layout
    # O layout apenas define como as imagens são exibidas (1, 2, 3 ou 4 por vez)
    
    uploaded_files = []
    
    for file in files:
        if file and file.filename and allowed_file(file.filename):
            # Verificar se é imagem
            if get_file_type(file.filename) != 'image':
                continue
                
            filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4()}_{filename}"
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            
            file.save(file_path)
            
            action_image = ActionImage(
                filename=unique_filename,
                original_filename=filename,
                file_path=file_path,
                action_id=action_id
            )
            db.session.add(action_image)
            uploaded_files.append({
                'id': action_image.id,
                'filename': action_image.original_filename,
                'url': f'/api/media/{action_image.filename}'
            })
    
    db.session.commit()
    return jsonify({'uploaded_files': uploaded_files})

@app.route('/api/actions/<action_id>/images/<image_id>', methods=['DELETE'])
def delete_action_image(action_id, image_id):
    image = ActionImage.query.filter_by(id=image_id, action_id=action_id).first_or_404()
    
    try:
        os.remove(image.file_path)
    except:
        pass
    
    db.session.delete(image)
    db.session.commit()
    
    return '', 204

# API do Player - Nova versão com suporte a layouts
@app.route('/api/player/<fixed_url>', methods=['GET'])
def get_player_data(fixed_url):
    try:
        panel = Panel.query.filter_by(fixed_url=fixed_url).first_or_404()
        
        # Buscar ações ativas para este painel
        now = get_brazil_now()  # Usar timezone do Brasil para comparação
        active_actions = []
        for action in panel.actions:
            # Garantir que as datas têm timezone para comparação
            start_date = action.start_date
            end_date = action.end_date
            
            # Se as datas não têm timezone, assumir que são no timezone do Brasil
            if start_date.tzinfo is None:
                start_date = BRAZIL_TZ.localize(start_date)
            if end_date.tzinfo is None:
                end_date = BRAZIL_TZ.localize(end_date)
                
            if start_date <= now and end_date >= now:
                active_actions.append(action)
        
        if not active_actions:
            return jsonify({
                'active': False,
                'message': 'Nenhuma ação ativa no momento'
            })
        
        actions_data = []
        for action in active_actions:
            print(f"=== PROCESSANDO AÇÃO: {action.name} (ID: {action.id}) ===")
            print(f"Número de imagens na ação: {len(action.images) if action.images else 0}")
            
            if action.images and len(action.images) > 0:  # Verificação mais explícita
                image_list = []
                for i, image in enumerate(action.images):
                    print(f"  Imagem {i+1}: {image.filename} (ID: {image.id})")
                    image_list.append({
                        'id': image.id,
                        'filename': image.filename,
                        'url': f'/api/media/{image.filename}'
                    })
                
                actions_data.append({
                    'id': action.id,
                    'name': action.name,
                    'start_date': action.start_date.isoformat(),
                    'end_date': action.end_date.isoformat(),
                    'has_border': getattr(action, 'has_border', False),  # Usar getattr para evitar erro se o campo não existir
                    'images': image_list
                })
                print(f"Ação {action.name} adicionada com {len(image_list)} imagens")
            else:
                print(f"Ação {action.name} IGNORADA - sem imagens válidas")
        
        return jsonify({
            'active': True,
            'panel': {
                'id': panel.id,
                'name': panel.name,
                'layout_type': panel.layout_type,
                'fixed_url': panel.fixed_url
            },
            'actions': actions_data
        })
    except Exception as e:
        print(f"ERRO no endpoint /api/player/{fixed_url}: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# Manter APIs legadas para compatibilidade
@app.route('/api/panels/<panel_id>/media', methods=['POST'])
def upload_media(panel_id):
    panel = Panel.query.get_or_404(panel_id)
    
    # Verificar se há arquivo enviado (aceitar tanto 'file' quanto 'files')
    if 'file' not in request.files and 'files' not in request.files:
        return jsonify({'error': 'Nenhum arquivo enviado'}), 400
    
    # Obter arquivos (suportar tanto upload único quanto múltiplo)
    files = []
    if 'file' in request.files:
        files = [request.files['file']]
    else:
        files = request.files.getlist('files')
    
    uploaded_files = []
    
    for file in files:
        if file and file.filename and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4()}_{filename}"
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            
            file.save(file_path)
            
            media_file = MediaFile(
                filename=unique_filename,
                original_filename=filename,
                file_type=get_file_type(filename),
                file_path=file_path,
                panel_id=panel_id
            )
            db.session.add(media_file)
            uploaded_files.append({
                'id': media_file.id,
                'filename': media_file.original_filename,
                'file_type': media_file.file_type
            })
    
    if not uploaded_files:
        return jsonify({'error': 'Nenhum arquivo válido foi enviado'}), 400
    
    db.session.commit()
    return jsonify({'uploaded_files': uploaded_files})

@app.route('/api/panels/<panel_id>/media', methods=['GET'])
def get_panel_media(panel_id):
    panel = Panel.query.get_or_404(panel_id)
    
    media_files = [{
        'id': media.id,
        'filename': media.original_filename,
        'file_type': media.file_type,
        'url': f'/api/media/{media.filename}',
        'created_at': media.created_at.isoformat()
    } for media in panel.media_files]
    
    return jsonify(media_files)

@app.route('/api/panels/<panel_id>/media/<media_id>', methods=['DELETE'])
def delete_media(panel_id, media_id):
    media = MediaFile.query.filter_by(id=media_id, panel_id=panel_id).first_or_404()
    
    try:
        os.remove(media.file_path)
    except:
        pass
    
    db.session.delete(media)
    db.session.commit()
    
    return '', 204

@app.route('/api/panels/<panel_id>/play', methods=['GET'])
def get_panel_play_data(panel_id):
    try:
        panel = Panel.query.get_or_404(panel_id)
        
        # Buscar ações ativas para este painel
        now = get_brazil_now()
        active_actions = []
        for action in panel.actions:
            # Garantir que as datas têm timezone para comparação
            start_date = action.start_date
            end_date = action.end_date
            
            # Se as datas não têm timezone, assumir que são no timezone do Brasil
            if start_date.tzinfo is None:
                start_date = BRAZIL_TZ.localize(start_date)
            if end_date.tzinfo is None:
                end_date = BRAZIL_TZ.localize(end_date)
                
            if start_date <= now and end_date >= now:
                active_actions.append(action)
        
        if not active_actions:
            return jsonify({
                'active': False,
                'message': 'Nenhuma ação ativa no momento'
            })
        
        actions_data = []
        for action in active_actions:
            print(f"=== PROCESSANDO AÇÃO (PLAY): {action.name} (ID: {action.id}) ===")
            print(f"Número de imagens na ação: {len(action.images) if action.images else 0}")
            
            if action.images and len(action.images) > 0:  # Verificação mais explícita
                image_list = []
                for i, image in enumerate(action.images):
                    print(f"  Imagem {i+1}: {image.filename} (ID: {image.id})")
                    image_list.append({
                        'id': image.id,
                        'filename': image.filename,
                        'url': f'/api/media/{image.filename}'
                    })
                
                actions_data.append({
                    'id': action.id,
                    'name': action.name,
                    'start_date': action.start_date.isoformat(),
                    'end_date': action.end_date.isoformat(),
                    'has_border': action.has_border,
                    'images': image_list
                })
                print(f"Ação {action.name} adicionada com {len(image_list)} imagens")
            else:
                print(f"Ação {action.name} IGNORADA - sem imagens válidas")

        return jsonify({
            'active': True,
            'panel': {
                'id': panel.id,
                'name': panel.name,
                'layout_type': panel.layout_type,
                'fixed_url': panel.fixed_url
            },
            'actions': actions_data
        })
    except Exception as e:
        print(f"ERRO no endpoint /api/panels/{panel_id}/play: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/media/<filename>')
def serve_media(filename):
    try:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        print(f"[MEDIA] Tentando servir arquivo: {filename}")
        print(f"[MEDIA] Caminho completo: {file_path}")
        print(f"[MEDIA] Arquivo existe: {os.path.exists(file_path)}")
        
        if not os.path.exists(file_path):
            print(f"[MEDIA] ERRO: Arquivo não encontrado: {filename}")
            return jsonify({'error': f'Arquivo não encontrado: {filename}'}), 404
            
        print(f"[MEDIA] Servindo arquivo com sucesso: {filename}")
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except Exception as e:
        print(f"[MEDIA] ERRO ao servir arquivo {filename}: {str(e)}")
        return jsonify({'error': f'Erro ao servir arquivo: {str(e)}'}), 500

# APIs do Painel de Açougue
@app.route('/api/acougue/produtos', methods=['GET'])
def get_butcher_products():
    # Retorna TODOS os produtos (ativos e inativos) para o painel administrativo
    products = ButcherProduct.query.order_by(ButcherProduct.posicao).all()
    return jsonify([{
        'id': product.id,
        'codigo': product.codigo,  # Código único do produto
        'name': product.nome,  # Mapeamento correto para frontend
        'price': float(product.preco),  # Mapeamento correto para frontend
        'position': product.posicao,  # Mapeamento correto para frontend
        'is_active': product.ativo,  # Mapeamento correto para frontend
        'created_at': product.created_at.isoformat(),
        'updated_at': product.updated_at.isoformat()
    } for product in products])

@app.route('/api/acougue/produtos/ativos', methods=['GET'])
def get_active_butcher_products():
    # Retorna apenas produtos ativos para o painel TV
    products = ButcherProduct.query.filter_by(ativo=True).order_by(ButcherProduct.posicao).all()
    return jsonify([{
        'id': product.id,
        'codigo': product.codigo,  # Código único do produto
        'name': product.nome,  # Mapeamento correto para frontend
        'price': float(product.preco),  # Mapeamento correto para frontend
        'position': product.posicao,  # Mapeamento correto para frontend
        'is_active': product.ativo,  # Mapeamento correto para frontend
        'created_at': product.created_at.isoformat(),
        'updated_at': product.updated_at.isoformat()
    } for product in products])

@app.route('/api/acougue/produtos', methods=['POST'])
def create_butcher_product():
    data = request.get_json()
    
    try:
        # Mapear campos do frontend para backend
        codigo = data.get('codigo')
        position = data.get('position', data.get('posicao'))
        name = data.get('name', data.get('nome'))
        price = data.get('price', data.get('preco'))
        is_active = data.get('is_active', data.get('ativo', True))
        
        # Verificar se código é obrigatório
        if not codigo:
            return jsonify({'error': 'Código do produto é obrigatório'}), 400
        
        # Validar posição (deve estar entre 1 e 18 para grid 6x3)
        if not position or position < 1 or position > 18:
            return jsonify({'error': 'Posição deve estar entre 1 e 18 (grid 6x3)'}), 400
        
        # Verificar se já existe produto com o mesmo código
        existing = ButcherProduct.query.filter_by(codigo=codigo).first()
        if existing:
            return jsonify({'error': f'Já existe um produto com o código {codigo}'}), 400
        
        # Verificar se já existe produto na posição
        existing_position = ButcherProduct.query.filter_by(posicao=position, ativo=True).first()
        if existing_position:
            return jsonify({'error': f'Já existe um produto na posição {position}'}), 400
        
        product = ButcherProduct(
            codigo=codigo,
            nome=name,
            preco=price,
            posicao=position,
            ativo=is_active
        )
        db.session.add(product)
        db.session.commit()
        
        return jsonify({
            'id': product.id,
            'codigo': product.codigo,
            'name': product.nome,
            'price': float(product.preco),
            'position': product.posicao,
            'is_active': product.ativo,
            'created_at': product.created_at.isoformat(),
            'updated_at': product.updated_at.isoformat()
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/acougue/produtos/<product_id>', methods=['PUT'])
def update_butcher_product(product_id):
    product = ButcherProduct.query.get_or_404(product_id)
    data = request.get_json()
    
    try:
        # Mapear campos do frontend para backend
        codigo = data.get('codigo')
        position = data.get('position', data.get('posicao'))
        name = data.get('name', data.get('nome'))
        price = data.get('price', data.get('preco'))
        is_active = data.get('is_active', data.get('ativo'))
        
        # Se mudou o código, verificar se não há conflito
        if codigo is not None and codigo != product.codigo:
            existing = ButcherProduct.query.filter_by(codigo=codigo).first()
            if existing and existing.id != product_id:
                return jsonify({'error': f'Já existe um produto com o código {codigo}'}), 400
        
        # Se mudou a posição, validar e verificar se não há conflito
        if position is not None and position != product.posicao:
            # Validar posição (deve estar entre 1 e 18 para grid 6x3)
            if position < 1 or position > 18:
                return jsonify({'error': 'Posição deve estar entre 1 e 18 (grid 6x3)'}), 400
            existing = ButcherProduct.query.filter_by(posicao=position, ativo=True).first()
            if existing and existing.id != product_id:
                return jsonify({'error': f'Já existe um produto na posição {position}'}), 400
        
        if codigo is not None:
            product.codigo = codigo
        if name is not None:
            product.nome = name
        if price is not None:
            product.preco = price
        if position is not None:
            product.posicao = position
        if is_active is not None:
            product.ativo = is_active
        
        product.updated_at = get_brazil_now()
        db.session.commit()
        
        return jsonify({
            'id': product.id,
            'codigo': product.codigo,
            'name': product.nome,
            'price': float(product.preco),
            'position': product.posicao,
            'is_active': product.ativo,
            'created_at': product.created_at.isoformat(),
            'updated_at': product.updated_at.isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/acougue/produtos/<product_id>', methods=['DELETE'])
def delete_butcher_product(product_id):
    product = ButcherProduct.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    return '', 204

# Rota removida: upload de imagem de fundo do açougue (descontinuado)

@app.route('/api/acougue/config', methods=['GET'])
def get_butcher_config():
    config = ButcherPanelConfig.query.first()
    if not config:
        config = ButcherPanelConfig()
        db.session.add(config)
        db.session.commit()
    
    return jsonify({
        'polling_interval': config.polling_interval,
        'title': config.title,
        'subtitle': config.subtitle,
        'footer_text': config.footer_text
    })

@app.route('/api/acougue/config', methods=['POST'])
def update_butcher_config():
    data = request.get_json()
    config = ButcherPanelConfig.query.first()
    
    if not config:
        config = ButcherPanelConfig()
        db.session.add(config)
    
    if 'polling_interval' in data:
        config.polling_interval = data['polling_interval']
    if 'title' in data:
        config.title = data['title']
    if 'subtitle' in data:
        config.subtitle = data['subtitle']
    if 'footer_text' in data:
        config.footer_text = data['footer_text']
    
    config.updated_at = get_brazil_now()
    db.session.commit()
    
    return jsonify({
        'polling_interval': config.polling_interval,
        'title': config.title,
        'subtitle': config.subtitle,
        'footer_text': config.footer_text
    })

@app.route('/api/acougue/export', methods=['GET'])
def export_butcher_data():
    products = ButcherProduct.query.all()
    data = {
        'produtos': [{
            'name': product.nome,
            'price': float(product.preco),
            'position': product.posicao,
            'is_active': product.ativo
        } for product in products]
    }
    
    response = jsonify(data)
    response.headers['Content-Disposition'] = 'attachment; filename=produtos_acougue.json'
    return response

@app.route('/api/acougue/import', methods=['POST'])
def import_butcher_data():
    if 'file' not in request.files:
        return jsonify({'error': 'Nenhum arquivo enviado'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Nenhum arquivo selecionado'}), 400
    
    try:
        import json
        data = json.load(file)
        
        if 'produtos' not in data:
            return jsonify({'error': 'Formato de arquivo inválido'}), 400
        
        imported_count = 0
        errors = []
        
        for produto_data in data['produtos']:
            try:
                # Mapear campos (aceitar ambos os formatos)
                name = produto_data.get('name', produto_data.get('nome'))
                price = produto_data.get('price', produto_data.get('preco'))
                position = produto_data.get('position', produto_data.get('posicao'))
                is_active = produto_data.get('is_active', produto_data.get('ativo', True))
                
                # Verificar se já existe produto na posição
                existing = ButcherProduct.query.filter_by(posicao=position).first()
                if existing:
                    existing.nome = name
                    existing.preco = price
                    existing.ativo = is_active
                    existing.updated_at = get_brazil_now()
                else:
                    product = ButcherProduct(
                        nome=name,
                        preco=price,
                        posicao=position,
                        ativo=is_active
                    )
                    db.session.add(product)
                
                imported_count += 1
            except Exception as e:
                errors.append(f"Erro ao importar produto {produto_data.get('name', produto_data.get('nome', 'desconhecido'))}: {str(e)}")
        
        db.session.commit()
        
        return jsonify({
            'imported_count': success_count,
            'errors': errors
        })
    
    except Exception as e:
        return jsonify({'error': f'Erro ao processar arquivo: {str(e)}'}), 400

@app.route('/api/acougue/import-processed', methods=['POST'])
def import_processed_butcher_data():
    try:
        data = request.get_json()
        if not data or 'produtos' not in data:
            return jsonify({'error': 'Dados inválidos'}), 400
        produtos_data = data['produtos']
        if not isinstance(produtos_data, list):
            return jsonify({'error': 'Lista de produtos inválida'}), 400
        preview = bool(data.get('preview', False))
        job = ImportJob(source='api', filename=data.get('filename'), total_lines=len(produtos_data), valid_count=0, quarantine_count=0)
        db.session.add(job)
        db.session.commit()
        res = import_processed_butcher_data_inner(
            produtos_data,
            official_code_map=None,
            preview=preview,
            job_id=job.id,
            price_delta_limit_pct=app.config['PRICE_DELTA_LIMIT_PCT'],
            name_similarity_min=app.config['NAME_SIMILARITY_MIN']
        )
        job.valid_count = res.get('imported_count', 0)
        job.quarantine_count = res.get('quarantine_count', 0)
        db.session.commit()
        return jsonify(res)
    
    except Exception as e:
        return jsonify({'error': f'Erro ao processar dados: {str(e)}'}), 400

@app.route('/api/acougue/import-from-txt', methods=['POST'])
def import_from_txt_path():
    try:
        data = request.get_json()
        path = data.get('path') if data else None
        if not path:
            return jsonify({'error': 'Caminho do arquivo é obrigatório'}), 400
        import re
        import os
        if not os.path.exists(path):
            return jsonify({'error': 'Arquivo não encontrado'}), 404
        content = open(path, 'r', encoding='latin-1', errors='ignore').read().splitlines()
        pat = re.compile(r'^(\d{6})(\d{3})(\d{6})(\d{3})([A-Z\s\d]+)\s*kg')
        produtos = []
        for ln in content:
            m = pat.match(ln.rstrip())
            if not m:
                continue
            cm = re.search(r"\bKG\b\s*0*(\d{3,6})\s*$", ln, re.IGNORECASE)
            codigo = (cm.group(1) if cm else m.group(2))
            preco_val = round(int(m.group(3)) / 100, 2)
            nome_raw = m.group(5).strip()
            nome_fmt = nome_raw.title()
            produtos.append({'codigo': codigo, 'name': nome_fmt, 'price': preco_val, 'is_active': True})
        import unicodedata, re
        from collections import Counter, defaultdict
        def _norm(s: str):
            s = unicodedata.normalize('NFD', s or '')
            s = ''.join(c for c in s if not unicodedata.combining(c))
            s = s.lower()
            s = re.sub(r'\s+', ' ', s).strip()
            return s
        counters = defaultdict(Counter)
        for it in produtos:
            counters[_norm(it['name'])][it['codigo']] += 1
        official_code_map = {}
        for n, c in counters.items():
            code, _ = c.most_common(1)[0]
            official_code_map[n] = code
        res = import_processed_butcher_data_inner(produtos, official_code_map)
        return jsonify(res)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

def import_processed_butcher_data_inner(produtos_data, official_code_map=None, preview=False, job_id=None, price_delta_limit_pct=None, name_similarity_min=None):
    errors = []
    success_count = 0
    from decimal import Decimal
    import unicodedata, re
    def _norm(s: str):
        if not s:
            return ''
        s = unicodedata.normalize('NFD', s)
        s = ''.join(c for c in s if not unicodedata.combining(c))
        s = s.lower()
        s = re.sub(r'\s+', ' ', s).strip()
        return s
    official_code_map = official_code_map or {}
    price_delta_limit_pct = float(price_delta_limit_pct or 0)
    name_similarity_min = float(name_similarity_min or 0)

    # Pré-agregar por código: maior preço vence entre duplicatas
    aggregated = {}
    for produto_data in produtos_data:
        nome = produto_data.get('nome', produto_data.get('name'))
        preco_raw = produto_data.get('preco', produto_data.get('price'))
        ativo = produto_data.get('ativo', produto_data.get('is_active', True))
        codigo = produto_data.get('codigo')
        if not codigo:
            errors.append(f"Produto {nome} não possui código - ignorado")
            continue
        try:
            if isinstance(preco_raw, str):
                preco_raw = preco_raw.replace('.', '').replace(',', '.')
            preco_decimal = Decimal(str(preco_raw))
        except Exception:
            errors.append(f"Produto {nome} possui preço inválido - ignorado")
            continue
        prev = aggregated.get(codigo)
        if not prev or (preco_decimal is not None and prev['preco'] is not None and preco_decimal > prev['preco']):
            aggregated[codigo] = {
                'codigo': codigo,
                'nome': nome,
                'preco': preco_decimal,
                'ativo': ativo,
            }

    quarantine_count = 0
    conflicts = []
    for codigo, item in aggregated.items():
        try:
            nome = item['nome']
            preco_decimal = item['preco']
            ativo = item['ativo']
            existing = ButcherProduct.query.filter_by(codigo=codigo).first()
            if existing:
                from difflib import SequenceMatcher
                delta_pct = None
                try:
                    if existing.preco is not None and float(existing.preco) > 0:
                        delta_pct = abs(float(preco_decimal) - float(existing.preco)) / float(existing.preco) * 100.0
                    else:
                        delta_pct = 0.0
                except Exception:
                    delta_pct = 0.0
                name_ratio = SequenceMatcher(None, (existing.nome or '').lower(), (nome or '').lower()).ratio()
                import re
                butcher_pat = re.compile(r"\b(alcatra|picanha|patinho|lagarto|maminha|cox[aã]o|ac[eé]m|paleta|contra\s*fil[eé]|fil[eé]|bisteca|costela|pernil|miolo|fraldinha|cupim|carne|su[ií]na|bovina|frango|coxa|sobrecoxa|asa|peito|linguiç?a|salsicha|toucinho|bacon)\b", re.IGNORECASE)
                incoming_is_butcher = bool(butcher_pat.search(nome or ''))
                existing_is_butcher = bool(butcher_pat.search(existing.nome or ''))
                if price_delta_limit_pct and delta_pct > price_delta_limit_pct:
                    if not preview:
                        conflict = ImportConflict(job_id=job_id, codigo=codigo, tipo='price', nome_atual=existing.nome, nome_novo=nome, preco_atual=existing.preco, preco_novo=preco_decimal, delta_pct=delta_pct)
                        db.session.add(conflict)
                    quarantine_count += 1
                else:
                    if not preview:
                        ph = PriceHistory(codigo=codigo, nome=existing.nome, preco_anterior=existing.preco, preco_novo=preco_decimal, delta_pct=delta_pct, job_id=job_id)
                        db.session.add(ph)
                        existing.preco = preco_decimal
                        if (incoming_is_butcher and not existing_is_butcher) or (not name_similarity_min or name_ratio >= name_similarity_min):
                            existing.nome = nome
                        else:
                            conflict = ImportConflict(job_id=job_id, codigo=codigo, tipo='name', nome_atual=existing.nome, nome_novo=nome, preco_atual=existing.preco, preco_novo=preco_decimal, delta_pct=delta_pct)
                            db.session.add(conflict)
                        existing.ativo = ativo
                        existing.updated_at = get_brazil_now()
            else:
                if not preview:
                    posicoes_ocupadas = [p.posicao for p in ButcherProduct.query.all()]
                    posicao_disponivel = 1
                    while posicao_disponivel in posicoes_ocupadas:
                        posicao_disponivel += 1
                    product = ButcherProduct(codigo=codigo, nome=nome, preco=preco_decimal, posicao=posicao_disponivel, ativo=ativo)
                    db.session.add(product)
            success_count += 1
        except Exception as e:
            errors.append(f"Erro ao importar produto {item.get('nome', 'desconhecido')}: {str(e)}")
    if not preview:
        db.session.commit()
    return {'imported_count': success_count, 'errors': errors, 'quarantine_count': quarantine_count, 'preview': preview}

def _norm_name(s):
    import unicodedata, re
    s = unicodedata.normalize('NFD', s or '')
    s = ''.join(c for c in s if not unicodedata.combining(c))
    s = s.lower()
    s = re.sub(r'\s+', ' ', s).strip()
    return s

def start_toledo_monitor(path, interval_minutes):
    def run():
        import os
        import re
        from collections import Counter, defaultdict
        last_mtime = None
        pat = re.compile(r'^(\d{6})(\d{3})(\d{6})(\d{3})([A-Z\s\d]+)\s*kg', re.IGNORECASE)
        while True:
            try:
                if os.path.exists(path):
                    mtime = os.path.getmtime(path)
                    if last_mtime is None or mtime != last_mtime:
                        content = open(path, 'r', encoding='latin-1', errors='ignore').read().splitlines()
                        produtos = []
                        for ln in content:
                            line = ln.rstrip()
                            m = pat.match(line)
                            if m:
                                cm = re.search(r"\bKG\b\s*0*(\d{3,6})\s*$", line, re.IGNORECASE)
                                codigo = (cm.group(1) if cm else m.group(2))
                                preco_val = round(int(m.group(3)) / 100, 2)
                                nome_raw = m.group(5).strip()
                            else:
                                if len(line) < 20:
                                    continue
                                cm = re.search(r"\bKG\b\s*0*(\d{3,6})\s*$", line, re.IGNORECASE)
                                codigo = (cm.group(1) if cm else line[6:9])
                                preco_str = line[9:15]
                                try:
                                    preco_val = round(int(preco_str) / 100, 2)
                                except Exception:
                                    continue
                                name_part = line[18:]
                                idx = name_part.lower().find('kg')
                                nome_raw = (name_part[:idx] if idx != -1 else name_part).strip()
                            import re
                            nome_fmt = re.sub(r'(?:\s*[0-9]{4,})+$', '', nome_raw.strip())
                            nome_fmt = re.sub(r'\s+', ' ', nome_fmt)
                            nome_fmt = nome_fmt.title()
                            nome_fmt = re.sub(r'\bPao\b', 'Pão', nome_fmt)
                            nome_fmt = re.sub(r'\bFrances\b', 'Francês', nome_fmt)
                            nome_fmt = re.sub(r'\bFile\b', 'Filé', nome_fmt)
                            nome_fmt = re.sub(r'\bAcem\b', 'Acém', nome_fmt)
                            nome_fmt = re.sub(r'\bCoxao\b', 'Coxão', nome_fmt)
                            nome_fmt = re.sub(r'\bMelao\b', 'Melão', nome_fmt)
                            nome_fmt = re.sub(r'\bLinguica\b', 'Linguiça', nome_fmt)
                            nome_fmt = re.sub(r'\bPerdigao\b', 'Perdigão', nome_fmt)
                            produtos.append({'codigo': codigo, 'name': nome_fmt, 'price': preco_val, 'is_active': True})
                        counters = defaultdict(Counter)
                        for it in produtos:
                            counters[_norm_name(it['name'])][it['codigo']] += 1
                        official = {}
                        for n, c in counters.items():
                            official[n] = c.most_common(1)[0][0]
                        # Deduplicar por código: última ocorrência vence
                        aggregated = {}
                        for it in produtos:
                            prev = aggregated.get(it['codigo'])
                            if not prev or (it['price'] is not None and prev['price'] is not None and it['price'] > prev['price']):
                                aggregated[it['codigo']] = {
                                    'codigo': it['codigo'],
                                    'name': it['name'],
                                    'price': it['price'],
                                    'is_active': it.get('is_active', True)
                                }
                        produtos_final = list(aggregated.values())
                        with app.app_context():
                            res = import_processed_butcher_data_inner(produtos_final, official)
                            try:
                                departments = Department.query.filter_by(active=True).all()
                                for department in departments:
                                    default_panel = DepartmentPanel.query.filter_by(
                                        department_id=department.id,
                                        is_default=True,
                                        active=True
                                    ).first()
                                    if not default_panel:
                                        continue
                                    result = perform_sync_department_panel(department.id, default_panel.id, exact_match=True)
                                    print('[MONITOR]', 'sync', department.name, result.get('removed_count'), result.get('added_count'))
                            except Exception as _e:
                                db.session.rollback()
                                print('[MONITOR]', 'sync error', str(_e))
                        print('[MONITOR]', path, 'imported', res.get('imported_count'))
                        last_mtime = mtime
            except Exception as e:
                print('[MONITOR]', 'error', str(e))
            time.sleep(interval_minutes * 60)
    t = threading.Thread(target=run, daemon=True)
    t.start()

try:
    import os
    watch_path = os.environ.get('TOLEDO_WATCH_PATH', r'\\10.0.4.22\toledo\ITENSMGV.TXT')
    watch_interval = int(os.environ.get('TOLEDO_WATCH_INTERVAL_MIN', '30'))
    start_toledo_monitor(watch_path, watch_interval)
    print('[MONITOR]', 'started', watch_path, watch_interval)
except Exception as _e:
    print('[MONITOR]', 'startup error', str(_e))

@app.route('/api/acougue/produtos/clear-all', methods=['DELETE'])
def clear_all_butcher_products():
    try:
        # Contar produtos antes da exclusão
        count = ButcherProduct.query.count()
        
        # Excluir todos os produtos
        ButcherProduct.query.delete()
        db.session.commit()
        
        return jsonify({
            'message': f'{count} produtos excluídos com sucesso',
            'deleted_count': count
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao excluir produtos: {str(e)}'}), 400

# Novas rotas para suportar múltiplos painéis

@app.route('/api/actions', methods=['POST'])
def create_action_multiple_panels():
    """Criar ação com múltiplos painéis"""
    data = request.get_json()
    
    try:
        print(f"=== DEBUG CREATE ACTION ===")
        print(f"Dados recebidos: {data}")
        print(f"Tipo dos dados: {type(data)}")
        
        # Validações básicas
        if not data.get('name', '').strip():
            print("Erro: Nome da ação é obrigatório")
            return jsonify({'error': 'Nome da ação é obrigatório'}), 400
            
        if not data.get('start_date'):
            print("Erro: Data de início é obrigatória")
            return jsonify({'error': 'Data de início é obrigatória'}), 400
            
        if not data.get('end_date'):
            print("Erro: Data de fim é obrigatória")
            return jsonify({'error': 'Data de fim é obrigatória'}), 400
        
        # Processar datas que vêm no formato ISO sem timezone (já no horário local)
        start_date_str = data['start_date']
        end_date_str = data['end_date']
        
        print(f"Data de início recebida: {start_date_str} (tipo: {type(start_date_str)})")
        print(f"Data de fim recebida: {end_date_str} (tipo: {type(end_date_str)})")
        
        # Criar datetime naive diretamente do formato ISO
        try:
            start_naive = datetime.fromisoformat(start_date_str)
            end_naive = datetime.fromisoformat(end_date_str)
            print(f"Datas convertidas - Início: {start_naive}, Fim: {end_naive}")
        except Exception as date_error:
            print(f"Erro ao converter datas: {date_error}")
            return jsonify({'error': f'Formato de data inválido: {str(date_error)}'}), 400
        
        # Validar se data de fim é posterior à data de início
        if start_naive >= end_naive:
            print("Erro: Data de fim deve ser posterior à data de início")
            return jsonify({'error': 'Data de fim deve ser posterior à data de início'}), 400
        
        # Localizar para o timezone do Brasil (sem conversão)
        start_brazil = BRAZIL_TZ.localize(start_naive)
        end_brazil = BRAZIL_TZ.localize(end_naive)
        
        action = Action(
            name=data['name'],
            start_date=start_brazil,
            end_date=end_brazil,
            has_border=data.get('has_border', False)
        )
        
        # Associar ação aos painéis especificados
        panel_ids = data.get('panel_ids', [])
        print(f"Panel IDs recebidos: {panel_ids}")
        
        if not panel_ids:
            print("Erro: Pelo menos um painel deve ser selecionado")
            return jsonify({'error': 'Pelo menos um painel deve ser selecionado'}), 400
            
        for panel_id in panel_ids:
            panel = Panel.query.get(panel_id)
            if panel:
                action.panels.append(panel)
                print(f"Painel {panel_id} associado com sucesso")
            else:
                print(f"Painel {panel_id} não encontrado")
        
        print("Salvando ação no banco de dados...")
        db.session.add(action)
        db.session.commit()
        print("Ação salva com sucesso!")
        
        return jsonify({
            'id': action.id,
            'name': action.name,
            'start_date': action.start_date.isoformat(),
            'end_date': action.end_date.isoformat(),
            'panels': [{'id': p.id, 'name': p.name} for p in action.panels],
            'created_at': action.created_at.isoformat(),
            'updated_at': action.updated_at.isoformat()
        }), 201
    except Exception as e:
        print(f"Erro geral na criação da ação: {e}")
        print(f"Tipo do erro: {type(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 400

@app.route('/api/actions', methods=['GET'])
def get_all_actions():
    """Listar todas as ações"""
    actions = Action.query.all()
    
    return jsonify([{
        'id': action.id,
        'name': action.name,
        'start_date': action.start_date.isoformat(),
        'end_date': action.end_date.isoformat(),
        'panels': [{'id': p.id, 'name': p.name} for p in action.panels],
        'images_count': len(action.images),
        'created_at': action.created_at.isoformat(),
        'updated_at': action.updated_at.isoformat()
    } for action in actions])

@app.route('/api/actions/<action_id>/panels', methods=['POST'])
def add_action_to_panels(action_id):
    """Adicionar ação a painéis adicionais"""
    action = Action.query.get_or_404(action_id)
    data = request.get_json()
    
    try:
        panel_ids = data.get('panel_ids', [])
        
        for panel_id in panel_ids:
            panel = Panel.query.get(panel_id)
            if panel and panel not in action.panels:
                action.panels.append(panel)
        
        db.session.commit()
        
        return jsonify({
            'id': action.id,
            'name': action.name,
            'panels': [{'id': p.id, 'name': p.name} for p in action.panels]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/actions/<action_id>/panels/<panel_id>', methods=['DELETE'])
def remove_action_from_panel(action_id, panel_id):
    """Remover ação de um painel específico"""
    action = Action.query.get_or_404(action_id)
    panel = Panel.query.get_or_404(panel_id)
    
    try:
        if panel in action.panels:
            action.panels.remove(panel)
            db.session.commit()
        
        return jsonify({
            'id': action.id,
            'name': action.name,
            'panels': [{'id': p.id, 'name': p.name} for p in action.panels]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400



# ===== ROTAS PARA SISTEMA DE MÚLTIPLOS PAINÉIS SEGMENTADOS POR DEPARTAMENTO =====

# Rotas para Departamentos
@app.route('/api/departments', methods=['GET'])
def get_departments():
    """Listar todos os departamentos"""
    try:
        departments = Department.query.filter_by(active=True).order_by(Department.name).all()
        return jsonify([dept.to_dict() for dept in departments])
    except Exception as e:
        return jsonify({'error': f'Erro ao buscar departamentos: {str(e)}'}), 500

@app.route('/api/departments', methods=['POST'])
def create_department():
    """Criar novo departamento"""
    try:
        data = request.get_json()
        
        # Validações
        if not data.get('name'):
            return jsonify({'error': 'Nome do departamento é obrigatório'}), 400
        
        if not data.get('code'):
            return jsonify({'error': 'Código do departamento é obrigatório'}), 400
        
        # Verificar se já existe
        existing = Department.query.filter(
            (Department.name == data['name']) | (Department.code == data['code'])
        ).first()
        
        if existing:
            return jsonify({'error': 'Departamento com este nome ou código já existe'}), 400
        
        # Process keywords
        keywords_json = None
        if 'keywords' in data:
            import json
            if isinstance(data['keywords'], list):
                keywords_json = json.dumps(data['keywords'])
            else:
                keywords_json = data['keywords']
        
        department = Department(
            name=data['name'],
            code=data['code'].upper(),
            description=data.get('description', ''),
            color=data.get('color', '#3B82F6'),
            icon=data.get('icon', 'Package'),
            keywords=keywords_json
        )
        
        db.session.add(department)
        db.session.commit()
        
        return jsonify(department.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao criar departamento: {str(e)}'}), 500

@app.route('/api/departments/<department_id>', methods=['PUT'])
def update_department(department_id):
    """Atualizar departamento"""
    try:
        department = Department.query.get_or_404(department_id)
        data = request.get_json()
        
        # Validar se nome/código não conflitam com outros departamentos
        if data.get('name') and data['name'] != department.name:
            existing = Department.query.filter(
                Department.name == data['name'],
                Department.id != department_id
            ).first()
            if existing:
                return jsonify({'error': 'Já existe um departamento com este nome'}), 400
        
        if data.get('code') and data['code'] != department.code:
            existing = Department.query.filter(
                Department.code == data['code'],
                Department.id != department_id
            ).first()
            if existing:
                return jsonify({'error': 'Já existe um departamento com este código'}), 400
        
        # Atualizar campos
        if 'name' in data:
            department.name = data['name']
        if 'code' in data:
            department.code = data['code'].upper()
        if 'description' in data:
            department.description = data['description']
        if 'color' in data:
            department.color = data['color']
        if 'icon' in data:
            department.icon = data['icon']
        keywords_changed = False
        if 'keywords' in data:
            # Convert keywords list to JSON string
            import json
            if isinstance(data['keywords'], list):
                department.keywords = json.dumps(data['keywords'])
            else:
                department.keywords = data['keywords']
            keywords_changed = True
        if 'active' in data:
            department.active = data['active']
        
        department.updated_at = get_brazil_now()
        if keywords_changed:
            default_panel = DepartmentPanel.query.filter_by(
                department_id=department_id,
                is_default=True,
                active=True
            ).first()
            if default_panel:
                try:
                    request_data = request.get_json() or {}
                    exact_match = bool(request_data.get('exact_match', True))
                except Exception:
                    exact_match = True
                perform_sync_department_panel(department_id, default_panel.id, exact_match)
        db.session.commit()
        
        return jsonify(department.to_dict())
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao atualizar departamento: {str(e)}'}), 500

@app.route('/api/departments/<department_id>', methods=['DELETE'])
def delete_department(department_id):
    """Excluir departamento (soft delete)"""
    try:
        department = Department.query.get_or_404(department_id)
        
        # Verificar se tem painéis associados
        if department.panels:
            return jsonify({'error': 'Não é possível excluir departamento com painéis associados'}), 400
        
        department.active = False
        department.updated_at = get_brazil_now()
        db.session.commit()
        
        return jsonify({'message': 'Departamento excluído com sucesso'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao excluir departamento: {str(e)}'}), 500

# Rotas para Painéis de Departamento
@app.route('/api/departments/<department_id>/panels', methods=['GET'])
def get_department_panels(department_id):
    """Listar painéis de um departamento"""
    try:
        department = Department.query.get_or_404(department_id)
        panels = DepartmentPanel.query.filter_by(
            department_id=department_id,
            active=True
        ).order_by(DepartmentPanel.display_order, DepartmentPanel.name).all()
        
        return jsonify([panel.to_dict() for panel in panels])
        
    except Exception as e:
        return jsonify({'error': f'Erro ao buscar painéis: {str(e)}'}), 500

@app.route('/api/departments/<department_id>/panels', methods=['POST'])
def create_department_panel(department_id):
    """Criar novo painel para um departamento"""
    try:
        department = Department.query.get_or_404(department_id)
        data = request.get_json()
        
        # Validações
        if not data.get('name'):
            return jsonify({'error': 'Nome do painel é obrigatório'}), 400
        
        # Verificar se já existe painel com este nome no departamento
        existing = DepartmentPanel.query.filter_by(
            department_id=department_id,
            name=data['name']
        ).first()
        
        if existing:
            return jsonify({'error': 'Já existe um painel com este nome neste departamento'}), 400
        
        # Se for marcado como padrão, desmarcar outros painéis padrão do departamento
        if data.get('is_default', False):
            DepartmentPanel.query.filter_by(
                department_id=department_id,
                is_default=True
            ).update({'is_default': False})
        
        panel = DepartmentPanel(
            name=data['name'],
            description=data.get('description', ''),
            department_id=department_id,
            title=data.get('title', department.name.upper()),
            subtitle=data.get('subtitle', ''),
            footer_text=data.get('footer_text', ''),
            polling_interval=data.get('polling_interval', 10),
            is_default=data.get('is_default', False),
            display_order=data.get('display_order', 0)
        )
        
        db.session.add(panel)
        db.session.commit()
        
        return jsonify(panel.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao criar painel: {str(e)}'}), 500

@app.route('/api/panels/<panel_id>', methods=['PUT'])
def update_department_panel(panel_id):
    """Atualizar painel de departamento"""
    try:
        panel = DepartmentPanel.query.get_or_404(panel_id)
        data = request.get_json()
        
        # Se for marcado como padrão, desmarcar outros painéis padrão do departamento
        if data.get('is_default', False) and not panel.is_default:
            DepartmentPanel.query.filter_by(
                department_id=panel.department_id,
                is_default=True
            ).update({'is_default': False})
        
        # Atualizar campos
        if 'name' in data:
            panel.name = data['name']
        if 'description' in data:
            panel.description = data['description']
        if 'title' in data:
            panel.title = data['title']
        if 'subtitle' in data:
            panel.subtitle = data['subtitle']
        if 'footer_text' in data:
            panel.footer_text = data['footer_text']
        if 'polling_interval' in data:
            panel.polling_interval = data['polling_interval']
        if 'is_default' in data:
            panel.is_default = data['is_default']
        if 'display_order' in data:
            panel.display_order = data['display_order']
        if 'active' in data:
            panel.active = data['active']
        
        panel.updated_at = get_brazil_now()
        db.session.commit()
        
        return jsonify(panel.to_dict())
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao atualizar painel: {str(e)}'}), 500

@app.route('/api/panels/<panel_id>', methods=['DELETE'])
def delete_department_panel(panel_id):
    """Excluir painel de departamento"""
    try:
        panel = DepartmentPanel.query.get_or_404(panel_id)
        
        # Remover associações de produtos
        ProductPanelAssociation.query.filter_by(panel_id=panel_id).delete()
        
        db.session.delete(panel)
        db.session.commit()
        
        return jsonify({'message': 'Painel excluído com sucesso'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao excluir painel: {str(e)}'}), 500

# Rotas para Associação Produto-Painel
@app.route('/api/panels/<panel_id>/products', methods=['GET'])
def get_panel_products(panel_id):
    """Listar produtos de um painel"""
    try:
        panel = DepartmentPanel.query.get_or_404(panel_id)
        
        associations = ProductPanelAssociation.query.filter_by(
            panel_id=panel_id,
            active_in_panel=True
        ).join(ButcherProduct).filter(ButcherProduct.ativo == True).all()
        
        products = []
        for assoc in associations:
            product = assoc.product
            products.append({
                'id': product.id,
                'codigo': product.codigo,
                'name': product.nome,
                'price': float(product.preco),
                'position': product.posicao,
                'is_active': product.ativo,
                'position_override': assoc.position_override,
                'active_in_panel': assoc.active_in_panel
            })
        
        return jsonify(products)
        
    except Exception as e:
        return jsonify({'error': f'Erro ao buscar produtos do painel: {str(e)}'}), 500

@app.route('/api/panels/<panel_id>/products', methods=['POST'])
def add_products_to_panel(panel_id):
    """Adicionar produtos a um painel"""
    try:
        panel = DepartmentPanel.query.get_or_404(panel_id)
        data = request.get_json()
        
        product_ids = data.get('product_ids', [])
        if not product_ids:
            return jsonify({'error': 'Lista de produtos é obrigatória'}), 400
        
        added_count = 0
        for product_id in product_ids:
            # Verificar se produto existe
            product = ButcherProduct.query.get(product_id)
            if not product:
                continue
            
            # Verificar se associação já existe
            existing = ProductPanelAssociation.query.filter_by(
                product_id=product_id,
                panel_id=panel_id
            ).first()
            
            if not existing:
                association = ProductPanelAssociation(
                    product_id=product_id,
                    panel_id=panel_id,
                    active_in_panel=True
                )
                db.session.add(association)
                added_count += 1
        
        db.session.commit()
        
        return jsonify({
            'message': f'{added_count} produtos adicionados ao painel',
            'added_count': added_count
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao adicionar produtos ao painel: {str(e)}'}), 500

@app.route('/api/panels/<panel_id>/products/<product_id>', methods=['DELETE'])
def remove_product_from_panel(panel_id, product_id):
    """Remover produto de um painel"""
    try:
        association = ProductPanelAssociation.query.filter_by(
            product_id=product_id,
            panel_id=panel_id
        ).first_or_404()
        
        db.session.delete(association)
        db.session.commit()
        
        return jsonify({'message': 'Produto removido do painel com sucesso'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao remover produto do painel: {str(e)}'}), 500

@app.route('/api/panels/<panel_id>/products/<product_id>', methods=['PUT'])
def update_product_in_panel(panel_id, product_id):
    """Atualizar associação de produto no painel (posição e visibilidade)"""
    try:
        association = ProductPanelAssociation.query.filter_by(
            product_id=product_id,
            panel_id=panel_id
        ).first_or_404()
        data = request.get_json() or {}

        if 'position_override' in data:
            pos = data['position_override']
            if pos is not None:
                try:
                    pos = int(pos)
                except Exception:
                    return jsonify({'error': 'Posição inválida'}), 400
                if pos < 1 or pos > 24:
                    return jsonify({'error': 'Posição deve ser entre 1 e 24'}), 400
                association.position_override = pos

        if 'active_in_panel' in data:
            association.active_in_panel = bool(data['active_in_panel'])

        association.updated_at = get_brazil_now()
        db.session.commit()

        return jsonify(association.to_dict())
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao atualizar produto no painel: {str(e)}'}), 500

# Rota para categorização automática de produtos
@app.route('/api/products/auto-categorize', methods=['POST'])
def auto_categorize_products():
    """Categorizar automaticamente produtos por departamento"""
    try:
        data = request.get_json()
        department_id = data.get('department_id')
        
        if not department_id:
            return jsonify({'error': 'ID do departamento é obrigatório'}), 400
        
        department = Department.query.get_or_404(department_id)
        exact_match = bool((data or {}).get('exact_match', True))
        
        # Obter painel padrão do departamento
        default_panel = DepartmentPanel.query.filter_by(
            department_id=department_id,
            is_default=True,
            active=True
        ).first()
        
        if not default_panel:
            return jsonify({'error': 'Departamento não possui painel padrão configurado'}), 400
        
        # Obter palavras-chave do departamento
        dept_keywords = []
        if department.keywords:
            try:
                import json
                dept_keywords = json.loads(department.keywords)
            except:
                # Fallback: split by comma if not valid JSON
                dept_keywords = [k.strip() for k in department.keywords.split(',') if k.strip()]
        
        # Fallback para palavras-chave padrão se não houver configuradas
        if not dept_keywords:
            default_keywords = {
                'ACG': ['carne', 'boi', 'porco', 'frango', 'linguiça', 'costela', 'picanha', 'alcatra', 'maminha', 'patinho', 'acém', 'músculo'],
                'PAD': ['pão', 'bolo', 'torta', 'biscoito', 'doce', 'salgado', 'croissant', 'sonho', 'rosquinha', 'broa'],
                'HRT': ['alface', 'tomate', 'cebola', 'batata', 'cenoura', 'abobrinha', 'pepino', 'pimentão', 'banana', 'maçã', 'laranja', 'limão']
            }
            dept_keywords = default_keywords.get(department.code, [])
        
        if not dept_keywords:
            return jsonify({'error': 'Departamento não possui palavras-chave configuradas'}), 400
        
        # Buscar produtos que não estão no painel
        existing_product_ids = db.session.query(ProductPanelAssociation.product_id).filter_by(panel_id=default_panel.id).subquery()
        
        products = ButcherProduct.query.filter(
            ButcherProduct.ativo == True,
            ~ButcherProduct.id.in_(existing_product_ids)
        ).all()
        from unicodedata import normalize, combining
        import re
        def _norm(s):
            s = normalize('NFD', s or '')
            s = ''.join(c for c in s if not combining(c))
            s = s.lower()
            s = re.sub(r'\s+', ' ', s).strip()
            return s
        kws = [_norm(k) for k in dept_keywords]
        def _match(name):
            n = _norm(name or '')
            if exact_match:
                return n in set(kws)
            return any(k in n for k in kws)
        grouped = {}
        for p in products:
            if _match(p.nome):
                key = _norm(p.nome)
                prev = grouped.get(key)
                if not prev:
                    grouped[key] = p
                else:
                    try:
                        prev_price = float(prev.preco or 0)
                        p_price = float(p.preco or 0)
                        if p_price > prev_price:
                            grouped[key] = p
                    except Exception:
                        grouped[key] = p
        categorized_count = 0
        for sel in grouped.values():
            assoc = ProductPanelAssociation(product_id=sel.id, panel_id=default_panel.id, active_in_panel=True)
            db.session.add(assoc)
            categorized_count += 1
        db.session.commit()
        try:
            result = perform_sync_department_panel(department_id, default_panel.id, exact_match)
        except Exception:
            result = None
        resp = {
            'message': f'{categorized_count} produtos categorizados automaticamente para {department.name}',
            'categorized_count': categorized_count,
            'department': department.name,
            'panel': default_panel.name
        }
        if result:
            resp.update({'sync_removed': result.get('removed_count'), 'sync_added': result.get('added_count')})
        return jsonify(resp)
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro na categorização automática: {str(e)}'}), 500

# Rota para visualização de painel por departamento
@app.route('/api/departments/<department_id>/panels/<panel_id>/view', methods=['GET'])
def view_department_panel(department_id, panel_id):
    """Visualizar painel específico de um departamento (para TV)"""
    try:
        panel = DepartmentPanel.query.filter_by(
            id=panel_id,
            department_id=department_id,
            active=True
        ).first_or_404()
        
        # Buscar produtos do painel
        associations = ProductPanelAssociation.query.filter_by(
            panel_id=panel_id,
            active_in_panel=True
        ).join(ButcherProduct).filter(ButcherProduct.ativo == True).all()
        
        products = []
        for assoc in associations:
            product_dict = assoc.product.to_dict()
            # Usar posição override se definida, senão usar posição padrão
            product_dict['posicao'] = assoc.position_override or assoc.product.posicao
            products.append(product_dict)
        
        return jsonify({
            'panel': panel.to_dict(),
            'department': panel.department.to_dict(),
            'products': products,
            'config': {
                'polling_interval': panel.polling_interval,
                'title': panel.title or panel.department.name.upper(),
                'subtitle': panel.subtitle,
                'footer_text': panel.footer_text
            }
        })
        
    except Exception as e:
        return jsonify({'error': f'Erro ao visualizar painel: {str(e)}'}), 500

def perform_sync_department_panel(department_id, panel_id, exact_match=True):
    panel = DepartmentPanel.query.filter_by(
        id=panel_id,
        department_id=department_id,
        active=True
    ).first_or_404()
    department = Department.query.get_or_404(department_id)
    raw = (department.keywords or '').strip()
    keywords = []
    if raw:
        try:
            import json
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                keywords = [str(k).strip() for k in parsed if str(k).strip()]
        except Exception:
            keywords = [k.strip() for k in raw.split(',') if k.strip()]
    from unicodedata import normalize, combining
    import re
    def _norm(s):
        s = normalize('NFD', s or '')
        s = ''.join(c for c in s if not combining(c))
        s = s.lower()
        s = re.sub(r'\s+', ' ', s).strip()
        return s
    def _match(name):
        n = _norm(name or '')
        kw = [_norm(k) for k in keywords]
        if exact_match:
            return n in set(kw)
        return any(k in n for k in kw)
    associations = ProductPanelAssociation.query.filter_by(panel_id=panel.id).all()
    removed_count = 0
    keep_map = {}
    dup_remove = []
    for assoc in associations:
        pname = assoc.product.nome if assoc.product else ''
        if not _match(pname):
            db.session.delete(assoc)
            removed_count += 1
            continue
        key = _norm(pname)
        prev = keep_map.get(key)
        if not prev:
            keep_map[key] = assoc
        else:
            try:
                prev_price = float(prev.product.preco or 0)
                cur_price = float(assoc.product.preco or 0)
                if cur_price > prev_price:
                    dup_remove.append(prev)
                    keep_map[key] = assoc
                else:
                    dup_remove.append(assoc)
            except Exception:
                dup_remove.append(assoc)
    for a in dup_remove:
        try:
            db.session.delete(a)
            removed_count += 1
        except Exception:
            pass
    existing_ids = db.session.query(ProductPanelAssociation.product_id).filter_by(panel_id=panel.id).subquery()
    candidates = ButcherProduct.query.filter(
        ButcherProduct.ativo == True,
        ~ButcherProduct.id.in_(existing_ids)
    ).all()
    added_count = 0
    grouped = {}
    for product in candidates:
        if _match(product.nome):
            key = _norm(product.nome)
            prev = grouped.get(key)
            if not prev:
                grouped[key] = product
            else:
                try:
                    prev_price = float(prev.preco or 0)
                    cur_price = float(product.preco or 0)
                    if cur_price > prev_price:
                        grouped[key] = product
                except Exception:
                    grouped[key] = product
    for sel in grouped.values():
        assoc = ProductPanelAssociation(product_id=sel.id, panel_id=panel.id, active_in_panel=True)
        db.session.add(assoc)
        added_count += 1
    db.session.commit()
    return {
        'removed_count': removed_count,
        'added_count': added_count,
        'panel': panel.name,
        'department': department.name
    }

@app.route('/api/departments/<department_id>/panels/<panel_id>/sync', methods=['POST'])
def sync_department_panel(department_id, panel_id):
    try:
        data = request.get_json() or {}
        exact_match = bool(data.get('exact_match', True))
        result = perform_sync_department_panel(department_id, panel_id, exact_match)
        return jsonify({'message': 'Painel sincronizado', **result})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro na sincronização do painel: {str(e)}'}), 500

def create_admin_user():
    """Criar usuário admin inicial se não existir"""
    admin = User.query.filter_by(email='admin@paineltv.com').first()
    if not admin:
        admin = User(
            name='Administrador',
            email='admin@paineltv.com',
            role='admin'
        )
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()
        print("[INFO] Usuário admin criado: admin@paineltv.com / admin123")
    else:
        print("[INFO] Usuário admin já existe")

def create_default_departments():
    """Criar departamentos padrão se não existirem"""
    departments_data = [
        {
            'name': 'Açougue',
            'code': 'ACG',
            'description': 'Departamento de carnes e derivados',
            'color': '#DC2626',
            'icon': 'Beef'
        },
        {
            'name': 'Padaria',
            'code': 'PAD',
            'description': 'Departamento de pães e confeitaria',
            'color': '#D97706',
            'icon': 'Croissant'
        },
        {
            'name': 'Hortifrúti',
            'code': 'HRT',
            'description': 'Departamento de frutas, verduras e legumes',
            'color': '#059669',
            'icon': 'Apple'
        }
    ]
    
    for dept_data in departments_data:
        existing = Department.query.filter_by(code=dept_data['code']).first()
        if not existing:
            # Criar departamento primeiro
            department = Department(**dept_data)
            db.session.add(department)
            db.session.flush()  # Flush para obter o ID do departamento
            
            # Criar painel padrão para o departamento
            default_panel = DepartmentPanel(
                name=f'Painel Principal {dept_data["name"]}',
                description=f'Painel principal do departamento {dept_data["name"]}',
                department_id=department.id,
                title=dept_data['name'].upper(),
                subtitle='Produtos Selecionados',
                footer_text='Horário de funcionamento: Segunda a Sábado das 7h às 19h',
                is_default=True,
                display_order=1
            )
            db.session.add(default_panel)
            
            print(f"[INFO] Departamento {dept_data['name']} criado com painel padrão")
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] Erro ao criar departamentos padrão: {e}")

def ensure_db_initialized():
    with app.app_context():
        db.create_all()
        try:
            create_admin_user()
            create_default_departments()
        except Exception:
            pass

ensure_db_initialized()

# Adicionar endpoint de validação de código único
@app.route('/api/acougue/produtos/validate-code', methods=['GET'])
def validate_butcher_product_code():
    """Valida se um código de produto está disponível"""
    code = request.args.get('code')
    exclude_id = request.args.get('excludeId')  # ID do produto a ser ignorado (para edições)
    
    if not code:
        return jsonify({
            'success': False,
            'error': {
                'code': 'MISSING_CODE',
                'message': 'Código do produto é obrigatório',
                'userMessage': 'Por favor, informe o código do produto'
            }
        }), 400
    
    # Limpar e normalizar o código
    code = code.strip().upper()
    
    # Verificar se já existe produto com este código
    query = ButcherProduct.query.filter_by(codigo=code)
    if exclude_id:
        query = query.filter(ButcherProduct.id != exclude_id)
    
    existing = query.first()
    
    if existing:
        return jsonify({
            'success': False,
            'data': {
                'isValid': False,
                'message': f'Código "{code}" já está em uso',
                'suggestedCode': generate_suggested_code(code)
            }
        })
    
    return jsonify({
        'success': True,
        'data': {
            'isValid': True,
            'message': f'Código "{code}" está disponível'
        }
    })

def generate_suggested_code(base_code):
    """Gera sugestão de código alternativo quando o código já existe"""
    # Tentar adicionar número ao final
    import re
    match = re.search(r'(\d+)$', base_code)
    if match:
        # Já tem número no final, incrementar
        num = int(match.group(1))
        suggested = base_code[:match.start()] + str(num + 1)
    else:
        # Adicionar número 1
        suggested = base_code + '1'
    
    # Verificar se a sugestão também existe
    existing = ButcherProduct.query.filter_by(codigo=suggested).first()
    if existing:
        # Se a sugestão também existe, tentar outro número
        for i in range(2, 10):
            alt_suggested = base_code + str(i)
            if not ButcherProduct.query.filter_by(codigo=alt_suggested).first():
                return alt_suggested
        # Se todas as sugestões existem, retornar None
        return None
    
    return suggested

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        create_admin_user()
        create_default_departments()
    app.run(host='0.0.0.0', port=5000, debug=True)
