import os
import requests
from dotenv import load_dotenv
import json
import base64

# Load environment variables from .env file
load_dotenv()

# Retrieve Jira credentials
jira_api_token = os.getenv('JIRA_API_TOKEN')
jira_email = os.getenv('JIRA_EMAIL')
jira_base_url = os.getenv('JIRA_BASE_URL')

print("=" * 70)
print("JIRA API TOKEN INTEGRATION VERIFICATION")
print("=" * 70)

# Validate that all required environment variables are set
if not jira_api_token or not jira_email or not jira_base_url:
    print("❌ ERROR: Missing Jira environment variables")
    if not jira_api_token:
        print("   - JIRA_API_TOKEN is missing")
    if not jira_email:
        print("   - JIRA_EMAIL is missing")
    if not jira_base_url:
        print("   - JIRA_BASE_URL is missing")
    exit(1)

print("\n✓ Environment variables loaded successfully")
print(f"   Email: {jira_email}")
print(f"   Base URL: {jira_base_url}")
print(f"   API Token: {'*' * (len(jira_api_token) - 10)}...{jira_api_token[-10:]}")

# Initialize Jira connection with Basic Authentication
# Atlassian Cloud APIs require Basic Auth: base64(email:api_token)
auth_string = f'{jira_email.strip()}:{jira_api_token.strip()}'
auth_bytes = base64.b64encode(auth_string.encode('utf-8')).decode('utf-8')

headers = {
    'Authorization': f'Basic {auth_bytes}',
    'Accept': 'application/json',
    'Content-Type': 'application/json'
}

print("\n" + "=" * 70)
print("TESTING CONNECTION TO JIRA API")
print("=" * 70)

try:
    # Endpoint to get current authenticated user's profile
    user_profile_url = f'{jira_base_url}/rest/api/3/myself'
    
    print(f"\nConnecting to: {user_profile_url}")
    
    # Make the API request
    response = requests.get(user_profile_url, headers=headers, timeout=10)
    
    print(f"HTTP Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("\n✅ CONNECTION SUCCESSFUL!")
        print("\nAuthenticated User Profile Information:")
        print("-" * 70)
        
        user_data = response.json()
        
        # Extract and display relevant user information
        user_profile = {
            'Account ID': user_data.get('accountId'),
            'Email Address': user_data.get('emailAddress'),
            'Display Name': user_data.get('displayName'),
            'Active': user_data.get('active'),
            'Account Type': user_data.get('accountType'),
            'Time Zone': user_data.get('timeZone'),
            'Locale': user_data.get('locale'),
        }
        
        for key, value in user_profile.items():
            print(f"   {key}: {value}")
        
        print("\n✅ API TOKEN INTEGRATION IS FULLY FUNCTIONAL")
        print("\nFull User Profile Response (JSON):")
        print("-" * 70)
        print(json.dumps(user_data, indent=2))
        
    elif response.status_code == 401:
        print("\n❌ AUTHENTICATION FAILED - UNAUTHORIZED")
        print("   Issue: Invalid API token or email")
        print(f"   Response: {response.text}")
        
    elif response.status_code == 403:
        print("\n❌ PERMISSION DENIED - FORBIDDEN")
        print("   Issue: Token doesn't have permission to access this resource")
        print(f"   Response: {response.text}")
        
    else:
        print(f"\n❌ REQUEST FAILED - HTTP {response.status_code}")
        print(f"   Response: {response.text}")
        
except requests.exceptions.Timeout:
    print("\n❌ CONNECTION TIMEOUT")
    print("   Issue: Request took too long to complete")
    print("   Check your internet connection and the Jira URL")
    
except requests.exceptions.ConnectionError:
    print("\n❌ CONNECTION ERROR")
    print("   Issue: Unable to reach the Jira server")
    print("   Check the JIRA_BASE_URL and your internet connection")
    
except Exception as e:
    print(f"\n❌ UNEXPECTED ERROR: {str(e)}")
    print(f"   Exception Type: {type(e).__name__}")

print("\n" + "=" * 70)
