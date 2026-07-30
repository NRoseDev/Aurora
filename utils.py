import os
import json
from pathlib import Path
from datetime import datetime

class AuroraUtils:
    @staticmethod
    def setup_directories(root_dir):
        root = Path(root_dir)
        assets = root / "assets"
        processed = root / "processed"
        logs = root / "logs"
        
        root.mkdir(parents=True, exist_ok=True)
        assets.mkdir(parents=True, exist_ok=True)
        processed.mkdir(parents=True, exist_ok=True)
        logs.mkdir(parents=True, exist_ok=True)
        return root

    @staticmethod
    def log_event(message, log_dir="./aurora_data/logs"):
        log_path = Path(log_dir)
        log_path.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now().strftime("%Y-%m-%d")
        log_file = log_path / f"{timestamp}.log"
        
        entry = f"[{datetime.now().isoformat()}] {message}\n"
        with open(log_file, "a") as f:
            f.write(entry)

if __name__ == "__main__":
    print("Aurora Utils module loaded.")
