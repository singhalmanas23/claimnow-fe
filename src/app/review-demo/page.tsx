'use client';

import React, { useState } from 'react';
import ReviewComponent from '@/components/ReviewComponent';

export default function ReviewDemoPage() {
  const [currentState, setCurrentState] = useState<'with-issues' | 'single-issue' | 'no-issues'>('with-issues');

  const handleNext = () => {
    alert(`Next clicked for state: ${currentState}`);
  };

  const handleReset = () => {
    alert(`Reset clicked for state: ${currentState}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* State selector */}
      <div className="fixed top-4 left-4 z-50 bg-white rounded-lg shadow-lg p-4">
        <h3 className="text-sm font-medium mb-3">Review States:</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input 
              type="radio" 
              name="state" 
              value="with-issues" 
              checked={currentState === 'with-issues'}
              onChange={(e) => setCurrentState(e.target.value as 'with-issues' | 'single-issue' | 'no-issues')}
              className="mr-2"
            />
            <span className="text-sm">Multiple Issues (3 needs attention)</span>
          </label>
          <label className="flex items-center">
            <input 
              type="radio" 
              name="state" 
              value="single-issue" 
              checked={currentState === 'single-issue'}
              onChange={(e) => setCurrentState(e.target.value as 'with-issues' | 'single-issue' | 'no-issues')}
              className="mr-2"
            />
            <span className="text-sm">Single Issue (1 issue found)</span>
          </label>
          <label className="flex items-center">
            <input 
              type="radio" 
              name="state" 
              value="no-issues" 
              checked={currentState === 'no-issues'}
              onChange={(e) => setCurrentState(e.target.value as 'with-issues' | 'single-issue' | 'no-issues')}
              className="mr-2"
            />
            <span className="text-sm">No Issues (0 issues found)</span>
          </label>
        </div>
      </div>

      <ReviewComponent 
        state={currentState}
        onNext={handleNext}
        onReset={handleReset}
      />
    </div>
  );
}
