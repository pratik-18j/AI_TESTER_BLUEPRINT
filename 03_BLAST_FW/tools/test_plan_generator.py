#!/usr/bin/env python3
"""
Tool: GROQ Test Plan Generator
Generates test cases using GROQ LLM based on Jira issue details
Part of Layer 3: Tools (Deterministic, Atomic, Testable)
"""

import os
import sys
import json
import argparse
import requests
from pathlib import Path
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv


class TestPlanGenerator:
    """Deterministic GROQ-based test plan generator"""
    
    def __init__(self):
        """Initialize with GROQ credentials"""
        env_path = Path(__file__).parent.parent.parent / ".env"
        load_dotenv(env_path)
        
        self.api_key = os.getenv("GROQ_API_KEY", "").strip()
        self.model = os.getenv("GROQ_MODEL", "").strip()
        self.api_url = "https://api.groq.com/openai/v1/chat/completions"
        self.timeout = 30
        self.max_retries = 3
    
    def validate_credentials(self) -> bool:
        """Validate GROQ credentials"""
        return bool(self.api_key and self.model)
    
    def generate_test_plan(
        self, 
        issue_data: Dict[str, Any],
        test_count: int = 10,
        include_security: bool = True,
        include_performance: bool = True
    ) -> Dict[str, Any]:
        """
        Generate test cases from Jira issue
        Returns: {success: bool, data: list, error: str}
        """
        
        # Validate inputs
        if test_count < 5 or test_count > 20:
            return {
                "success": False,
                "data": None,
                "error": f"Test count must be between 5-20, got {test_count}"
            }
        
        if not self.validate_credentials():
            return {
                "success": False,
                "data": None,
                "error": "Missing GROQ credentials in .env file"
            }
        
        # Build prompt
        prompt = self._build_prompt(
            issue_data,
            test_count,
            include_security,
            include_performance
        )
        
        # Call GROQ API with retries
        for attempt in range(self.max_retries):
            result = self._call_groq(prompt)
            
            if result["success"]:
                # Parse and validate response
                test_cases = self._parse_response(result["data"])
                if test_cases:
                    return {
                        "success": True,
                        "data": test_cases,
                        "error": None
                    }
                else:
                    continue  # Retry
            elif "rate limit" in str(result.get("error", "")).lower():
                # Wait and retry on rate limit
                wait_time = 2 ** attempt
                continue
            else:
                # Permanent error
                return result
        
        return {
            "success": False,
            "data": None,
            "error": "Failed to generate test plan after multiple attempts"
        }
    
    def _build_prompt(
        self,
        issue_data: Dict,
        test_count: int,
        include_security: bool,
        include_performance: bool
    ) -> str:
        """Build GROQ prompt"""
        
        description = issue_data.get("description", "")[:5000]  # Truncate if too long
        
        prompt = f"""You are a QA expert. Generate comprehensive test cases for the following Jira issue:

**Issue Key**: {issue_data.get('key')}
**Summary**: {issue_data.get('summary')}
**Description**: {description}
**Type**: {issue_data.get('type')}
**Priority**: {issue_data.get('priority')}

Generate exactly {test_count} test cases following these rules:
1. Mix of test types: ~40% Positive, ~30% Negative, ~20% Edge Cases, ~10% Security/Performance
2. Include security test cases: {str(include_security)}
3. Include performance test cases: {str(include_performance)}
4. Each test case must be automation-ready
5. Use clear, actionable test steps

Return ONLY a valid JSON array (NO markdown formatting, NO extra text):
[
  {{
    "test_id": "TC-{issue_data.get('key')}-001",
    "test_name": "descriptive test name",
    "test_type": "Positive|Negative|Edge|Security|Performance",
    "priority": "Critical|High|Medium|Low",
    "preconditions": "what needs to be true before the test",
    "steps": ["step 1", "step 2", "step 3"],
    "expected_result": "what should happen if test passes",
    "severity": "Blocker|High|Medium|Low",
    "automation_ready": true
  }}
]"""
        
        return prompt
    
    def _call_groq(self, prompt: str) -> Dict[str, Any]:
        """Call GROQ API"""
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.5,
            "max_tokens": 4000
        }
        
        try:
            response = requests.post(
                self.api_url,
                headers=headers,
                json=payload,
                timeout=self.timeout
            )
        except requests.exceptions.Timeout:
            return {
                "success": False,
                "data": None,
                "error": "Request timed out"
            }
        except requests.exceptions.ConnectionError as e:
            return {
                "success": False,
                "data": None,
                "error": f"Connection error: {str(e)}"
            }
        
        if response.status_code == 200:
            try:
                data = response.json()
                content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                return {
                    "success": True,
                    "data": content,
                    "error": None
                }
            except json.JSONDecodeError:
                return {
                    "success": False,
                    "data": None,
                    "error": "Invalid JSON from GROQ"
                }
        
        elif response.status_code == 401:
            return {
                "success": False,
                "data": None,
                "error": "Invalid GROQ API key"
            }
        
        elif response.status_code == 429:
            return {
                "success": False,
                "data": None,
                "error": "GROQ rate limit exceeded"
            }
        
        else:
            return {
                "success": False,
                "data": None,
                "error": f"GROQ API error {response.status_code}"
            }
    
    def _parse_response(self, content: str) -> Optional[List[Dict]]:
        """Parse GROQ response"""
        
        # Clean markdown formatting if present
        content = content.strip()
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        
        try:
            test_cases = json.loads(content)
            
            # Validate structure
            if not isinstance(test_cases, list):
                return None
            
            # Ensure each test case has required fields
            valid_cases = []
            for i, tc in enumerate(test_cases):
                if all(k in tc for k in ["test_name", "test_type", "steps", "expected_result"]):
                    # Ensure test_id is properly formatted
                    if "test_id" not in tc:
                        tc["test_id"] = f"TC-AUTO-{str(i+1).zfill(3)}"
                    valid_cases.append(tc)
            
            return valid_cases if valid_cases else None
        
        except json.JSONDecodeError:
            return None


def main():
    """CLI interface"""
    parser = argparse.ArgumentParser(description="Generate test plan from Jira issue")
    parser.add_argument("issue_json", help="Jira issue JSON data")
    parser.add_argument("--count", type=int, default=10, help="Number of test cases (5-20)")
    parser.add_argument("--no-security", action="store_true", help="Exclude security tests")
    parser.add_argument("--no-performance", action="store_true", help="Exclude performance tests")
    
    args = parser.parse_args()
    
    try:
        issue_data = json.loads(args.issue_json)
    except json.JSONDecodeError:
        print("❌ Invalid JSON for issue data")
        sys.exit(1)
    
    generator = TestPlanGenerator()
    result = generator.generate_test_plan(
        issue_data,
        test_count=args.count,
        include_security=not args.no_security,
        include_performance=not args.no_performance
    )
    
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    try:
        import requests
        from dotenv import load_dotenv
    except ImportError:
        os.system("pip install requests python-dotenv -q")
    
    main()
