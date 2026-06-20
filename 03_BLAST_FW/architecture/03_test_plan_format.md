# SOP: Test Plan Markdown Format

## Goal
Convert generated test cases into a professional, well-formatted Markdown document suitable for sharing, printing, and automation framework integration.

## Input
```json
{
  "jira_issue": {
    "key": "VWO-5",
    "summary": "string",
    "description": "string",
    "status": "string",
    "priority": "string",
    "type": "string"
  },
  "test_cases": [
    {
      "test_id": "TC-JIRA-VWO5-001",
      "test_name": "string",
      "test_type": "Positive|Negative|Edge|Security|Performance",
      "priority": "string",
      "preconditions": "string",
      "steps": ["string"],
      "expected_result": "string",
      "severity": "string",
      "automation_ready": "boolean"
    }
  ],
  "generated_at": "ISO 8601 timestamp"
}
```

## Output Format

### Markdown Structure
```markdown
# Test Plan: [ISSUE_KEY] - [ISSUE_SUMMARY]

Generated on: [ISO_DATE] | Total Test Cases: [COUNT]

---

## Executive Summary

**Issue Details**
- **Issue Key**: VWO-5
- **Summary**: [Summary text]
- **Type**: [Feature/Bug/Story/Task]
- **Priority**: [Critical/High/Medium/Low]
- **Status**: [To Do/In Progress/Done]

**Description**
[Full issue description]

**Test Plan Scope**
This test plan covers [COUNT] comprehensive test cases covering:
- Positive scenarios (happy path)
- Negative scenarios (error handling)
- Edge cases (boundary conditions)
- Security scenarios (auth, permissions)
- Performance scenarios (load, response times)

---

## Test Coverage Summary

| Test Type | Count | Percentage | Examples |
|-----------|-------|------------|----------|
| Positive | XX | XX% | Successful operations, valid inputs |
| Negative | XX | XX% | Error handling, invalid inputs |
| Edge Cases | XX | XX% | Boundary conditions, special cases |
| Security | XX | XX% | Authentication, authorization |
| Performance | XX | XX% | Load testing, response times |

---

## Test Case Matrix

| ID | Test Name | Type | Priority | Severity | Automation Ready |
|----|-----------|------|----------|----------|------------------|
| TC-JIRA-VWO5-001 | [Name] | Positive | Critical | Blocker | ✅ |
| TC-JIRA-VWO5-002 | [Name] | Negative | High | High | ✅ |
| ... | ... | ... | ... | ... | ... |

---

## Detailed Test Cases

### TC-JIRA-VWO5-001: [Test Name]

**Type**: Positive | **Priority**: Critical | **Severity**: Blocker | **Automation Ready**: ✅

**Description**
[Brief description of what this test validates]

**Preconditions**
- User is logged in
- System is in state X
- Data setup: ...

**Test Steps**
1. Navigate to [page/component]
2. Click on [element]
3. Enter [input value]
4. Verify [assertion]
5. [Continue with numbered steps...]

**Expected Result**
- [First expected outcome]
- [Second expected outcome]
- [System should display/return...]

**Notes**
- Related to requirement: [if any]
- Dependencies: [if any]

---

### TC-JIRA-VWO5-002: [Test Name]

[Repeat same structure for each test case]

---

## Execution Guidelines

### Test Environment Setup
- Browser: Chrome/Firefox/Safari (specify versions)
- OS: Windows/Mac/Linux
- Database: Test data required: [list any]

### Pass/Fail Criteria
- Test passes if: All expected results achieved
- Test fails if: Any expected result not achieved
- Inconclusive if: Cannot determine due to environment issues

### Reporting
After execution, fill in:
- Actual Result: What actually happened
- Status: PASS / FAIL / SKIPPED
- Screenshots/Logs: Attach relevant evidence
- Defect ID: Link to bug if failed

---

## Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| [Risk] | [High/Med/Low] | [High/Med/Low] | [Action] |

---

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Lead | | | |
| Product Manager | | | |
| Tech Lead | | | |

---

*This test plan was auto-generated on [DATE] from Jira issue [ISSUE_KEY].*
*For updates, regenerate from the issue in the Jira Test Plan Generator.*
```

## Formatting Rules

### Headers
- Level 1 (#): Document title only
- Level 2 (##): Major sections
- Level 3 (###): Test case IDs
- Level 4 (####): Sub-sections (Type, Priority, etc)

### Tables
- Use standard markdown table syntax
- Align columns with pipes (|)
- Use `:---` for left align, `:---:` for center, `---:` for right

### Lists
- Use numbered lists (1. 2. 3.) for test steps
- Use bullet lists (-) for properties and descriptions
- Indent sub-items with 2-4 spaces

### Emphasis
- **Bold** for labels (Type, Priority, etc.)
- *Italic* for emphasis
- `Inline code` for technical terms, variable names
- > Blockquotes for important notes

### Special Characters
- ✅ for "Yes" / "Automation Ready"
- ❌ for "No" / "Not Recommended"
- → for process flow indicators
- → Links: [Text](URL) for external references

## Content Guidelines

### Test Names
- Be specific: "User can login with valid credentials" not just "Login test"
- Include expected outcome: "Verify error message displays for invalid password"
- Keep under 80 characters

### Preconditions
- List all setup required
- Assume tester is not familiar with system
- Include user role/permissions needed
- Specify test data values

### Test Steps
- Number each step clearly
- One action per step
- Use imperative tense: "Click", "Enter", "Verify"
- Include expected intermediate results
- Maximum 8 steps per test

### Expected Results
- Describe exact expected behavior
- Include UI changes, data changes, messages
- Use "should" statements: "System should display..."
- Be verifiable and measurable

## Edge Cases in Formatting

- **Long text**: If test step > 100 chars, break into substeps
- **Special characters**: Escape markdown chars with backslash (\)
- **Code blocks**: Use triple backticks for JSON/SQL examples
- **URLs**: Wrap in [text](url) format
- **File paths**: Use forward slashes (/) even on Windows

## Validation Checklist
✓ All headers properly formatted
✓ All tables have headers
✓ All code blocks have language specified
✓ No broken links
✓ Test IDs consistent and unique
✓ No empty sections
✓ Professional appearance
✓ Printable format (fits on page)
