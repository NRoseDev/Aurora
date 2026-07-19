from engine_core import load_compass

def process_request(domain, prompt):
    config = load_compass(domain)
    
    # This prepares the context for the AI
    system_instruction = f"You are acting within the {config.get('domain')} domain. Tone: {config.get('tone')}. Goal: {config.get('key_goals')}."
    
    return f"System: {system_instruction}\nUser Prompt: {prompt}"

# Test integration
if __name__ == "__main__":
    print(process_request("business", "Draft a project update."))
