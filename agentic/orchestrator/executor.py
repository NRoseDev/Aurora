# agentic/orchestrator/executor.py
import subprocess
import os

def run_backend_task(task_key):
    # Mapping to your actual scripts
    tasks = {
        "image_optimization": ["python3", "backend/ai_resizer.py"],
    }
    
    cmd = tasks.get(task_key)
    if not cmd:
        return f"No task found for {task_key}"
        
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout or result.stderr
