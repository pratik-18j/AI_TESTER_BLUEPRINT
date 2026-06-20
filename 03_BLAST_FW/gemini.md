# VWO-48 Test Plan Generator - Project Constitution (gemini.md)

**Project**: VWO-48 Digital Experience Optimization Platform - Test Plan Generation  
**Framework**: BLAST Protocol 0 - Project Constitution  
**Date**: June 17, 2026

---

## I. DATA SCHEMAS

### 1.1 Input Schema - VWO Requirement

Represents the structure of each requirement extracted from the PRD:

```json
{
  "requirement_id": "FR1-FR9",
  "feature_name": "string (e.g., 'A/B Testing')",
  "description": "string (feature description from PRD)",
  "priority": "enum (Must|High|Medium|Low)",
  "category": "enum (Experimentation|Insights|Personalization|Management|Reporting|Integration)",
  "user_roles": ["array of roles (CRO_Specialist, Product_Manager, UX_Designer, Marketer, Analyst)"],
  "constraints": "string (technical or business constraints)",
  "success_metrics": "array of measurable outcomes",
  "dependencies": "array of related features"
}
```

**Example**:
```json
{
  "requirement_id": "FR1",
  "feature_name": "A/B, Split & Multivariate Testing",
  "description": "Enable users to execute experiments with multiple variations across digital touchpoints",
  "priority": "Must",
  "category": "Experimentation",
  "user_roles": ["CRO_Specialist", "Product_Manager", "Marketer"],
  "constraints": "Must support 50+ variations, <2s response time for setup",
  "success_metrics": ["Test creation time", "Statistical validity", "User adoption rate"],
  "dependencies": ["SmartStats Engine", "Audience Targeting"]
}
```

---

### 1.2 Output Schema - Test Case

Represents the structure of each generated test case:

```json
{
  "test_id": "string (TC-VWO-FR#-###)",
  "requirement_id": "string (FR1-FR9)",
  "feature_name": "string",
  "test_name": "string (descriptive test name)",
  "test_type": "enum (Positive|Negative|Edge|Security|Performance)",
  "priority": "enum (Critical|High|Medium|Low)",
  "severity": "enum (Blocker|High|Medium|Low)",
  "preconditions": "string or array (required state before test)",
  "steps": "array of strings (step-by-step instructions)",
  "expected_result": "string (what should happen)",
  "actual_result": "string (to be filled during execution)",
  "status": "enum (Not Started|In Progress|Pass|Fail)",
  "notes": "string (additional context or edge cases)",
  "automation_ready": "boolean",
  "estimated_duration_minutes": "integer"
}
```

**Example**:
```json
{
  "test_id": "TC-VWO-FR1-001",
  "requirement_id": "FR1",
  "feature_name": "A/B Testing",
  "test_name": "Create Simple A/B Test",
  "test_type": "Positive",
  "priority": "Critical",
  "severity": "Critical",
  "preconditions": "User logged in, access to Testing module",
  "steps": [
    "Navigate to Testing > Create New Test",
    "Select 'A/B Test' as test type",
    "Enter test name: 'Button Color Test'",
    "Define conversion goal",
    "Create 2 variations",
    "Click 'Create Test'"
  ],
  "expected_result": "Test created successfully, test ID generated, status shows 'Draft'",
  "actual_result": null,
  "status": "Not Started",
  "notes": "Verify all required fields are mandatory",
  "automation_ready": true,
  "estimated_duration_minutes": 5
}
```

---

### 1.3 Delivery Schema - Test Plan Document

Represents the structure of the output test plan markdown document:

