import sys
from pathlib import Path
from pipeline import AuroraPipeline

class AuroraController:
    def __init__(self, root_dir="./aurora_data"):
        self.pipeline = AuroraPipeline(root_dir=root_dir)

    def handle_ingest(self, file_path):
        result = self.pipeline.ingest_asset(file_path)
        if result:
            print(f"Controller successfully ingested: {file_path}")
        return result

    def handle_process(self, file_name, operation="standard"):
        result = self.pipeline.process_asset(file_name, operation=operation)
        if result:
            print(f"Controller successfully processed: {file_name} with operation '{operation}'")
        return result

if __name__ == "__main__":
    controller = AuroraController()
    print("Aurora Controller is active and ready.")
