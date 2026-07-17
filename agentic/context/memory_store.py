# agentic/context/memory_store.py

class ContextLake:
    def __init__(self):
        self.history = []

    def save_state(self, project_id, state_data):
        """Persists the current project state."""
        self.history.append({"project": project_id, "data": state_data})
        print(f"State saved for project: {project_id}")

    def load_state(self, project_id):
        """Retrieves past state to maintain context."""
        return [entry for entry in self.history if entry["project"] == project_id]
