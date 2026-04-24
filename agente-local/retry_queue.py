import shutil
from datetime import datetime
from pathlib import Path


def ensure_runtime_dirs(base_dir):
    base_path = Path(base_dir)
    pending_dir = base_path / "pendentes"
    logs_dir = base_path / "logs"
    pending_dir.mkdir(parents=True, exist_ok=True)
    logs_dir.mkdir(parents=True, exist_ok=True)
    return pending_dir, logs_dir


def queue_file(source_path, pending_dir):
    source = Path(source_path)
    pending_dir = Path(pending_dir)
    pending_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    target = pending_dir / f"{timestamp}_{source.name}"
    shutil.copy2(source, target)
    return target


def list_pending_files(pending_dir):
    pending_dir = Path(pending_dir)
    if not pending_dir.exists():
        return []
    return sorted(path for path in pending_dir.iterdir() if path.is_file())


def remove_pending_file(file_path):
    path = Path(file_path)
    if path.exists():
        path.unlink()
