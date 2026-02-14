import re
import json
import sys
from pathlib import Path
from urllib.request import Request, urlopen

def parse_items(txt_path: str):
    text = Path(txt_path).read_text(encoding='latin-1', errors='ignore')
    # Regex pattern corrigida para extrair código maior (posições 3-9) e preço (posições 10-15)
    pat = re.compile(r'^(\d{2})(\d{7})(\d{6})(\d{3})(.+)$', re.IGNORECASE)
    produtos = []
    for ln in text.splitlines():
        ln = ln.rstrip()
        m = pat.match(ln)
        if m:
            preco = round(int(m.group(3)) / 100, 2)
            nome_raw = m.group(5).strip()
            # Limpar "kg"/"un" do nome
            nome_raw = re.sub(r'\b(?:kg|un)\b', '', nome_raw, flags=re.IGNORECASE).strip()
        else:
            if len(ln) < 20:
                continue
            preco_str = ln[9:15]
            try:
                preco = round(int(preco_str) / 100, 2)
            except Exception:
                continue
            name_part = ln[18:]
            nome_raw = re.sub(r'\b(?:kg|un)\b', '', name_part, flags=re.IGNORECASE).strip()
        
        cm = re.search(r'\b(?:KG|UN)\b\s*0*(\d{3,10})(?=\D|$)', ln, re.IGNORECASE)
        # Usar grupo 2 (7 dígitos) convertido para int para remover zeros à esquerda
        codigo = (cm.group(1) if cm else (str(int(m.group(2))) if m else ln[6:9]))
        nome = re.sub(r'(?:\s*[0-9]{4,})+$', '', nome_raw.strip())
        nome = re.sub(r'\s+', ' ', nome)
        nome = nome.title()
        nome = re.sub(r'\bPao\b', 'Pão', nome)
        nome = re.sub(r'\bFrances\b', 'Francês', nome)
        nome = re.sub(r'\bFile\b', 'Filé', nome)
        nome = re.sub(r'\bAcem\b', 'Acém', nome)
        nome = re.sub(r'\bCoxao\b', 'Coxão', nome)
        nome = re.sub(r'\bMelao\b', 'Melão', nome)
        nome = re.sub(r'\bLinguica\b', 'Linguiça', nome)
        nome = re.sub(r'\bPerdigao\b', 'Perdigão', nome)
        produtos.append({
            'codigo': codigo,
            'name': nome,
            'price': preco,
            'is_active': True
        })
    # Deduplicar por código: última ocorrência vence
    agg = {}
    for it in produtos:
        prev = agg.get(it['codigo'])
        if not prev or (it['price'] is not None and prev['price'] is not None and it['price'] > prev['price']):
            agg[it['codigo']] = it
    items = list(agg.values())
    return items

def post_import(produtos, api='http://127.0.0.1:5000/api/acougue/import-processed'):
    payload = json.dumps({'produtos': produtos}).encode('utf-8')
    req = Request(api, data=payload, headers={'Content-Type': 'application/json'}, method='POST')
    with urlopen(req) as resp:
        return resp.read().decode('utf-8')

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Uso: import_from_txt.py <caminho_ITENSMGV.TXT>')
        sys.exit(1)
    path = sys.argv[1]
    items = parse_items(path)
    print(json.dumps({'count': len(items), 'sample': items[:5]}, ensure_ascii=False, indent=2))
    print(post_import(items))
