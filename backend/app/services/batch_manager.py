import os
import shutil
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Optional
from app.core.config import settings

class BatchManager:
    def __init__(self, data_dir: str = settings.DATA_DIR):
        self.data_dir = Path(data_dir)
        self.temp_dir = Path(settings.TEMP_DIR)
        self.batches_dir = Path(settings.BATCHES_DIR)
        
        # Ensure directories exist
        self.temp_dir.mkdir(parents=True, exist_ok=True)
        self.batches_dir.mkdir(parents=True, exist_ok=True)

    def generate_session_id(self) -> str:
        return str(uuid.uuid4())

    def get_temp_session_path(self, session_id: str) -> Path:
        session_path = self.temp_dir / session_id
        session_path.mkdir(parents=True, exist_ok=True)
        return session_path

    def create_batch(self, custom_name: str, session_id: str, fields: Optional[List[str]] = None) -> str:
        """
        Moves files from temp session to a new permanent batch directory.
        Returns the generated batch name.
        Naming convention: [Custom Name]_[Human Readable Timestamp]_[Unique ID]
        """
        temp_path = self.get_temp_session_path(session_id)
        if not temp_path.exists() or not any(temp_path.iterdir()):
            raise ValueError(f"No files found for session {session_id}")

        timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        batch_name = f"{custom_name}_{timestamp}_{unique_id}"
        batch_path = self.batches_dir / batch_name
        
        # Create batch directory
        batch_path.mkdir(parents=True, exist_ok=False)

        # Store fields in config.json
        import json
        config_data = {
            "custom_name": custom_name,
            "fields": fields or settings.FIELD_KEYS,
            "created_at": datetime.now().isoformat()
        }
        with open(batch_path / "config.json", "w") as f:
            json.dump(config_data, f, indent=2)

        # Move files
        for item in temp_path.iterdir():
            if item.is_file():
                shutil.move(str(item), str(batch_path / item.name))

        # Cleanup temp session directory
        shutil.rmtree(str(temp_path))

        # Record History
        self._record_history(batch_name, custom_name, fields)

        return batch_name

    def _record_history(self, batch_name: str, custom_name: str, fields: Optional[List[str]] = None):
        history_file = Path(settings.BATCHES_HISTORY_FILE)
        import json
        history = []
        if history_file.exists():
            try:
                with open(history_file, "r") as f:
                    history = json.load(f)
            except Exception:
                history = []
        
        history.append({
            "batch_name": batch_name,
            "custom_name": custom_name,
            "created_at": datetime.now().isoformat(),
            "status": "uploaded",
            "progress": 0,
            "fields": fields or settings.FIELD_KEYS
        })
        
        with open(history_file, "w") as f:
            json.dump(history, f, indent=2)

    def list_batches(self) -> List[str]:
        if not self.batches_dir.exists():
            return []
        return [d.name for d in self.batches_dir.iterdir() if d.is_dir()]

    def get_batch_path(self, batch_name: str) -> Path:
        return self.batches_dir / batch_name

batch_manager = BatchManager()
