
import requests
import json

def check_discrepancy():
    base_url = "http://localhost:5000/api"
    
    try:
        # 1. Get all departments
        deps_resp = requests.get(f"{base_url}/departments")
        if deps_resp.status_code != 200:
            print(f"Erro ao buscar departamentos: {deps_resp.status_code}")
            return
        
        departments = deps_resp.json()
        
        for dep in departments:
            dep_id = dep['id']
            # 2. Get panels for department
            panels_resp = requests.get(f"{base_url}/departments/{dep_id}/panels")
            if panels_resp.status_code != 200:
                continue
                
            panels = panels_resp.json()
            for panel in panels:
                panel_id = panel['id']
                panel_name = panel['name']
                reported_count = panel['products_count']
                
                # 3. Get actual products from the route
                products_resp = requests.get(f"{base_url}/panels/{panel_id}/products")
                if products_resp.status_code != 200:
                    print(f"Erro ao buscar produtos do painel {panel_name}: {products_resp.status_code}")
                    continue
                
                actual_products = products_resp.json()
                actual_count = len(actual_products)
                
                if reported_count != actual_count:
                    print(f"DISCREPÂNCIA no painel '{panel_name}' (ID: {panel_id}):")
                    print(f"  - No Objeto (products_count): {reported_count}")
                    print(f"  - Na Rota (/products): {actual_count}")
                    
                    # Debug: list the products returned
                    print("  - Produtos retornados pela rota:")
                    for p in actual_products:
                        print(f"    * {p['name']} (Assoc ID: {p['id']})")
                else:
                    # print(f"Painel '{panel_name}': OK ({reported_count})")
                    pass

    except Exception as e:
        print(f"Erro durante a verificação: {e}")

if __name__ == "__main__":
    # Make sure the server is running before running this
    check_discrepancy()
