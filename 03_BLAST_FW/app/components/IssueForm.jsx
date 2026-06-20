import React, { useState } from 'react';

function IssueForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    issueKey: '',
    testCount: 10,
    includeSecurity: true,
    includePerformance: true
  });

  const [validationError, setValidationError] = useState('');

  const validateIssueKey = (key) => {
    const regex = /^[A-Z]+-\d+$/;
    return regex.test(key.toUpperCase());
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setValidationError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.issueKey.trim()) {
      setValidationError('Please enter an issue key (e.g., VWO-5)');
      return;
    }

    if (!validateIssueKey(formData.issueKey)) {
      setValidationError('Invalid format. Use format: PROJECT-123 (e.g., VWO-5)');
      return;
    }

    if (formData.testCount < 5 || formData.testCount > 20) {
      setValidationError('Test count must be between 5 and 20');
      return;
    }

    onSubmit({
      issueKey: formData.issueKey.toUpperCase(),
      testCount: parseInt(formData.testCount),
      includeSecurity: formData.includeSecurity,
      includePerformance: formData.includePerformance
    });
  };

  return (
    <div className="form-container">
      <h2>Generate Test Plan</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="issueKey">Jira Issue Key *</label>
          <input
            type="text"
            id="issueKey"
            name="issueKey"
            placeholder="e.g., VWO-5"
            value={formData.issueKey}
            onChange={handleChange}
            className={validationError && !formData.issueKey ? 'input-error' : ''}
          />
          <small>Format: PROJECT-NUMBER (e.g., VWO-5, PROJ-123)</small>
        </div>

        {validationError && (
          <div className="validation-error">{validationError}</div>
        )}

        <div className="form-group">
          <label htmlFor="testCount">Number of Test Cases</label>
          <input
            type="number"
            id="testCount"
            name="testCount"
            min="5"
            max="20"
            value={formData.testCount}
            onChange={handleChange}
          />
          <small>Range: 5-20 test cases</small>
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="includeSecurity"
              checked={formData.includeSecurity}
              onChange={handleChange}
            />
            Include Security Test Cases
          </label>
          <label>
            <input
              type="checkbox"
              name="includePerformance"
              checked={formData.includePerformance}
              onChange={handleChange}
            />
            Include Performance Test Cases
          </label>
        </div>

        <button type="submit" className="btn-primary">
          Generate Test Plan →
        </button>
      </form>
    </div>
  );
}

export default IssueForm;
