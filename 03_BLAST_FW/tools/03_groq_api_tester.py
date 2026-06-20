#!/usr/bin/env python3
"""
Tool 3: GROQ API Tester
Tests GROQ API connection and generates sample test cases
"""

import os
import sys
import json
import requests
from pathlib import Path
from dotenv import load_dotenv


def test_groq_api():
    """Test GROQ API connection"""
    
    # Load credentials
    env_path = Path(__file__).parent.parent.parent / ".env"
    load_dotenv(env_path)
    
    groq_api_key = os.getenv("GROQ_API_KEY", "").strip()
    groq_model = os.getenv("GROQ_MODEL", "").strip()
    
    print("=" * 70)
    print("GROQ API CONNECTION TEST")
    print("=" * 70)
    
    # Validate credentials
    print("\n1. Validating credentials...")
    if not groq_api_key or not groq_model:
        print("❌ Missing GROQ credentials")
        return False
    print("✓ Credentials present")
    print(f"   Model: {groq_model}")
    
    # Build request
    print("\n2. Preparing API request...")
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {groq_api_key}",
        "Content-Type": "application/json"
    }
    print(f"✓ URL: {url}")
    
    # Sample prompt
    payload = {
        "model": groq_model,
        "messages": [
            {
                "role": "user",
                "content": "Generate 2 test cases for a login feature. Return ONLY valid JSON array with fields: test_id, test_name, test_type, steps (array), expected_result. No markdown."
            }
        ],
        "temperature": 0.5,
        "max_tokens": 1000
    }
    
    # Make request
    print("\n3. Sending test request to GROQ API...")
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        print(f"✓ Response received (HTTP {response.status_code})")
    except requests.exceptions.Timeout:
        print("❌ Request timed out (30s)")
        return False
    except requests.exceptions.ConnectionError as e:
        print(f"❌ Connection error: {e}")
        return False
    
    # Parse response
    print("\n4. Parsing response...")
    if response.status_code == 200:
        try:
            data = response.json()
            message_content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            
            if not message_content:
                print("❌ Empty response from GROQ")
                return False
            
            print("✓ Valid JSON response")
            
            print("\n✅ GROQ API CONNECTION SUCCESSFUL")
            print("\nSample Response:")
            print("-" * 70)
            print(message_content[:500])
            if len(message_content) > 500:
                print(f"... (truncated, total {len(message_content)} chars)")
            
            return True
            
        except json.JSONDecodeError:
            print("❌ Invalid JSON in response")
            print(f"   Response: {response.text[:200]}")
            return False
    
    elif response.status_code == 401:
        print("❌ Authentication failed (401)")
        print("   Issue: Invalid or expired API key")
        return False
    
    elif response.status_code == 429:
        print("⚠️  Rate limited (429)")
        print("   Issue: GROQ API rate limit exceeded")
        print("   Will implement retry logic in production")
        return True  # Connection works, but rate limited
    
    elif response.status_code == 500:
        print("❌ GROQ server error (500)")
        print("   Issue: GROQ API is experiencing issues")
        return False
    
    else:
        print(f"❌ Request failed (HTTP {response.status_code})")
        print(f"   Response: {response.text[:200]}")
        return False


def main():
    print("\n🔗 PHASE 2: LINK (Connectivity) - GROQ API Test\n")
    
    success = test_groq_api()
    
    print("\n" + "=" * 70)
    if success:
        print("✅ GROQ API IS CONNECTED AND WORKING")
    else:
        print("❌ GROQ API CONNECTION FAILED")
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
