#!/usr/bin/env python3
"""
Tool 2b: Jira API Connectivity Test (User Profile)
Tests Jira API connection using /myself endpoint
"""

import os
import sys
import json
import base64
import requests
from pathlib import Path
from dotenv import load_dotenv


def test_jira_connection():
    """Test Jira API connection using /myself endpoint"""
    
    # Load credentials
    env_path = Path(__file__).parent.parent.parent / ".env"
    load_dotenv(env_path)
    
    jira_email = os.getenv("JIRA_EMAIL", "").strip()
    jira_token = os.getenv("JIRA_API_TOKEN", "").strip()
    jira_base_url = os.getenv("JIRA_BASE_URL", "").strip()
    
    print("=" * 70)
    print("JIRA API CONNECTION TEST (Profile Endpoint)")
    print("=" * 70)
    
    # Validate credentials
    print("\n1. Validating credentials...")
    if not jira_email or not jira_token or not jira_base_url:
        print("❌ Missing credentials")
        return False
    print("✓ Credentials present")
    
    # Build auth header
    print("\n2. Building authentication header...")
    auth_string = f"{jira_email}:{jira_token}"
    auth_bytes = base64.b64encode(auth_string.encode("utf-8")).decode("utf-8")
    print(f"✓ Auth header built (email: {jira_email})")
    
    # Build request
    print("\n3. Preparing API request...")
    url = f"{jira_base_url}/rest/api/3/myself"
    headers = {
        "Authorization": f"Basic {auth_bytes}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    print(f"✓ URL: {url}")
    
    # Make request
    print("\n4. Sending request...")
    try:
        response = requests.get(url, headers=headers, timeout=10)
        print(f"✓ Response received (HTTP {response.status_code})")
    except requests.exceptions.Timeout:
        print("❌ Request timed out")
        return False
    except requests.exceptions.ConnectionError as e:
        print(f"❌ Connection error: {e}")
        return False
    
    # Parse response
    print("\n5. Parsing response...")
    if response.status_code == 200:
        try:
            data = response.json()
            print("✓ Valid JSON response")
            
            # Extract key fields
            user_data = {
                "accountId": data.get("accountId"),
                "emailAddress": data.get("emailAddress"),
                "displayName": data.get("displayName"),
                "active": data.get("active"),
                "accountType": data.get("accountType"),
                "timeZone": data.get("timeZone"),
            }
            
            print("\n✅ JIRA CONNECTION SUCCESSFUL")
            print("\nAuthenticated User Profile:")
            print("-" * 70)
            print(json.dumps(user_data, indent=2))
            return True
            
        except json.JSONDecodeError:
            print("❌ Invalid JSON in response")
            return False
    
    elif response.status_code == 401:
        print("❌ Authentication failed (401)")
        print(f"   Response: {response.text}")
        return False
    
    elif response.status_code == 403:
        print("❌ Permission denied (403)")
        print(f"   Response: {response.text}")
        return False
    
    else:
        print(f"❌ Request failed (HTTP {response.status_code})")
        print(f"   Response: {response.text}")
        return False


def main():
    print("\n🔗 PHASE 2: LINK (Connectivity) - Jira API Test\n")
    
    success = test_jira_connection()
    
    print("\n" + "=" * 70)
    if success:
        print("✅ JIRA API IS CONNECTED AND WORKING")
        print("\n📝 Note: Use /rest/api/3/myself for authenticated requests")
        print("   Use /rest/api/3/issues/{key} for specific issue fetching")
    else:
        print("❌ JIRA API CONNECTION FAILED")
    print("=" * 70)
    
    return success


if __name__ == "__main__":
    # Install dependencies
    try:
        import requests
        from dotenv import load_dotenv
    except ImportError:
        print("Installing dependencies...")
        os.system("pip install requests python-dotenv -q")
    
    success = main()
    sys.exit(0 if success else 1)
