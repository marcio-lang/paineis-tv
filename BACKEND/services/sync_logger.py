import json
import sqlite3
from datetime import datetime
from typing import Iterable, List, Optional


DEFAULT_DEPARTMENT_KEYWORDS = {
    'ACG': ['carne', 'boi', 'porco', 'frango', 'linguiça', 'costela', 'picanha', 'alcatra', 'maminha', 'patinho', 'acém', 'músculo'],
    'PAD': ['pão', 'bolo', 'torta', 'biscoito', 'doce', 'salgado', 'croissant', 'sonho', 'rosquinha', 'broa'],
    'HRT': ['alface', 'tomate', 'cebola', 'batata', 'cenoura', 'abobrinha', 'pepino', 'pimentão', 'banana', 'maçã', 'laranja', 'limão'],
}


def ensure_sync_log_table(db_path: str) -> None:
    with sqlite3.connect(db_path) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS sync_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                data TEXT NOT NULL,
                total_produtos INTEGER NOT NULL DEFAULT 0,
                departamentos TEXT NOT NULL DEFAULT '[]',
                source TEXT,
                job_id TEXT
            )
            """
        )
        conn.commit()


def record_sync_log(
    db_path: str,
    *,
    total_products: int,
    product_names: Optional[Iterable[str]] = None,
    source: Optional[str] = None,
    job_id: Optional[str] = None,
    occurred_at: Optional[datetime] = None,
) -> dict:
    ensure_sync_log_table(db_path)
    product_names = list(product_names or [])
    departments = detect_affected_departments(db_path, product_names)
    timestamp = occurred_at or datetime.now()
    data_text = timestamp.strftime('%Y-%m-%d %H:%M:%S')

    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO sync_log (data, total_produtos, departamentos, source, job_id)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                data_text,
                int(total_products or 0),
                json.dumps(departments, ensure_ascii=False),
                source,
                job_id,
            ),
        )
        sync_id = cursor.lastrowid
        conn.commit()

    return {
        'id': sync_id,
        'data': data_text,
        'produtos_atualizados': int(total_products or 0),
        'departamentos': departments,
        'source': source,
        'job_id': job_id,
    }


def get_latest_sync_log(db_path: str) -> Optional[dict]:
    ensure_sync_log_table(db_path)
    with sqlite3.connect(db_path) as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute(
            """
            SELECT id, data, total_produtos, departamentos, source, job_id
            FROM sync_log
            ORDER BY id DESC
            LIMIT 1
            """
        ).fetchone()
    return _row_to_payload(row) if row else None


def get_sync_log_history(db_path: str, limit: int = 10) -> List[dict]:
    ensure_sync_log_table(db_path)
    safe_limit = max(1, min(int(limit or 10), 100))
    with sqlite3.connect(db_path) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            """
            SELECT id, data, total_produtos, departamentos, source, job_id
            FROM sync_log
            ORDER BY id DESC
            LIMIT ?
            """,
            (safe_limit,),
        ).fetchall()
    return [_row_to_payload(row) for row in rows]


def detect_affected_departments(db_path: str, product_names: Iterable[str]) -> List[str]:
    normalized_products = [normalize_text(name) for name in product_names if normalize_text(name)]
    if not normalized_products:
        return []

    departments = load_active_departments(db_path)
    matched_departments = []
    for department in departments:
        keywords = department['keywords']
        if any(matches_department(product_name, keywords) for product_name in normalized_products):
            matched_departments.append(department['name'])

    return matched_departments


def load_active_departments(db_path: str) -> List[dict]:
    with sqlite3.connect(db_path) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            """
            SELECT id, name, code, keywords
            FROM department
            WHERE active = 1
            ORDER BY name
            """
        ).fetchall()

    departments = []
    for row in rows:
        keywords = parse_keywords(row['keywords'])
        keywords.extend(DEFAULT_DEPARTMENT_KEYWORDS.get((row['code'] or '').upper(), []))
        unique_keywords = []
        seen = set()
        for keyword in keywords:
            normalized = normalize_text(keyword)
            if not normalized or normalized in seen:
                continue
            seen.add(normalized)
            unique_keywords.append(normalized)

        departments.append(
            {
                'id': row['id'],
                'name': row['name'],
                'code': row['code'],
                'keywords': unique_keywords,
            }
        )

    return departments


def matches_department(product_name: str, keywords: Iterable[str]) -> bool:
    for keyword in keywords:
        if product_name == keyword or keyword in product_name:
            return True
    return False


def parse_keywords(raw_keywords) -> List[str]:
    if not raw_keywords:
        return []

    if isinstance(raw_keywords, list):
        return [str(item).strip() for item in raw_keywords if str(item).strip()]

    value = str(raw_keywords).strip()
    if not value:
        return []

    try:
        parsed = json.loads(value)
        if isinstance(parsed, list):
            return [str(item).strip() for item in parsed if str(item).strip()]
    except Exception:
        pass

    return [item.strip() for item in value.split(',') if item.strip()]


def normalize_text(value: str) -> str:
    import re
    import unicodedata

    normalized = unicodedata.normalize('NFD', str(value or ''))
    normalized = ''.join(char for char in normalized if not unicodedata.combining(char))
    normalized = normalized.lower()
    normalized = re.sub(r'\s+', ' ', normalized).strip()
    return normalized


def _row_to_payload(row: sqlite3.Row) -> dict:
    departments = []
    try:
        departments = json.loads(row['departamentos'] or '[]')
    except Exception:
        departments = []

    return {
        'id': row['id'],
        'data': row['data'],
        'produtos_atualizados': int(row['total_produtos'] or 0),
        'departamentos': departments,
        'source': row['source'],
        'job_id': row['job_id'],
    }
