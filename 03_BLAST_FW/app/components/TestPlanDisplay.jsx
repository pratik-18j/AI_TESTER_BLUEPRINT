import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

function TestPlanDisplay({ testPlan }) {
  const [copied, setCopied] = useState(false);

  const downloadMarkdown = () => {
    const element = document.createElement('a');
    const file = new Blob([testPlan.markdown], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `test-plan-${testPlan.issue.key}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(testPlan.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyMarkdownJson = () => {
    const json = JSON.stringify(testPlan.testCases, null, 2);
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="test-plan-display">
      <div className="test-plan-header">
        <h2>{testPlan.issue.key}: {testPlan.issue.summary}</h2>
        <div className="issue-meta">
          <span className={`priority priority-${testPlan.issue.priority?.toLowerCase()}`}>
            {testPlan.issue.priority}
          </span>
          <span className="type">{testPlan.issue.type}</span>
        </div>
      </div>

      <div className="action-buttons">
        <button className="btn-secondary" onClick={downloadMarkdown}>
          📥 Download as .md
        </button>
        <button className="btn-secondary" onClick={copyToClipboard}>
          {copied ? '✅ Copied!' : '📋 Copy Markdown'}
        </button>
        <button className="btn-secondary" onClick={copyMarkdownJson}>
          📋 Copy JSON
        </button>
      </div>

      <div className="test-summary">
        <h3>Test Summary</h3>
        <p>Total Test Cases: <strong>{testPlan.testCases.length}</strong></p>
        <ul>
          {Array.from(new Set(testPlan.testCases.map(tc => tc.test_type))).map(type => {
            const count = testPlan.testCases.filter(tc => tc.test_type === type).length;
            return <li key={type}>{type}: {count}</li>;
          })}
        </ul>
      </div>

      <div className="markdown-content">
        <ReactMarkdown>
          {testPlan.markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default TestPlanDisplay;
