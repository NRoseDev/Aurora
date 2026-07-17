# agentic/orchestrator/core_loop.py
from .registry import get_tool
from .self_healing import SelfHealingEngine
from .executor import run_backend_task

class AgenticOrchestrator:
    def __init__(self):
        self.healer = SelfHealingEngine()

    def plan(self, goal):
        print(f"Orchestrating plan for: {goal}")

    def execute_task(self, task_name):
        try:
            tool_path = get_tool(task_name)
            if not tool_path:
                raise ValueError(f"Tool {task_name} not registered")
            return run_backend_task(task_name)
        except Exception as e:
            return self.healer.handle_error(type(e).__name__, task_name)
