import React, { useState, useEffect } from 'react';
import './App.css';
import CredentialForm from './components/CredentialForm';
import IssueForm from './components/IssueForm';
import LoadingSpinner from './components/LoadingSpinner';
import TestPlanDisplay from './components/TestPlanDisplay';
import ErrorMessage from './components/ErrorMessage';

function App() {
  const [credentials, setCredentials] = useState(null);
  const [credentialsValid, setCredentialsValid] = useState(false);
  const [testPlan, setTestPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generationProgress, setGenerationProgress] = useState('');

  // Validate credentials on app load
  useEffect(() => {
    validateCredentials();
  }, []);

  const validateCredentials = async () => {
    try {
      const response = await fetch('/api/validate-credentials');
      const result = await response.json();
      setCredentialsValid(result.valid);
      if (!result.valid) {
        setError('Missing or invalid credentials. Please configure .env file.');
      }
    } catch (err) {
      setError('Failed to validate credentials');
    }
  };

  const handleGenerateTestPlan = async (issueData) => {
    setLoading(true);
    setError(null);
    setTestPlan(null);
    setGenerationProgress('Fetching Jira issue...');

    try {
      // Step 1: Fetch Jira issue
      setGenerationProgress('📥 Fetching Jira issue...');
      const issueResponse = await fetch('/api/fetch-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue_key: issueData.issueKey })
      });

      if (!issueResponse.ok) {
        const errorData = await issueResponse.json();
        throw new Error(errorData.error || 'Failed to fetch issue');
      }

      const issueResult = await issueResponse.json();
      if (!issueResult.success) {
        throw new Error(issueResult.error);
      }

      // Step 2: Generate test plan
      setGenerationProgress('🤖 Generating test plan with GROQ...');
      const generateResponse = await fetch('/api/generate-test-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issue_data: issueResult.data,
          test_count: issueData.testCount || 10,
          include_security: issueData.includeSecurity !== false,
          include_performance: issueData.includePerformance !== false
        })
      });

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json();
        throw new Error(errorData.error || 'Failed to generate test plan');
      }

      const generateResult = await generateResponse.json();
      if (!generateResult.success) {
        throw new Error(generateResult.error);
      }

      // Step 3: Format as markdown
      setGenerationProgress('📝 Formatting test plan...');
      const formatResponse = await fetch('/api/format-markdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issue_data: issueResult.data,
          test_cases: generateResult.data
        })
      });

      if (!formatResponse.ok) {
        throw new Error('Failed to format test plan');
      }

      const formatResult = await formatResponse.json();
      
      setTestPlan({
        issue: issueResult.data,
        testCases: generateResult.data,
        markdown: formatResult.markdown
      });
      setGenerationProgress('');

    } catch (err) {
      setError(err.message || 'An error occurred while generating the test plan');
      setGenerationProgress('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🧪 Jira Test Plan Generator</h1>
        <p>Fetch Jira issues and generate test plans with AI</p>
      </header>

      <div className="App-container">
        {!credentialsValid ? (
          <ErrorMessage 
            message="Credentials not configured. Please verify .env file is present."
          />
        ) : (
          <>
            {error && <ErrorMessage message={error} />}
            
            {loading ? (
              <div className="loading-section">
                <LoadingSpinner progress={generationProgress} />
              </div>
            ) : testPlan ? (
              <div className="test-plan-section">
                <button 
                  className="btn-back"
                  onClick={() => setTestPlan(null)}
                >
                  ← Generate Another
                </button>
                <TestPlanDisplay testPlan={testPlan} />
              </div>
            ) : (
              <div className="form-section">
                <IssueForm onSubmit={handleGenerateTestPlan} />
              </div>
            )}
          </>
        )}
      </div>

      <footer className="App-footer">
        <p>Powered by Jira API & GROQ AI | B.L.A.S.T Framework</p>
      </footer>
    </div>
  );
}

export default App;
