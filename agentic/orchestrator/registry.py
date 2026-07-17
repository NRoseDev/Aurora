# agentic/orchestrator/registry.py

# Centralized mapping of task names to their respective backend script paths
TOOL_REGISTRY = {
    "image_optimization": "backend/scripts/optimize_images.py",
    "data_sync": "backend/scripts/sync_data.py",
    "cache_clear": "backend/scripts/maintenance/clear_cache.py"
}

def get_tool(task_name):
    """Returns the system path for a given task, or None if missing."""
    return TOOL_REGISTRY.get(task_name)

def register_tool(task_name, script_path):
    """Dynamically adds new tasks to the registry."""
    TOOL_REGISTRY[task_name] = script_path
