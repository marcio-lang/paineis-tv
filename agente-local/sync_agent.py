import json
import logging
import os
import threading
import time
from pathlib import Path

import requests

from retry_queue import ensure_runtime_dirs, list_pending_files, queue_file, remove_pending_file

try:
    from watchdog.events import FileSystemEventHandler
    from watchdog.observers import Observer
except ImportError as exc:
    raise SystemExit(
        "Dependencia ausente: watchdog. Instale com `pip install -r requirements.txt`."
    ) from exc


class WatchedFileHandler(FileSystemEventHandler):
    def __init__(self, agent):
        self.agent = agent

    def on_modified(self, event):
        self.agent.handle_fs_event(event)

    def on_created(self, event):
        self.agent.handle_fs_event(event)

    def on_moved(self, event):
        self.agent.handle_fs_event(event)


class SyncAgent:
    def __init__(self, config_path):
        self.base_dir = Path(__file__).resolve().parent
        self.config = self._load_config(config_path)
        self.pending_dir, self.logs_dir = ensure_runtime_dirs(self.base_dir)
        self.logger = self._build_logger()
        self.session = requests.Session()
        self.send_lock = threading.Lock()
        self.timer_lock = threading.Lock()
        self.debounce_timer = None
        self.last_event_at = 0.0
        self.cooldown_until = 0.0

        self.api_url = self._sanitize_url(self.config["api_url"])
        self.watched_file = self._resolve_file_path(self.config["arquivo_monitorado"])
        self.debounce_seconds = int(self.config.get("debounce_segundos", 10))
        self.retry_seconds = int(self.config.get("retry_segundos", 60))
        self.sync_token = os.environ.get("SYNC_TOKEN") or self.config.get("token")
        if not self.sync_token:
            raise RuntimeError("SYNC_TOKEN nao configurado no ambiente nem no config.json")

    def _load_config(self, config_path):
        with open(config_path, "r", encoding="utf-8") as handle:
            return json.load(handle)

    def _build_logger(self):
        logger = logging.getLogger("sync-agent")
        logger.setLevel(logging.INFO)
        logger.handlers.clear()

        file_handler = logging.FileHandler(self.logs_dir / "sync.log", encoding="utf-8")
        formatter = logging.Formatter("%(asctime)s %(levelname)s %(message)s")
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

        stream_handler = logging.StreamHandler()
        stream_handler.setFormatter(formatter)
        logger.addHandler(stream_handler)
        return logger

    def _sanitize_url(self, value):
        return (value or "").strip().strip("`").strip()

    def _resolve_file_path(self, value):
        path = Path(value).expanduser()
        if not path.is_absolute():
            path = (self.base_dir / path).resolve()
        return path

    def _pending_already_exists(self, original_name):
        return any(path.name.endswith(original_name) for path in list_pending_files(self.pending_dir))

    def _upload_file(self, file_path):
        with open(file_path, "rb") as handle:
            response = self.session.post(
                self.api_url,
                headers={"Authorization": f"Bearer {self.sync_token}"},
                files={"file": (file_path.name, handle, "text/plain")},
                timeout=30,
            )

        if response.status_code == 401:
            raise RuntimeError("Token invalido (401)")
        if response.status_code >= 400:
            raise RuntimeError(f"Falha no upload ({response.status_code}): {response.text[:300]}")
        return response

    def _send_or_queue(self, file_path, reason, from_queue=False):
        with self.send_lock:
            if not file_path.exists():
                self.logger.warning("Arquivo nao encontrado para sincronizar: %s", file_path)
                return

            try:
                response = self._upload_file(file_path)
                self.cooldown_until = time.time() + self.debounce_seconds
                self.logger.info(
                    "Sincronizacao concluida: origem=%s arquivo=%s resposta=%s",
                    reason,
                    file_path.name,
                    response.status_code,
                )
                if from_queue:
                    remove_pending_file(file_path)
            except Exception as exc:
                self.cooldown_until = time.time() + self.debounce_seconds
                if not from_queue and not self._pending_already_exists(file_path.name):
                    queued = queue_file(file_path, self.pending_dir)
                    self.logger.error(
                        "Falha no envio; arquivo movido para fila: arquivo=%s fila=%s erro=%s",
                        file_path,
                        queued,
                        exc,
                    )
                else:
                    self.logger.error(
                        "Falha no envio; arquivo permanecera pendente: arquivo=%s erro=%s",
                        file_path,
                        exc,
                    )

    def _flush_debounce(self, reason):
        with self.timer_lock:
            elapsed = time.time() - self.last_event_at
            if elapsed < self.debounce_seconds:
                wait_time = self.debounce_seconds - elapsed
                self.debounce_timer = threading.Timer(wait_time, self._flush_debounce, args=(reason,))
                self.debounce_timer.daemon = True
                self.debounce_timer.start()
                return

            self.debounce_timer = None

        self._send_or_queue(self.watched_file, reason)

    def schedule_sync(self, reason):
        if time.time() < self.cooldown_until:
            self.logger.info("Evento ignorado por debounce pos-envio: %s", reason)
            return

        with self.timer_lock:
            self.last_event_at = time.time()
            if self.debounce_timer is not None:
                self.debounce_timer.cancel()
            self.debounce_timer = threading.Timer(
                self.debounce_seconds,
                self._flush_debounce,
                args=(reason,),
            )
            self.debounce_timer.daemon = True
            self.debounce_timer.start()

        self.logger.info("Alteracao detectada; aguardando debounce: %s", reason)

    def handle_fs_event(self, event):
        event_path = getattr(event, "dest_path", None) or getattr(event, "src_path", None)
        if not event_path:
            return
        if Path(event_path).resolve() != self.watched_file:
            return
        self.schedule_sync(type(event).__name__)

    def retry_pending_loop(self):
        while True:
            try:
                if time.time() >= self.cooldown_until:
                    pending_files = list_pending_files(self.pending_dir)
                    if pending_files:
                        self.logger.info("Tentando reenviar arquivo pendente: %s", pending_files[0].name)
                        self._send_or_queue(pending_files[0], "retry", from_queue=True)
            except Exception as exc:
                self.logger.error("Erro no retry automatico: %s", exc)
            time.sleep(self.retry_seconds)

    def start(self):
        watch_parent = self.watched_file.parent
        watch_parent.mkdir(parents=True, exist_ok=True)

        observer = Observer()
        observer.schedule(WatchedFileHandler(self), str(watch_parent), recursive=False)
        observer.start()

        retry_thread = threading.Thread(target=self.retry_pending_loop, daemon=True, name="sync-retry")
        retry_thread.start()

        self.logger.info("Agente iniciado: arquivo=%s api=%s", self.watched_file, self.api_url)
        self.logger.info("Debounce=%ss Retry=%ss", self.debounce_seconds, self.retry_seconds)

        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            self.logger.info("Encerrando agente de sincronizacao")
            observer.stop()
        observer.join()


if __name__ == "__main__":
    config_file = Path(__file__).resolve().parent / "config.json"
    agent = SyncAgent(config_file)
    agent.start()
