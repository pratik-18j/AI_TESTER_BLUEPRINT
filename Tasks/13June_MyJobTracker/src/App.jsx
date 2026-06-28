import React from 'react';
import JobInterviewCommandCenter, { JobProvider } from './JobTracker';

function App() {
  return (
    <JobProvider>
      <JobInterviewCommandCenter />
    </JobProvider>
  );
}

export default App;