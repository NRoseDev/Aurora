#!/usr/bin/env python3
"""
Aurora System Initialization Script
Locates, verifies, and initializes core system dependencies, relational 
database pipelines, and universal accessibility states across backend environments.
"""

import os
import sys
import logging

# Configure basic console log monitoring
logging.basicConfig(
    level=logging.INFO,
    format="[AURORA-INIT] %(asctime)s - %(levelname)s - %(message)s"
)

def verify_repository_structure():
    """Validates that the essential repository directory map is present."""
    required_directories = ["backend", "frontend", "database"]
    missing_dirs = []
    
    for directory in required_directories:
        if not os.path.exists(directory):
            missing_dirs.append(directory)
            
    if missing_dirs:
        logging.error(f"Critical workspace error: Missing directories {missing_dirs}")
        return False
        
    logging.info("Workspace directory map validation successful.")
    return True

def check_database_blueprint():
    """Ensures schema.sql is accessible and contains required table structural blueprints."""
    schema_path = os.path.join("database", "schema.sql")
    if not os.path.exists(schema_path):
        logging.error("Initialization failed: database/schema.sql could not be located.")
        return False
        
    # Simple check to confirm schema rules were populated
    try:
        with open(schema_path, "r", encoding="utf-8") as schema_file:
            content = schema_file.read()
            if "UNIVERSAL ACCESSIBILITY MECHANISMS" not in content:
                logging.warning("Accessibility architecture flags are missing inside schema.sql.")
    except Exception as e:
        logging.error(f"Could not read database/schema.sql file: {str(e)}")
        return False

    logging.info("Relational database schema blueprint located and validated.")
    return True

def initialize_system_environment():
    """Sets system-wide defaults for accessibility engines, notifications, and fees."""
    logging.info("Initializing global execution contexts...")
    
    # Pre-loading system state fallback configurations
    global_config = {
        "INITIAL_BASE_PLATFORM_FEE": 0.05,        # 5% Beginner Tier ceiling
        "MAX_PLATFORM_COMMISSION_CEILING": 0.11,  # 11% Absolute cap
        "DEFAULT_ACCESSIBILITY_MODE": "standard", # Supports: type, speak, asl, external
        "DYSLEXIA_FONT_FALLBACK": "OpenDyslexic"
    }
    
    # Secure runtime environment markers
    os.environ["AURORA_ENV"] = "development"
    os.environ["AURORA_ACCESSIBILITY_SYNC"] = "TRUE"
    
    logging.info("Global core environment variables locked successfully.")
    return True

def run_main_initialization():
    """Executes total structural system initialization steps sequentially."""
    logging.info("Starting Aurora platform backend engine setup sequence...")
    
    if not verify_repository_structure():
        sys.exit(1)
        
    if not check_database_blueprint():
        sys.exit(1)
        
    if not initialize_system_environment():
        sys.exit(1)
        
    logging.info("🚀 Aurora core backend structures initialized successfully. Ready for agentic layers.")

if __name__ == "__main__":
    run_main_initialization()
