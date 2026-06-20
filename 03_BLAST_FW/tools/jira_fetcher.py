#!/usr/bin/env python3
"""
Tool: Complete Jira Issue Fetcher
Fetches issue details from Jira and returns structured data
Part of Layer 3: Tools (Deterministic, Atomic, Testable)
"""

import os
import sys
import json
import base64
import argparse
import requests
from pathlib import Path
from typing import Dict, Any, Optional
from dotenv import load_dotenv


class JiraFetcher:
    """Deterministic Jira API client"""
    
    def __init__(self):
        """Initialize with credentials from .env"""
        env_path = Path(__file__).parent.parent.parent / ".env"
        load_dotenv(env_path)
        
        self.email = os.getenv("JIRA_EMAIL", "").strip()
        self.token = os.getenv("JIRA_API_TOKEN", "").strip()
        self.base_url = os.getenv("JIRA_BASE_URL", "").strip()
        self.timeout = 10
    
    def validate_credentials(self) -> bool:
        """Validate credentials are present"""
        return bool(self.email and self.token and self.base_url)
    
    def build_auth_header(self) -> str:
        """Build Basic Auth header"""
        auth_string = f"{self.email}:{self.token}"
        auth_bytes = base64.b64encode(auth_string.encode("utf-8")).decode("utf-8")
        return f"Basic {auth_bytes}"
    
    def fetch_issue(self, issue_key: str) -> Dict[str, Any]:
        """
        Fetch issue from Jira
        Returns: {success: bool, data: dict, error: str}
        """
        
        # Normalize issue key
        issue_key = issue_key.strip().upper()
        
        # Validate format
        if not self._validate_issue_key(issue_key):
            return {
                "success": False,
                "data": None,
                "error": f"Invalid issue key format: {issue_key}. Expected format: PROJECT-123"
            }
        
        # Validate credentials
        if not self.validate_credentials():
            return {
                "success": False,
                "data": None,
                "error": "Missing Jira credentials in .env file"
            }
        
        # Build request
        url = f"{self.base_url}/rest/api/3/issues/{issue_key}"
        headers = {
            "Authorization": self.build_auth_header(),
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
        
        # Make request
        try:
            response = requests.get(url, headers=headers, timeout=self.timeout)
        except requests.exceptions.Timeout:
            return {
                "success": False,
                "data": None,
                "error": "Request timed out (> 10s)"
            }
        except requests.exceptions.ConnectionError as e:
            return {
                "success": False,
                "data": None,
                "error": f"Connection error: {str(e)}"
            }
        
        # Handle response
        if response.status_code == 200:
            try:
                data = response.json()
                issue_data = self._extract_issue_data(data)
                return {
                    "success": True,
                    "data": issue_data,
                    "error": None
                }
            except json.JSONDecodeError:
                return {
                    "success": False,
                    "data": None,
                    "error": "Invalid JSON response from Jira"
                }
        
        elif response.status_code == 401:
            return {
                "success": False,
                "data": None,
                "error": "Authentication failed: Invalid credentials"
            }
        
        elif response.status_code == 403:
            return {
                "success": False,
                "data": None,
                "error": "Permission denied: Insufficient access"
            }
        
        elif response.status_code == 404:
            return {
                "success": False,
                "data": None,
                "error": f"Issue not found: {issue_key}"
            }
        
        else:
            return {
                "success": False,
                "data": None,
                "error": f"HTTP error {response.status_code}"
            }
    
    @staticmethod
    def _validate_issue_key(issue_key: str) -> bool:
        """Validate issue key format"""
        import re
        return bool(re.match(r"^[A-Z]+-\d+$", issue_key))
    
    @staticmethod
    def _extract_issue_data(jira_data: Dict) -> Dict[str, Any]:
        """Extract relevant fields from Jira response"""
        return {
            "key": jira_data.get("key"),
            "summary": jira_data.get("summary"),
            "description": jira_data.get("description", ""),
            "status": jira_data.get("status", {}).get("name"),
            "priority": jira_data.get("priority", {}).get("name"),
            "type": jira_data.get("type", {}).get("name"),
            "created": jira_data.get("created"),
            "updated": jira_data.get("updated"),
            "assignee": jira_data.get("assignee", {}).get("displayName") if jira_data.get("assignee") else None
        }


def main():
    """CLI interface"""
    parser = argparse.ArgumentParser(description="Fetch Jira issue details")
    parser.add_argument("issue_key", help="Issue key (e.g., VWO-5)")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    
    args = parser.parse_args()
    
    fetcher = JiraFetcher()
    result = fetcher.fetch_issue(args.issue_key)
    
    if args.json:
        print(json.dumps(result, indent=2))
    else:
        if result["success"]:
            print("✅ Issue fetched successfully")
            print(json.dumps(result["data"], indent=2))
        else:
            print(f"❌ Error: {result['error']}")
            sys.exit(1)


if __name__ == "__main__":
    try:
        import requests
        from dotenv import load_dotenv
    except ImportError:
        os.system("pip install requests python-dotenv -q")
    
    main()
