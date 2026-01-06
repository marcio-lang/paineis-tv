
import sys
import os

sys.path.append(os.getcwd())

from app import app, db, DepartmentPanel

def list_all_panel_counts():
    with app.app_context():
        print("\n=== CONTAGEM DE PRODUTOS POR PAINEL ===")
        panels = DepartmentPanel.query.all()
        for panel in panels:
            count = panel.to_dict()['products_count']
            print(f"ID: {panel.id} | Count: {count} | Nome: {panel.name}")

if __name__ == "__main__":
    list_all_panel_counts()
