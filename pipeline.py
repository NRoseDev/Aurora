import os
import json
from pathlib import Path
from datetime import datetime

class AuroraPipeline:
    def __init__(self, root_dir="./aurora_data"):
        self.root_dir = Path(root_dir)
        self.assets_dir = self.root_dir / "assets"
        self.metadata_file = self.root_dir / "metadata.json"
        
        self.root_dir.mkdir(parents=True, exist_ok=True)
        self.assets_dir.mkdir(parents=True, exist_ok=True)
        self._init_metadata()
        print(f"Aurora local pipeline initialized at: {self.root_dir.resolve()}")

    def _init_metadata(self):
        if not self.metadata_file.exists():
            with open(self.metadata_file, "w") as f:
                json.dump({}, f)

    def ingest_asset(self, file_path):
        source = Path(file_path)
        if not source.exists():
            print(f"File not found: {source}")
            return None
            
        dest = self.assets_dir / source.name
        with open(source, "rb") as f_in, open(dest, "wb") as f_out:
            f_out.write(f_in.read())
            
        metadata = {
            "original_path": str(source.resolve()),
            "local_path": str(dest.resolve()),
            "size_bytes": dest.stat().st_size,
            "timestamp": datetime.now().isoformat()
        }
        
        self._save_metadata(source.name, metadata)
        print(f"Ingested and indexed locally: {source.name}")
        return str(dest)

    def _save_metadata(self, key, data):
        with open(self.metadata_file, "r") as f:
            store = json.load(f)
        store[key] = data
        with open(self.metadata_file, "w") as f:
            json.dump(store, f, indent=4)

if __name__ == "__main__":
    pipeline = AuroraPipeline()
