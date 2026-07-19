import json
import os

def load_compass(domain):
    file_path = f"compass_config/{domain}_compass.json"
    if os.path.exists(file_path):
        with open(file_path, 'r') as f:
            return json.load(f)
    return {"error": "Domain configuration not found"}

# Test load
if __name__ == "__main__":
    print(load_compass("personal"))
