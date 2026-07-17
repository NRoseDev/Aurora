# agentic/orchestrator/core_loop.py
from .registry import get_tool
from .self_healing import SelfHealingEngine

class AgenticOrchestrator:
    def __init__(self):
        self.healer = SelfHealingEngine()

    def plan(self, goal):
        print(f"Orchestrating plan for: {goal}")

    def execute_with_protection(self, task_name):
        try:
            tool = get_tool(task_name)
            # Execute tool logic here
        except Exception as e:
            self.healer.handle_error(type(e).__name__, task_name)
