import os
from collections import Counter, defaultdict
from pathlib import Path

from werkzeug.utils import secure_filename

from tools.import_from_txt import parse_items


def extract_bearer_token(auth_header):
    if not auth_header:
        return None
    parts = auth_header.strip().split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    return parts[1].strip() or None


def is_sync_token_valid(auth_header, expected_token):
    token = extract_bearer_token(auth_header)
    return bool(token and expected_token and token == expected_token)


def ensure_directory(path):
    Path(path).mkdir(parents=True, exist_ok=True)
    return str(Path(path))


def resolve_target_filename(filename):
    candidate = secure_filename(filename or "ITENSMGV.TXT") or "ITENSMGV.TXT"
    ext = Path(candidate).suffix.lower()
    if ext != ".txt":
        raise ValueError("Arquivo invalido. Envie um .txt")
    return "ITENSMGV.TXT"


def save_uploaded_sync_file(file_storage, upload_dir):
    ensure_directory(upload_dir)
    stored_filename = resolve_target_filename(file_storage.filename)
    target_path = Path(upload_dir) / stored_filename
    file_storage.save(target_path)
    return str(target_path), stored_filename


def count_text_lines(file_path):
    with open(file_path, "r", encoding="latin-1", errors="ignore") as handle:
        return sum(1 for _ in handle)


def normalize_name(value):
    import re
    import unicodedata

    normalized = unicodedata.normalize("NFD", value or "")
    normalized = "".join(ch for ch in normalized if not unicodedata.combining(ch))
    normalized = normalized.lower()
    normalized = re.sub(r"\s+", " ", normalized).strip()
    return normalized


def build_official_code_map(items):
    counters = defaultdict(Counter)
    for item in items:
        counters[normalize_name(item.get("name"))][item.get("codigo")] += 1
    return {
        normalized_name: counts.most_common(1)[0][0]
        for normalized_name, counts in counters.items()
        if normalized_name and counts
    }


def prepare_price_import(file_path):
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Arquivo nao encontrado: {file_path}")
    items = parse_items(file_path)
    return {
        "items": items,
        "official_code_map": build_official_code_map(items),
        "total_lines": count_text_lines(file_path),
    }
