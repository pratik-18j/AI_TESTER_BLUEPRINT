# SOP: Jira API Integration

## Goal
Fetch Jira issue details by issue key using Basic Auth, validate API connectivity, and extract issue metadata for test plan generation.

## Inputs
```json
{
  "jira_issue_id": "string (e.g., VWO-5)",
  "jira_email": "string from env",
  "jira_api_token": "string from env",
  "jira_base_url": "string from env"
}
```

## Outputs
```json
{
  "success": true,
  "data": {
    "key": "VWO-5",
    "summary": "Issue title",
    "description": "Full description",
    "status": "To Do",
    "priority": "High",
    "type": "Feature",
    "created": "2026-06-01T10:00:00Z",
    "assignee": {"name": "John", "emailAddress": "john@example.com"}
  },
  "error": null
}
```

## Logic Flow

### Step 1: Credential Validation
- Check if JIRA_EMAIL, JIRA_API_TOKEN, JIRA_BASE_URL are non-empty
- Validate email format: `@` present
- Validate token length > 10 characters
- Validate base_url: starts with https://

**Error Handling:**
- Missing credentials → Return 400 (Bad Request)
- Invalid format → Return 400 with specific field error

### Step 2: Build Auth Header
- Combine: `{email}:{token}`
- Base64 encode the string
- Create header: `Authorization: Basic {base64_string}`

**Error Handling:**
- Encoding failure → Log and return 500

### Step 3: Build API Request
- Endpoint: `{base_url}/rest/api/3/issues/{issue_key}`
- Headers:
  - `Authorization: Basic {auth_header}`
  - `Accept: application/json`
  - `Content-Type: application/json`
- Method: GET
- Timeout: 10 seconds

### Step 4: Execute Request
- Call Jira API
- Handle response codes:
  - **200**: Success → Parse and return JSON
  - **401**: Unauthorized → Invalid credentials
  - **403**: Forbidden → Token lacks permissions
  - **404**: Not Found → Invalid issue key
  - **Timeout**: > 10s → Retry once (max 2 attempts)

### Step 5: Parse Response
- Extract key fields:
  - key, summary, description, status, priority, type
  - created, updated, assignee
- Validate all fields present (non-null)
- Return structured JSON

**Error Handling:**
- Missing fields → Log and return partial data
- Malformed JSON → Return 500

## Edge Cases
- Issue key case sensitivity: "VWO-5" vs "vwo-5" → Normalize to uppercase
- Empty description → Return empty string, not null
- Assignee unassigned → Return null for assignee
- Very long description (>5000 chars) → Truncate to 5000
- Special characters in summary → Keep as-is, let UI handle encoding

## Success Criteria
✓ Response contains issue key and summary
✓ Response time < 5 seconds
✓ Error messages are user-friendly
✓ Credentials never logged or exposed

## Testing Checklist
- [ ] Valid issue key returns correct data
- [ ] Invalid issue key returns 404 error
- [ ] Invalid credentials return 401 error
- [ ] Missing credentials return validation error
- [ ] Timeout after 10s
- [ ] Case-insensitive issue key handling
- [ ] Special characters in description preserved
