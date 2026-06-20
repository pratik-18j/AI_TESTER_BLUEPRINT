# SOP: Error Handling & Edge Cases

## Goal
Define all error scenarios, recovery strategies, and user-friendly error messages for the Jira Test Plan Generator app.

## Error Categories

### Category 1: Credential Errors

#### 1.1 Missing Credentials
**Trigger**: App loads without .env variables
**HTTP Code**: 400
**User Message**: "Configuration Error: Missing Jira/GROQ credentials. Please verify .env file contains JIRA_API_TOKEN, JIRA_EMAIL, JIRA_BASE_URL, GROQ_API_KEY"
**Recovery**: Show setup guide link
**Logging**: Log which credentials are missing (not values)

#### 1.2 Invalid Credential Format
**Trigger**: Email not valid format or token too short
**HTTP Code**: 400
**User Message**: "Configuration Error: [JIRA_EMAIL looks invalid (missing @)] OR [JIRA_API_TOKEN appears too short]"
**Recovery**: Provide credential format requirements
**Logging**: Log validation failure point

#### 1.3 Credential Validation Failed
**Trigger**: Jira API returns 401
**HTTP Code**: 401
**User Message**: "Authentication Failed: Unable to authenticate with Jira. Please verify your email and API token are correct."
**Recovery**: Provide link to generate new API token
**Logging**: Log error response from Jira (sanitized)

---

### Category 2: Jira API Errors

#### 2.1 Invalid Issue Key Format
**Trigger**: User enters "12345" or "invalid-format"
**HTTP Code**: 400
**User Message**: "Invalid Issue Key Format: Issue key should be in format PROJECT-123 (e.g., VWO-5)"
**Recovery**: Show example format, enable validation on input field
**Logging**: Log the invalid input (sanitized)

#### 2.2 Issue Not Found
**Trigger**: Jira API returns 404
**HTTP Code**: 404
**User Message**: "Issue Not Found: The issue '[ISSUE_KEY]' does not exist or you don't have permission to view it. Please check the issue key."
**Recovery**: Suggest common issues, link to Jira search
**Logging**: Log the issue key attempted (safe to log)

#### 2.3 Permission Denied
**Trigger**: Jira API returns 403
**HTTP Code**: 403
**User Message**: "Permission Denied: Your API token doesn't have permission to access this issue. Please verify your Jira permissions."
**Recovery**: Provide admin contact info
**Logging**: Log 403 response (sanitized)

#### 2.4 Jira API Timeout
**Trigger**: Request takes > 10 seconds
**HTTP Code**: 504
**User Message**: "Connection Timeout: Jira is taking too long to respond. Retrying... (Attempt X/2)"
**Recovery**: Auto-retry once, then show retry button
**Logging**: Log timeout attempt count

#### 2.5 Jira API Server Error
**Trigger**: Jira API returns 500+
**HTTP Code**: 502
**User Message**: "Jira Service Error: Jira is experiencing issues (HTTP 500). Please try again in a moment."
**Recovery**: Show retry button, suggest trying later
**Logging**: Log HTTP status code

#### 2.6 Invalid JSON Response from Jira
**Trigger**: Jira returns non-JSON response
**HTTP Code**: 502
**User Message**: "Jira Response Error: Received invalid response format from Jira. Please try again."
**Recovery**: Show retry button
**Logging**: Log first 500 chars of response for debugging

---

### Category 3: GROQ API Errors

#### 3.1 Invalid API Key
**Trigger**: GROQ API returns 401
**HTTP Code**: 401
**User Message**: "GROQ Authentication Failed: Invalid API key. Please verify GROQ_API_KEY in .env file."
**Recovery**: Provide link to generate new GROQ API key
**Logging**: Log 401 status (do NOT log key)

#### 3.2 Rate Limited
**Trigger**: GROQ API returns 429
**HTTP Code**: 429
**User Message**: "Rate Limit Reached: GROQ API is rate-limited. Retrying in 5 seconds... (Attempt X/3)"
**Recovery**: Auto-retry with exponential backoff (2s, 5s, 10s)
**Logging**: Log retry attempts and delays

#### 3.3 GROQ API Timeout
**Trigger**: Request takes > 30 seconds
**HTTP Code**: 504
**User Message**: "Test Plan Generation Timeout: Taking longer than expected. Retrying... (Attempt X/2)"
**Recovery**: Auto-retry once, then show manual retry
**Logging**: Log timeout and retry count

#### 3.4 GROQ API Server Error
**Trigger**: GROQ API returns 500+
**HTTP Code**: 502
**User Message**: "GROQ Service Error: Test plan generation service is unavailable. Please try again later."
**Recovery**: Show retry button
**Logging**: Log HTTP status code

#### 3.5 Invalid JSON from GROQ
**Trigger**: GROQ returns non-JSON or malformed structure
**HTTP Code**: 502
**User Message**: "Invalid Test Plan Format: GROQ returned data in unexpected format. Attempting to parse..."
**Recovery**: Attempt JSON cleanup/parsing, partial results if possible
**Logging**: Log first 200 chars of response for debugging

#### 3.6 Missing Required Fields in Test Cases
**Trigger**: Test case missing test_id, steps, etc.
**HTTP Code**: 502
**User Message**: "Test Plan Validation Error: Some test cases are incomplete. Showing [X/Y] valid test cases."
**Recovery**: Display valid test cases, skip invalid ones
**Logging**: Log which fields were missing from which test cases

