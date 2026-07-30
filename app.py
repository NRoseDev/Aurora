import sys
from pathlib import Path
from controller import AuroraController

def main():
    print("Initializing Aurora Creative Engine (Local-First)...")
    controller = AuroraController()
    
    # Example command-line interface hook for local asset execution
    if len(sys.argv) > 2:
        command = sys.argv[1].lower()
        target = sys.argv[2]
        
        if command == "ingest":
            controller.handle_ingest(target)
        elif command == "process":
            operation = sys.argv[3] if len(sys.argv) > 3 else "standard"
            controller.handle_process(target, operation=operation)
        else:
            print(f"Unknown command: {command}. Use 'ingest' or 'process'.")
    else:
        print("Aurora engine is active. Pass 'ingest <filepath>' or 'process <filename> <operation>' to execute.")

if __name__ == "__main__":
    main()
