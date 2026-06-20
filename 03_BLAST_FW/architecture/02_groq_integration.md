# SOP: GROQ API Integration (Test Plan Generation)

## Goal
Call GROQ API with a structured prompt to generate test cases from Jira issue details, parse JSON response, and return structured test cases.

## Inputs
```json
{
  "jira_issue_data": {
    "key": "VWO-5",
    "summary": "string",
    "description": "string",
    "priority": "string",
    "type": "string"
  },
  "test_case_count": "integer (5-20)",
  "include_security_cases": "boolean",
  "include_performance_cases": "boolean",
  "groq_api_key": "string from env",
  "groq_model": "string from env"
}
```

## Outputs
```json
{
  "success": true,
  "data": [
    {
      "test_id": "TC-JIRA-VWO5-001",
      "test_name": "string",
      "test_type": "Positive|Negative|Edge|Security|Performance",
      "priority": "Critical|High|Medium|Low",
      "preconditions": "string",
      "steps": ["step1", "step2", "step3"],
      "expected_result": "string",
      "severity": "Blocker|High|Medium|Low",
      "automation_ready": true
    }
  ],
  "error": null
}
```

## Logic Flow

### Step 1: Build Prompt
Create a detailed prompt that includes:

**Prompt Structure:**
```
You are a QA expert. Generate test cases for the following Jira issue:

Issue Key: VWO-5
Summary: {summary}
Description: {description}
Priority: {priority}
Type: {type}

Requirements:
1. Generate exactly {test_case_count} test cases
2. Mix of types: 40% Positive, 30% Negative, 20% Edge, 10% Security/Performance
3. Each test case must be automation-ready
4. Include security test cases: {include_security_cases}
5. Include performance test cases: {include_performance_cases}

Return ONLY valid JSON array (no markdown, no extra text):
[
  {
    "test_id": "TC-JIRA-VWO5-001",
    "test_name": "string",
    "test_type": "Positive|Negative|Edge|Security|Performance",
    "priority": "Critical|High|Medium|Low",
    "preconditions": "string",
    "steps": ["step1", "step2", "step3"],
    "expected_result": "string",
    "severity": "Blocker|High|Medium|Low",
    "automation_ready": true
  }
]
```

### Step 2: Call GROQ API
- Endpoint: `https://api.groq.com/openai/v1/chat/completions`
- Method: POST
- Headers:
  - `Authorization: Bearer {groq_api_key}`
  - `Content-Type: application/json`
- Timeout: 30 seconds (LLM can be slow)
- Body:
  ```json
  {
    "model": "{groq_model}",
    "messages": [
      {
        "role": "user",
        "content": "{prompt}"
      }
    ],
    "temperature": 0.5,
    "max_tokens": 4000
  }
  ```

### Step 3: Handle Response
- Status codes:
  - **200**: Success → Extract content
  - **401**: Unauthorized → Invalid API key
  - **429**: Rate Limited → Wait and retry (max 3 attempts, exponential backoff)
  - **500+**: Server Error → Retry once
  - **Timeout**: > 30s → Retry once (max 2 attempts)

### Step 4: Parse JSON Response
- Extract `response.choices[0].message.content`
- Clean up markdown formatting (remove ``` wrappers if present)
- Parse as JSON array
- Validate each test case object:
  - Required fields: test_id, test_name, test_type, priority, steps, expected_result
  - Array steps must have 3-7 elements
  - Types must be in allowed list

**Error Handling:**
- Invalid JSON → Log error, attempt cleanup
- Missing fields → Log and skip malformed cases
- Wrong array size → Truncate or rerun if < 3 cases

### Step 5: Transform Output
- Add issue_key to each test case
- Ensure test_id is unique and sequential
- Normalize priority/severity values
- Return array of validated test cases

## Edge Cases
- GROQ returns markdown-wrapped JSON → Strip ``` and parse
- Fewer than requested test cases → Still return what we have
- Duplicate test names → Deduplicate by appending suffix
- Very long step descriptions → Truncate to 200 chars
- Missing steps array → Treat as single step

## Rate Limiting Strategy
- On 429 error:
  - Wait 2 seconds before first retry
  - Wait 5 seconds before second retry
  - Wait 10 seconds before third retry
  - Fail if all 3 retries exhausted

## Success Criteria
✓ Response contains array of test cases
✓ Each test case has required fields
✓ Test IDs are unique and formatted correctly
✓ Steps are actionable and testable
✓ Generation time < 30 seconds
✓ API key never logged or exposed

## Testing Checklist
- [ ] Valid issue generates test cases
- [ ] Test case count matches requested count (±1 due to LLM)
- [ ] All test IDs are unique
- [ ] Steps array has 3-7 elements each
- [ ] Invalid API key returns 401 error
- [ ] Rate limit (429) triggers retry logic
- [ ] Markdown-wrapped JSON is parsed correctly
- [ ] Performance/security cases included when requested
