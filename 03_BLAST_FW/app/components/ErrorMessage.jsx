import React from 'react';

function ErrorMessage({ message }) {
  return (
    <div className="error-message">
      <span className="error-icon">❌</span>
      <div className="error-content">
        <h3>Error</h3>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default ErrorMessage;