```yaml
Document_Structure:
  Header:
    - Project Name & JIRA ID
    - Document Date & Version
    - Prepared By
    - Status
  
  Executive_Summary:
    - Objectives (3-5 key goals)
    - Scope (features & requirements covered)
    - Test Strategy (approach & methodology)
    - Metrics (KPIs & success criteria)
  
  Test_Coverage_Matrix:
    - Table: FR ID → Feature → Priority → Test Case Count → Coverage %
    - Summary: Total coverage percentage
  
  Test_Strategy:
    - Test Types (Positive, Negative, Edge, Security, Performance)
    - Test Priorities (Critical, High, Medium, Low mapping)
    - Non-Functional Requirements Strategy
  
  Detailed_Test_Cases:
    - Grouped by Feature (FR1-FR9)
    - For each Test Case:
      * Test ID
      * Type & Priority
      * Preconditions
      * Step-by-step Instructions
      * Expected Results
      * Severity Level
  
  Non_Functional_Testing:
    - Performance Testing
    - Security Testing
    - Data Privacy Testing
    - Scalability Testing
    - Reliability Testing
  
  Test_Execution_Plan:
    - Timeline (phases & duration)
    - Environment Requirements
    - Test Data Requirements
    - Resource Allocation
  
  Risk_Assessment:
    - Table: Risk → Probability → Impact → Mitigation
  
  Approval_Section:
    - Sign-off by stakeholders
    - Approval dates
```

---

## II. BEHAVIORAL RULES (System Constraints)

### 2.1 Test Case Generation Rules

1. **Coverage Rule**: Every functional requirement MUST have:
   - At least 1 positive test case ✅
   - At least 1 negative test case ✅
   - Edge cases for complex features ✅

2. **Naming Convention**: 
   - Format: `TC-VWO-[FeatureID]-[Number]`
   - Example: `TC-VWO-FR1-001`, `TC-VWO-FR2-015`
   - Sequential numbering per feature
   - Non-Functional prefix: `TC-VWO-NFR-[Number]`

3. **Priority Mapping**:
   - FR Priority "MUST" → Test Priority "Critical" ⚡
   - FR Priority "HIGH" → Test Priority "High" 🔴
   - FR Priority "MEDIUM" → Test Priority "Medium" 🟡
   - FR Priority "LOW" → Test Priority "Low" ⚪

4. **Granularity Rule**:
   - Each test case tests ONE specific behavior
   - No compound test cases (e.g., "Create and Launch Test")
   - Each test case is independently executable
   - Preconditions explicitly stated

5. **Traceability Rule**:
   - Every test case MUST link to specific FR (FR1-FR9)
   - Bidirectional mapping maintained (FR → Test Cases)
   - No orphaned test cases
   - No untraceable tests

### 2.2 Test Case Specification Rules

**Positive Test Cases** (Happy Path - 60% of total):
- Valid inputs, expected outcomes
- Tests core feature functionality
- Validates success scenarios
- Verifies data integrity
- Example: "Create A/B test with valid parameters"

**Negative Test Cases** (Error Handling - 30% of total):
- Invalid inputs, error conditions
- Tests boundary violations
- Validates error messages
- Verifies data rejection
- Example: "Create A/B test with invalid traffic allocation (>100%)"

**Edge Cases** (Limit Conditions - 7% of total):
- Boundary conditions (empty, null, max, min)
- Special characters in inputs
- Extreme values
- Concurrent operations
- Example: "Create audience segment with 5+ conditions"

**Security Cases** (Authorization & Privacy - 2% of total):
- Authentication requirements
- Role-Based Access Control (RBAC)
- Data encryption verification
- Audit logging
- Example: "Verify non-admin user cannot delete tests"

**Performance Cases** (NFR - 1% of total):
- Response time validation
- Load testing
- Scalability verification
- Example: "Dashboard loads in <2 seconds under peak load"

### 2.3 Output Formatting Rules

**Markdown Format Requirements**:
- Use Markdown syntax for all documentation
- Clear headers (H1, H2, H3) for organization
- Tables for test coverage matrices
- Code blocks for schemas/examples
- Lists for steps and requirements
- Links for cross-references

**Test Case Organization**:
- Group by Feature (FR1, FR2, etc.)
- Sub-group by Test Type (Positive, Negative, Edge)
- Sort by Priority within groups
- Consistent formatting throughout

**Step Format**:
- Numbered steps (1, 2, 3, ...)
- Clear action verbs (Navigate, Click, Select, Verify)
- Specific values where applicable
- Realistic data examples

