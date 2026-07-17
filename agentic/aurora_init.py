# agentic/aurora_init.py
from orchestrator.core_loop import AgenticOrchestrator
from context.memory_store import ContextLake

class AuroraAgent:
    def __init__(self):
        self.orchestrator = AgenticOrchestrator()
        self.memory = ContextLake()

    def run_task(self, project_id, goal):
        print(f"Starting Aurora session for {project_id}")
        self.orchestrator.plan(goal)
        # Placeholder for integration logic
        
# Initialize the primary interface
aurora_system = AuroraAgent()