---

### Category 4: Network Errors

#### 4.1 No Internet Connection
**Trigger**: Network unreachable
**HTTP Code**: Network Error
**User Message**: "No Internet Connection: Unable to connect to Jira or GROQ APIs. Please check your internet connection."
**Recovery**: Show retry button when connection restored
**Logging**: Log network error type

#### 4.2 DNS Resolution Failure
**Trigger**: Cannot resolve api.atlassian.com or api.groq.com
**HTTP Code**: Network Error
**User Message**: "DNS Error: Unable to resolve Jira/GROQ server. Please check your internet and DNS settings."
**Recovery**: Show retry button
**Logging**: Log DNS error details

#### 4.3 SSL/TLS Certificate Error
**Trigger**: Certificate validation fails
**HTTP Code**: Security Error
**User Message**: "Security Error: SSL certificate validation failed. This may indicate a network security issue."
**Recovery**: Check corporate proxy, VPN settings
**Logging**: Log certificate error (sanitized)

---

### Category 5: Input Validation Errors

#### 5.1 Empty Issue Key
**Trigger**: User clicks "Generate" without entering issue key
**HTTP Code**: 400
**User Message**: "Please enter a Jira issue key (e.g., VWO-5)"
**Recovery**: Focus input field
**Logging**: No logging needed

#### 5.2 Test Case Count Out of Range
**Trigger**: User enters <5 or >20
**HTTP Code**: 400
**User Message**: "Test case count must be between 5 and 20. You entered: [X]"
**Recovery**: Reset to default (10) or suggest valid range
**Logging**: Log attempted value

#### 5.3 Non-numeric Test Case Count
**Trigger**: User enters "abc" for count
**HTTP Code**: 400
**User Message**: "Test case count must be a number (5-20)"
**Recovery**: Clear field, show error
**Logging**: Log invalid input type

---

### Category 6: Data Processing Errors

#### 6.1 Empty Test Case Array from GROQ
**Trigger**: GROQ returns valid JSON but empty array
**HTTP Code**: 502
**User Message**: "Test Plan Generation Failed: GROQ did not generate any test cases. Please try again or check issue description."
**Recovery**: Show retry button, suggest simplifying issue description
**Logging**: Log empty response from GROQ

#### 6.2 Issue Description Too Long
**Trigger**: Description > 5000 characters
**HTTP Code**: 400
**User Message**: "Issue description is very long. Truncating to first 5000 characters for test plan generation."
**Recovery**: Proceed with truncated description
**Logging**: Log truncation (original length only, not content)

#### 6.3 Special Characters Breaking Markdown
**Trigger**: Test case contains unescaped markdown
**HTTP Code**: N/A
**User Message**: No user message (silently escape)
**Recovery**: Auto-escape special markdown characters
**Logging**: Log escaped characters count

---

## Retry Strategy

### Transient Errors (Retry)
- Network timeouts: Retry immediately (max 2 attempts)
- Rate limits (429): Retry with exponential backoff (max 3 attempts)
- GROQ timeouts: Retry immediately (max 2 attempts)

### Permanent Errors (Don't Retry)
- 401 Unauthorized: Invalid credentials
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Invalid issue key
- Format validation errors

### Circuit Breaker Pattern
- After 3 consecutive failures to same endpoint: Disable that endpoint for 5 minutes
- Show message: "Service temporarily unavailable. Try again later."

---

## Error Logging Format

```
[TIMESTAMP] [LEVEL] [COMPONENT] [ERROR_CODE] [MESSAGE] [DETAILS]

Examples:
[2026-06-20T10:15:30Z] ERROR [JIRA_FETCHER] JIRA_401 Authentication failed email=[masked] attempt=1
[2026-06-20T10:15:35Z] WARN [GROQ_GENERATOR] GROQ_429 Rate limited, retrying in 5s attempt=2/3
[2026-06-20T10:15:40Z] ERROR [MARKDOWN_FORMATTER] INVALID_JSON Cannot parse GROQ response: first_100_chars=[...]
```

### Logging Rules
- ❌ Never log: Passwords, API keys, Full email addresses
- ✅ Always log: Error codes, HTTP status, attempt counts, timestamps
- ✅ Sanitize: Mask email addresses, truncate sensitive data
- ✅ Store logs locally (not sent to external services)

---

## User-Facing Error Recovery Flow

```
Error Detected
    ↓
[Determine Error Type]
    ↓
[Transient?] → YES → Show "Retrying..." + Auto-retry
    ↓ NO
[Can Recover?] → YES → Show "Fixing issue..." + Offer recovery option
    ↓ NO
[Show User-Friendly Message]
    ↓
[Offer Manual Retry Button]
    ↓
[Log Full Error for Debugging]
```

---

## Testing Checklist

- [ ] Missing credentials shows helpful setup guide
- [ ] Invalid issue key shows format requirements
- [ ] Issue not found shows search suggestion
- [ ] Network timeout triggers auto-retry
- [ ] Rate limit triggers exponential backoff retry
- [ ] GROQ malformed response gracefully handled
- [ ] All error messages are user-friendly (no stack traces)
- [ ] Partial results shown when possible
- [ ] Retry button always available for transient errors
- [ ] No sensitive data in error messages or logs
