# JIRA Test Plan Generator - Setup Guide

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+ and npm
- All credentials configured in `.env` file (at project root)

### Installation

```bash
# 1. Install Python dependencies
pip install requests python-dotenv groq

# 2. Install Node dependencies
cd 03_BLAST_FW/app
npm install

# 3. Validate credentials
npm run validate

# 4. Test API connections
npm run test-jira
npm run test-groq
```

### Running the Application

```bash
# Development mode (React + Express)
cd 03_BLAST_FW/app
npm run dev

# Or run just the backend server
npm start
```

Then open: **http://localhost:3000**

### Architecture

**Layer 1: Architecture (SOPs)**
- `architecture/01_jira_integration.md` - Jira API integration spec
- `architecture/02_groq_integration.md` - GROQ API integration spec
- `architecture/03_test_plan_format.md` - Markdown output format spec
- `architecture/04_error_handling.md` - Error handling & recovery

**Layer 2: Navigation (Frontend)**
- `app/App.jsx` - Main React component
- `app/components/*.jsx` - UI components
- `app/server.js` - Express backend
- `app/App.css` - Styling

**Layer 3: Tools (Backend)**
- `tools/jira_fetcher.py` - Fetch Jira issues
- `tools/test_plan_generator.py` - Generate test cases with GROQ
- `tools/markdown_formatter.py` - Format output as Markdown
- `tools/*_tester.py` - Verification tools

### Project Memory

- `/memories/repo/task_plan.md` - Phase-by-phase plan
- `/memories/repo/findings.md` - Technical findings
- `/memories/repo/progress.md` - Completion status
- `/memories/repo/gemini.md` - Project constitution (schemas & rules)

### Workflow

1. **User enters Jira issue key** (e.g., VWO-5)
2. **App fetches issue** from Jira API
3. **GROQ LLM generates test cases** based on issue details
4. **Markdown formatter** structures output professionally
5. **UI displays** formatted test plan
6. **User can download** as .md file

### Troubleshooting

#### Credentials not loading
- Verify `.env` file exists at project root
- Check all required variables are present:
  - JIRA_EMAIL
  - JIRA_API_TOKEN
  - JIRA_BASE_URL
  - GROQ_API_KEY
  - GROQ_MODEL

#### Jira API errors (401/403)
- Run: `npm run test-jira`
- Verify credentials are valid in .env
- Check if token has correct scopes

#### GROQ API errors
- Run: `npm run test-groq`
- Verify API key is active
- Check rate limits (may need to retry)

### Technology Stack

- **Frontend**: React 18 with Markdown rendering
- **Backend**: Express.js
- **Python Tools**: Deterministic, atomic, testable scripts
- **APIs**: Jira Cloud + GROQ LLM (openai/gpt-oss-120b)
- **Architecture**: 3-Layer (SOP + Navigation + Tools)

### B.L.A.S.T Framework Phases

✅ **Phase 0: Initialization** - Discovery questions answered, project memory created
✅ **Phase 1: Blueprint** - Architecture SOPs defined, data schemas created
✅ **Phase 2: Link** - API connections verified, handshake scripts working
✅ **Phase 3: Architect** - 3-layer build complete (SOPs, React, Python tools)
⏳ **Phase 4: Stylize** - UI/UX refinement (in progress)
⏳ **Phase 5: Trigger** - Production deployment (next)

### Performance & Limits

- Jira API: 10 second timeout
- GROQ API: 30 second timeout (LLM can be slow)
- Max test cases per generation: 20
- Description truncation: 5000 characters
- Retry logic: Up to 3 attempts with exponential backoff

### Security

- ✅ API keys stored in .env only (never exposed in UI)
- ✅ Credentials validated before API calls
- ✅ Error messages sanitized (no sensitive data)
- ✅ Python backend runs server-side only

### Next Steps

1. **Phase 4: Stylize** - Polish UI/UX, add animations
2. **Phase 5: Trigger** - Production deployment
3. Deploy to cloud (Vercel, Netlify, or custom server)
4. Add user authentication & history
5. Implement caching & performance optimization

### Support

For issues or questions:
1. Check `architecture/04_error_handling.md` for known errors
2. Review `/memories/repo/findings.md` for technical constraints
3. Check recent progress in `/memories/repo/progress.md`
