import React from 'react';

function CredentialForm({ onValidate }) {
  return (
    <div className="credential-form">
      <h3>Jira Credentials</h3>
      <p>Credentials are loaded from .env file</p>
      <button onClick={onValidate}>Validate Credentials</button>
    </div>
  );
}

export default CredentialForm;
