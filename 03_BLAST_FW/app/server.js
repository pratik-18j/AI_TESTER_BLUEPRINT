/**
 * Express Backend Server
 * Layer 2: Navigation - Routes API requests to Python tools
 * Handles: Credential validation, Jira fetching, Test plan generation, Markdown formatting
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

const TOOLS_DIR = path.join(__dirname, '..', 'tools');
const IS_WINDOWS = process.platform === 'win32';

// Helper to run Python scripts
function runPythonScript(scriptName, args = []) {
  return new Promise((resolve, reject) => {
    const pythonCmd = 'python';
    const scriptPath = path.join(TOOLS_DIR, scriptName);
    const argsStr = args.map(arg => `"${arg.replace(/"/g, '\\"')}"`).join(' ');
    const cmd = `${pythonCmd} "${scriptPath}" ${argsStr}`;

    exec(cmd, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Python Error: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        reject(new Error(stderr || error.message));
        return;
      }

      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (parseError) {
        console.error(`JSON Parse Error: ${parseError.message}`);
        console.error(`stdout: ${stdout}`);
        reject(new Error('Invalid JSON response from Python script'));
      }
    });
  });
}

// API: Validate credentials
app.get('/api/validate-credentials', async (req, res) => {
  try {
    const result = await runPythonScript('01_credential_validator.py');
    res.json({ valid: true });
  } catch (error) {
    res.status(400).json({ 
      valid: false, 
      error: error.message 
    });
  }
});

// API: Fetch Jira issue
app.post('/api/fetch-issue', async (req, res) => {
  try {
    const { issue_key } = req.body;

    if (!issue_key) {
      return res.status(400).json({ 
        success: false, 
        error: 'Issue key is required' 
      });
    }

    // Python script: jira_fetcher.py
    const pythonCmd = 'python';
    const scriptPath = path.join(TOOLS_DIR, 'jira_fetcher.py');
    
    const result = await new Promise((resolve, reject) => {
      exec(
        `${pythonCmd} "${scriptPath}" "${issue_key}" --json`,
        { maxBuffer: 5 * 1024 * 1024 },
        (error, stdout, stderr) => {
          if (error) {
            reject(new Error(stderr || error.message));
            return;
          }
          try {
            resolve(JSON.parse(stdout));
          } catch (parseError) {
            reject(new Error('Failed to parse Jira response'));
          }
        }
      );
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// API: Generate test plan
app.post('/api/generate-test-plan', async (req, res) => {
  try {
    const { issue_data, test_count, include_security, include_performance } = req.body;

    if (!issue_data) {
      return res.status(400).json({ 
        success: false, 
        error: 'Issue data is required' 
      });
    }

    const issueJson = JSON.stringify(issue_data).replace(/"/g, '\\"');
    const pythonCmd = 'python';
    const scriptPath = path.join(TOOLS_DIR, 'test_plan_generator.py');

    const args = [
      `"${issueJson}"`,
      `--count ${test_count || 10}`
    ];

    if (!include_security) args.push('--no-security');
    if (!include_performance) args.push('--no-performance');

    const result = await new Promise((resolve, reject) => {
      exec(
        `${pythonCmd} "${scriptPath}" ${args.join(' ')}`,
        { maxBuffer: 10 * 1024 * 1024 },
        (error, stdout, stderr) => {
          if (error) {
            reject(new Error(stderr || error.message));
            return;
          }
          try {
            resolve(JSON.parse(stdout));
          } catch (parseError) {
            reject(new Error('Failed to parse test plan response'));
          }
        }
      );
    });

    res.json(result);
  } catch (error) {
    console.error('Generate test plan error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// API: Format as Markdown
app.post('/api/format-markdown', async (req, res) => {
  try {
    const { issue_data, test_cases } = req.body;

    if (!issue_data || !test_cases) {
      return res.status(400).json({ 
        error: 'Issue data and test cases are required' 
      });
    }

    const issueJson = JSON.stringify(issue_data).replace(/"/g, '\\"');
    const casesJson = JSON.stringify(test_cases).replace(/"/g, '\\"');
    const pythonCmd = 'python';
    const scriptPath = path.join(TOOLS_DIR, 'markdown_formatter.py');

    const markdown = await new Promise((resolve, reject) => {
      exec(
        `${pythonCmd} "${scriptPath}" "${issueJson}" "${casesJson}"`,
        { maxBuffer: 10 * 1024 * 1024 },
        (error, stdout, stderr) => {
          if (error) {
            reject(new Error(stderr || error.message));
            return;
          }
          resolve(stdout);
        }
      );
    });

    res.json({ markdown });
  } catch (error) {
    console.error('Format markdown error:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('✓ Ready to process Jira issues and generate test plans');
});
