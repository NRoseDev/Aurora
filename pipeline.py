import os
import json
from pathlib import Path
from datetime import datetime

class AuroraPipeline:
    def __init__(self, root_dir="./aurora_data"):
        self.root_dir = Path(root_dir)
        self.assets_dir = self.root_dir / "assets"
        self.processed_dir = self.root_dir / "processed"
        self.metadata_file = self.root_dir / "metadata.json"
        
        self.root_dir.mkdir(parents=True, exist_ok=True)
        self.assets_dir.mkdir(parents=True, exist_ok=True)
        self.processed_dir.mkdir(parents=True, exist_ok=True)
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
            "timestamp": datetime.now().isoformat(),
            "status": "ingested"
        }
        
        self._save_metadata(source.name, metadata)
        print(f"Ingested and indexed locally: {source.name}")
        return str(dest)

    def process_asset(self, file_name, operation="standard"):
        source = self.assets_dir / file_name
        if not source.exists():
            print(f"Asset not found in storage: {file_name}")
            return None
            
        dest = self.processed_dir / f"processed_{file_name}"
        
        with open(source, "rb") as f_in, open(dest, "wb") as f_out:
            f_out.write(f_in.read())
            
        with open(self.metadata_file, "r") as f:
            store = json.load(f)
            
        if file_name in store:
            store[file_name]["status"] = "processed"
            store[file_name]["processed_path"] = str(dest.resolve())
            store[file_name]["operation"] = operation
            
        with open(self.metadata_file, "w") as f:
            json.dump(store, f, indent=4)
            
        print(f"Locally processed [{operation}]: {file_name}")
        return str(dest)

    def _save_metadata(self, key, data):
        with open(self.metadata_file, "r") as f:
            store = json.load(f)
        store[key] = data
        with open(self.metadata_file, "w") as f:
            json.dump(store, f, indent=4)

if __name__ == "__main__":
    pipeline = AuroraPipeline()
