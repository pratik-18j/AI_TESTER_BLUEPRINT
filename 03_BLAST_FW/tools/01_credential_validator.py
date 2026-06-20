#!/usr/bin/env python3
"""
Tool 1: Credential Validator
Validates all environment variables are present and correctly formatted
"""

import os
import re
import sys
from pathlib import Path


def validate_credentials():
    """Validate all required environment variables"""
    
    print("=" * 70)
    print("CREDENTIAL VALIDATION")
    print("=" * 70)
    
    # Load .env file
    env_path = Path(__file__).parent.parent.parent / ".env"
    if not env_path.exists():
        print("❌ ERROR: .env file not found at", env_path)
        return False
    
    # Read .env
    from dotenv import load_dotenv
    load_dotenv(env_path)
    
    # Required variables
    required_vars = {
        "JIRA_EMAIL": "Jira email address",
        "JIRA_API_TOKEN": "Jira API token",
        "JIRA_BASE_URL": "Jira API base URL",
        "GROQ_API_KEY": "GROQ API key",
        "GROQ_MODEL": "GROQ model name"
    }
    
    all_valid = True
    
    for var_name, description in required_vars.items():
        value = os.getenv(var_name)
        
        print(f"\n{var_name}: {description}")
        
        if not value:
            print(f"  ❌ MISSING - {var_name} not found in .env")
            all_valid = False
            continue
        
        print(f"  ✓ Present - {len(value)} characters")
        
        # Validate format
        if var_name == "JIRA_EMAIL":
            if not re.match(r'^[^@]+@[^@]+\.[^@]+$', value):
                print(f"  ❌ INVALID FORMAT - Email should contain @")
                all_valid = False
            else:
                print(f"  ✓ Format - Valid email format")
                print(f"    Value: {value}")
        
        elif var_name == "JIRA_API_TOKEN":
            if len(value) < 10:
                print(f"  ❌ INVALID - Token too short (< 10 chars)")
                all_valid = False
            else:
                print(f"  ✓ Format - Token length OK")
                print(f"    Masked: {'*' * (len(value) - 10)}...{value[-10:]}")
        
        elif var_name == "JIRA_BASE_URL":
            if not value.startswith("https://"):
                print(f"  ❌ INVALID - Should use HTTPS")
                all_valid = False
            else:
                print(f"  ✓ Format - HTTPS protocol OK")
                print(f"    Value: {value}")
        
        elif var_name == "GROQ_API_KEY":
            if len(value) < 10:
                print(f"  ❌ INVALID - Key too short")
                all_valid = False
            else:
                print(f"  ✓ Format - Key length OK")
                print(f"    Masked: {'*' * (len(value) - 8)}...{value[-8:]}")
        
        elif var_name == "GROQ_MODEL":
            if not value:
                print(f"  ❌ INVALID - Model cannot be empty")
                all_valid = False
            else:
                print(f"  ✓ Format - Model name OK")
                print(f"    Value: {value}")
    
    print("\n" + "=" * 70)
    if all_valid:
        print("✅ ALL CREDENTIALS VALID")
        print("Ready to proceed to connectivity tests")
        return True
    else:
        print("❌ CREDENTIAL VALIDATION FAILED")
        print("Please fix the issues above in .env file")
        return False


if __name__ == "__main__":
    # Install dotenv if needed
    try:
        from dotenv import load_dotenv
    except ImportError:
        print("Installing python-dotenv...")
        os.system("pip install python-dotenv -q")
        from dotenv import load_dotenv
    
    success = validate_credentials()
    sys.exit(0 if success else 1)