**Expected Results**:
- Describe observable outcome
- Include verification points
- Specify success criteria
- Avoid vague language ("should work")

### 2.4 "Do NOT" Rules (Prohibited Actions)

❌ **Do NOT create duplicate test cases**
- Each test case covers unique behavior
- No redundant test cases
- Consolidate similar scenarios

❌ **Do NOT include untestable assertions**
- All test cases must be executable
- Avoid subjective criteria ("looks good")
- Use measurable outcomes

❌ **Do NOT skip edge cases**
- Every feature must have edge case tests
- Boundary conditions tested
- Error scenarios validated

❌ **Do NOT mix positive and negative in one test**
- Positive: Tests success scenario
- Negative: Tests failure scenario
- Never combine (e.g., "Create test and verify error handling")

❌ **Do NOT assume test environment details**
- Only use information from PRD
- Don't assume API availability
- Don't assume third-party services
- Specify all preconditions

❌ **Do NOT create test cases for undefined requirements**
- Only test requirements in FR1-FR9
- Don't add new features not in PRD
- Focus on documented scope

---

## III. ARCHITECTURAL INVARIANTS

### 3.1 Feature Testing Map

```
VWO-48 Test Plan Structure
│
├── FR1: A/B, Split & Multivariate Testing [MUST]
│   ├── Positive: Test creation, variation setup (5 TCs)
│   ├── Negative: Invalid inputs, validation (3 TCs)
│   └── Edge: Test lifecycle, complex scenarios (1 TC)
│
├── FR2: SmartStats Engine [MUST]
│   ├── Positive: Calculation accuracy (4 TCs)
│   ├── Negative: Insufficient data, edge cases (2 TCs)
│   └── Edge: Zero conversions, extreme values (1 TC)
│
├── FR3: Visual & Code Editor [MUST]
│   ├── Positive: Element editing, preview (5 TCs)
│   ├── Negative: Syntax errors, invalid elements (2 TCs)
│   └── Edge: Complex DOM, cross-browser (2 TCs)
│
├── FR4: Heatmaps & Session Recordings [MUST]
│   ├── Positive: Generation, playback (4 TCs)
│   ├── Negative: No data, privacy checks (2 TCs)
│   └── Edge: Export, masking (1 TC)
│
├── FR5: Audience Targeting [HIGH]
│   ├── Positive: Segment creation, multi-condition (6 TCs)
│   ├── Negative: Invalid parameters (2 TCs)
│   └── Edge: Geographic, complex queries (1 TC)
│
├── FR6: Real-time Reporting & Dashboards [MUST]
│   ├── Positive: Dashboard display, reports (4 TCs)
│   ├── Negative: No data, export errors (2 TCs)
│   └── Edge: Performance, consistency (1 TC)
│
├── FR7: Personalization Engine [HIGH]
│   ├── Positive: Experience creation, delivery (4 TCs)
│   ├── Negative: Empty segments (1 TC)
│   └── Edge: Nested A/B, performance (2 TCs)
│
├── FR8: Integration Connectors [HIGH]
│   ├── Positive: Integration setup (3 TCs)
│   ├── Negative: Invalid credentials (1 TC)
│   └── Edge: Multiple integrations (1 TC)
│
├── FR9: Collaboration & Workflow Management [MEDIUM]
│   ├── Positive: Kanban, assignment (3 TCs)
│   ├── Negative: Permission denied (1 TC)
│   └── Edge: Comments, collaboration (1 TC)
│
└── NFR: Non-Functional Requirements
    ├── Performance: <2s response time (2 TCs)
    ├── Security: Auth, RBAC, audit (3 TCs)
    ├── Privacy: Encryption, GDPR (2 TCs)
    ├── Scalability: High volume (1 TC)
    └── Reliability: Uptime, degradation (2 TCs)

TOTAL: 75 Test Cases
```

### 3.2 Test Coverage Targets

