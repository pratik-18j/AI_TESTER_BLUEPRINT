#!/usr/bin/env python3
"""
Tool: Markdown Formatter
Converts test cases to professional Markdown format
Part of Layer 3: Tools (Deterministic, Atomic, Testable)
"""

import json
import argparse
from datetime import datetime
from typing import Dict, Any, List


class MarkdownFormatter:
    """Format test cases as Markdown"""
    
    @staticmethod
    def format_test_plan(
        issue_data: Dict[str, Any],
        test_cases: List[Dict[str, Any]],
        generated_at: str = None
    ) -> str:
        """Format complete test plan as Markdown"""
        
        generated_at = generated_at or datetime.now().isoformat()
        
        # Build markdown
        md = []
        
        # Header
        md.append(f"# Test Plan: {issue_data.get('key')} - {issue_data.get('summary')}")
        md.append("")
        md.append(f"Generated on: {generated_at} | Total Test Cases: {len(test_cases)}")
        md.append("")
        md.append("---")
        md.append("")
        
        # Executive Summary
        md.append("## Executive Summary")
        md.append("")
        md.append("**Issue Details**")
        md.append(f"- **Issue Key**: {issue_data.get('key')}")
        md.append(f"- **Summary**: {issue_data.get('summary')}")
        md.append(f"- **Type**: {issue_data.get('type')}")
        md.append(f"- **Priority**: {issue_data.get('priority')}")
        md.append(f"- **Status**: {issue_data.get('status')}")
        md.append("")
        md.append("**Description**")
        md.append(f"{issue_data.get('description', 'N/A')}")
        md.append("")
        
        # Test Coverage Summary
        md.append("**Test Coverage Summary**")
        md.append("")
        coverage = MarkdownFormatter._calculate_coverage(test_cases)
        md.append("| Test Type | Count | Percentage |")
        md.append("|-----------|-------|-----------|")
        for test_type, count in coverage.items():
            pct = int((count / len(test_cases) * 100)) if test_cases else 0
            md.append(f"| {test_type} | {count} | {pct}% |")
        md.append("")
        md.append("---")
        md.append("")
        
        # Test Case Matrix
        md.append("## Test Case Matrix")
        md.append("")
        md.append("| ID | Test Name | Type | Priority | Severity | Automation |")
        md.append("|---|-----------|------|----------|----------|-----------|")
        for tc in test_cases:
            auto = "✅" if tc.get("automation_ready") else "❌"
            md.append(
                f"| {tc.get('test_id')} | {tc.get('test_name', 'N/A')[:50]} | "
                f"{tc.get('test_type', 'N/A')} | {tc.get('priority', 'N/A')} | "
                f"{tc.get('severity', 'N/A')} | {auto} |"
            )
        md.append("")
        md.append("---")
        md.append("")
        
        # Detailed Test Cases
        md.append("## Detailed Test Cases")
        md.append("")
        for tc in test_cases:
            md.extend(MarkdownFormatter._format_test_case(tc))
            md.append("")
        
        # Footer
        md.append("---")
        md.append("")
        md.append(f"*Generated: {generated_at}*")
        
        return "\n".join(md)
    
    @staticmethod
    def _format_test_case(test_case: Dict[str, Any]) -> List[str]:
        """Format individual test case"""
        md = []
        
        md.append(f"### {test_case.get('test_id')}: {test_case.get('test_name', 'N/A')}")
        md.append("")
        md.append(f"**Type**: {test_case.get('test_type', 'N/A')} | "
                  f"**Priority**: {test_case.get('priority', 'N/A')} | "
                  f"**Severity**: {test_case.get('severity', 'N/A')} | "
                  f"**Automation Ready**: {'✅' if test_case.get('automation_ready') else '❌'}")
        md.append("")
        
        if test_case.get("preconditions"):
            md.append("**Preconditions**")
            md.append(f"{test_case.get('preconditions')}")
            md.append("")
        
        if test_case.get("steps"):
            md.append("**Test Steps**")
            for i, step in enumerate(test_case.get("steps", []), 1):
                md.append(f"{i}. {step}")
            md.append("")
        
        if test_case.get("expected_result"):
            md.append("**Expected Result**")
            md.append(f"{test_case.get('expected_result')}")
            md.append("")
        
        return md
    
    @staticmethod
    def _calculate_coverage(test_cases: List[Dict]) -> Dict[str, int]:
        """Calculate test type distribution"""
        coverage = {
            "Positive": 0,
            "Negative": 0,
            "Edge": 0,
            "Security": 0,
            "Performance": 0
        }
        
        for tc in test_cases:
            test_type = tc.get("test_type", "").lower()
            for key in coverage:
                if key.lower() in test_type:
                    coverage[key] += 1
                    break
        
        return coverage


def main():
    """CLI interface"""
    parser = argparse.ArgumentParser(description="Format test plan as Markdown")
    parser.add_argument("issue_json", help="Jira issue JSON data")
    parser.add_argument("test_cases_json", help="Test cases JSON array")
    parser.add_argument("--output", help="Output file (default: stdout)")
    
    args = parser.parse_args()
    
    try:
        issue_data = json.loads(args.issue_json)
        test_cases = json.loads(args.test_cases_json)
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON: {e}")
        return 1
    
    formatter = MarkdownFormatter()
    markdown = formatter.format_test_plan(issue_data, test_cases)
    
    if args.output:
        with open(args.output, "w") as f:
            f.write(markdown)
        print(f"✅ Markdown written to {args.output}")
    else:
        print(markdown)
    
    return 0


if __name__ == "__main__":
    main()
