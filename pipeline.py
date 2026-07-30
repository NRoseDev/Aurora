import os
import json
from pathlib import Path

class AuroraPipeline:
    def __init__(self, root_dir="./aurora_data"):
        self.root_dir = Path(root_dir)
        self.root_dir.mkdir(parents=True, exist_ok=True)
        print(f"Aurora local pipeline initialized at: {self.root_dir.resolve()}")

if __name__ == "__main__":
    pipeline = AuroraPipeline()