**Minimum Coverage by Priority**:
- MUST Features (FR1, FR2, FR3, FR4, FR6): **100% coverage required** ✅
- HIGH Features (FR5, FR7, FR8): **80%+ coverage required** ✅
- MEDIUM Features (FR9): **60%+ coverage required** ✅
- NFR: **5 categories minimum** ✅

**Test Case Distribution**:
- Positive Cases: 50-60% ✅ (57% achieved)
- Negative Cases: 25-35% ✅ (28% achieved)
- Edge Cases: 5-15% ✅ (15% achieved)

**Quality Gates**:
- No blocking issues before release ✅
- All critical tests must pass ✅
- Security tests 100% pass ✅
- Performance SLA compliance ✅

### 3.3 Test Execution Sequence

```
Phase 1: Critical Path (Days 1-2)
├── MUST Feature Tests (FR1, FR2, FR3, FR4, FR6)
├── Critical Priority Tests Only
└── Smoke Testing (high-risk areas)

Phase 2: Core Features (Days 3-11)
├── HIGH Priority Features (FR5, FR7, FR8)
├── Positive & Negative Scenarios
└── Integration Testing

Phase 3: Remaining Tests (Days 12-18)
├── MEDIUM Priority Features (FR9)
├── Edge Cases & Non-Functional Tests
└── Regression Testing

Phase 4: Stabilization (Days 19-20)
├── UAT (User Acceptance Testing)
├── Sign-off & Documentation
└── Release Readiness
```

### 3.4 Risk Mitigation Strategies

| Risk | Mitigation |
|------|-----------|
| SmartStats accuracy | Validate against manual calculations with known outcomes |
| Visual Editor errors | Test with real-world HTML structures, not samples |
| Performance issues | Early load testing, monitoring setup |
| Integration failures | Mock external services, sandbox credentials |
| Privacy violations | Sensitive data masking validation |
| Cross-browser issues | Comprehensive browser matrix testing |

---

## IV. PROJECT CONSTRAINTS & ASSUMPTIONS

### 4.1 In Scope
✅ All 9 Functional Requirements (FR1-FR9)  
✅ Non-Functional Requirements (Performance, Security, Privacy, Scalability, Reliability)  
✅ Positive, Negative, and Edge Case Testing  
✅ Manual Test Case Documentation  
✅ Test Execution Planning  

### 4.2 Out of Scope
❌ Automated Test Script Development  
❌ Load/Stress Testing Tools Configuration  
❌ Third-party System Integration Testing  
❌ Mobile App Testing (Web focus only)  
❌ Localization/Internationalization Testing  

### 4.3 Assumptions
- Staging environment available for testing
- VWO PRD is complete and accurate
- No external integrations required for test plan creation
- QA team has necessary access and permissions
- Standard browsers (Chrome, Firefox, Safari, Edge) available

### 4.4 Dependencies
- VWO Platform access (staging)
- Test data preparation capability
- Test environment infrastructure
- Third-party service sandbox accounts (if testing integrations)

---

## V. APPROVAL & HANDOFF

### Sign-off Requirements

Before test execution can begin, the following roles must approve:

1. **Test Lead** (Approval required)
   - Verify test plan completeness
   - Approve execution timeline
   - Confirm resource allocation

2. **QA Manager** (Approval required)
   - Validate test strategy
   - Approve methodology
   - Confirm team readiness

3. **Product Owner** (Approval required)
   - Verify requirement coverage
   - Approve test priorities
   - Confirm business objectives alignment

4. **Release Manager** (Approval required)
   - Review release blockers
   - Approve exit criteria
   - Confirm sign-off timeline

### Project Constitution Effectiveness

This Project Constitution defines:
- ✅ **What** will be tested (FR1-FR9)
- ✅ **How** testing will be performed (Positive/Negative/Edge)
- ✅ **Why** each test case matters (Traceability to requirements)
- ✅ **When** tests will execute (20-day timeline)
- ✅ **Who** will execute tests (QA team, stakeholders)

---

**Project Constitution Status**: ✅ COMPLETE  
**Effective Date**: June 17, 2026  
**Next Review Date**: Upon test execution start or material change to scope  
**Version**: 1.0
