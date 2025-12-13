#!/usr/bin/env python3
"""
Script de migração de dados do sistema PainelTV
Migra dados do modelo antigo (Panel com start_date/end_date) para o novo modelo (Panel + Action)
"""

import os
import sys
from datetime import datetime
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import uuid
import pytz

# Configurar o app Flask para migração
app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INSTANCE_DIR = os.path.join(BASE_DIR, 'instance')
os.makedirs(INSTANCE_DIR, exist_ok=True)

app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(INSTANCE_DIR, 'paineltv.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Configurar timezone do Brasil
BRAZIL_TZ = pytz.timezone('America/Sao_Paulo')

def get_brazil_now():
    """Retorna o datetime atual no timezone de Brasília"""
    return datetime.now(BRAZIL_TZ)

# Definir modelos para migração
class Panel(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    layout_type = db.Column(db.String(20), nullable=False, default='layout_1')
    fixed_url = db.Column(db.String(100), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=get_brazil_now)
    updated_at = db.Column(db.DateTime, default=get_brazil_now, onupdate=get_brazil_now)
    actions = db.relationship('Action', backref='panel', lazy=True, cascade='all, delete-orphan')
    
    # Campos legados - manter temporariamente
    start_date = db.Column(db.DateTime, nullable=True)
    end_date = db.Column(db.DateTime, nullable=True)
    
    def __init__(self, **kwargs):
        super(Panel, self).__init__(**kwargs)
        if not self.fixed_url:
            self.fixed_url = str(uuid.uuid4())[:8]

class Action(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    panel_id = db.Column(db.String(36), db.ForeignKey('panel.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=get_brazil_now)
    updated_at = db.Column(db.DateTime, default=get_brazil_now, onupdate=get_brazil_now)
    images = db.relationship('ActionImage', backref='action', lazy=True, cascade='all, delete-orphan')

class ActionImage(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    action_id = db.Column(db.String(36), db.ForeignKey('action.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=get_brazil_now)

class MediaFile(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(10), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    panel_id = db.Column(db.String(36), db.ForeignKey('panel.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=get_brazil_now)

def migrate_data():
    """Migra dados do modelo antigo para o novo"""
    print("Iniciando migração de dados...")
    
    with app.app_context():
        # Criar todas as tabelas
        db.create_all()
        
        # Buscar painéis que têm start_date e end_date (modelo antigo)
        old_panels = Panel.query.filter(
            Panel.start_date.isnot(None),
            Panel.end_date.isnot(None)
        ).all()
        
        migrated_count = 0
        
        for panel in old_panels:
            print(f"Migrando painel: {panel.name} (ID: {panel.id})")
            
            # Garantir que o painel tem fixed_url
            if not panel.fixed_url:
                panel.fixed_url = str(uuid.uuid4())[:8]
                print(f"  - URL fixa gerada: {panel.fixed_url}")
            
            # Garantir que o painel tem layout_type
            if not panel.layout_type:
                panel.layout_type = 'layout_1'
                print(f"  - Layout definido: {panel.layout_type}")
            
            # Criar uma ação com os dados do painel antigo
            action_name = f"Ação - {panel.name}"
            action = Action(
                name=action_name,
                start_date=panel.start_date,
                end_date=panel.end_date,
                panel_id=panel.id
            )
            db.session.add(action)
            print(f"  - Ação criada: {action_name}")
            
            # Migrar MediaFiles para ActionImages
            media_files = MediaFile.query.filter_by(panel_id=panel.id).all()
            for media in media_files:
                if media.file_type == 'image':  # Só migrar imagens
                    action_image = ActionImage(
                        filename=media.filename,
                        original_filename=media.original_filename,
                        file_path=media.file_path,
                        action_id=action.id
                    )
                    db.session.add(action_image)
                    print(f"    - Imagem migrada: {media.original_filename}")
            
            # Atualizar apenas o timestamp
            panel.updated_at = get_brazil_now()
            
            migrated_count += 1
        
        # Salvar todas as mudanças
        db.session.commit()
        
        print(f"\nMigração concluída!")
        print(f"Painéis migrados: {migrated_count}")
        print(f"Total de painéis: {Panel.query.count()}")
        print(f"Total de ações: {Action.query.count()}")
        print(f"Total de imagens de ações: {ActionImage.query.count()}")

def rollback_migration():
    """Desfaz a migração (para testes)"""
    print("Desfazendo migração...")
    
    with app.app_context():
        # Deletar todas as ações e imagens de ações
        ActionImage.query.delete()
        Action.query.delete()
        
        # Resetar campos dos painéis
        panels = Panel.query.all()
        for panel in panels:
            panel.start_date = get_brazil_now()
            panel.end_date = get_brazil_now()
        
        db.session.commit()
        print("Migração desfeita!")

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--rollback':
        rollback_migration()
    else:
        migrate_data()