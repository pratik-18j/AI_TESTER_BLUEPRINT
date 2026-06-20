import React from 'react';

function LoadingSpinner({ progress }) {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <h2>Generating Test Plan...</h2>
      {progress && <p className="progress-text">{progress}</p>}
      <p className="loading-tip">This may take up to 30 seconds...</p>
    </div>
  );
}

export default LoadingSpinner;
