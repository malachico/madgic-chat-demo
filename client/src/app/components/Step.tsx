import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface StepProps {
  title: string;
  content: string;
  isCompleted: boolean;
  isActive: boolean;
  isFinal: boolean;
  isLastStep?: boolean;
}

const Step: React.FC<StepProps> = ({ title, content, isCompleted, isActive, isLastStep = false }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    // Only the last step should be expanded by default
    setIsCollapsed(!isLastStep);
  }, [isLastStep]);

  useEffect(() => {
    // When all steps are completed, collapse all steps
    if (isCompleted) {
      setIsCollapsed(true);
    }
  }, [isCompleted]);

  return (
    <div className={`
      width-100% relative p-4 rounded-lg border-l-4 mb-4 transition-all duration-300
      ${isCompleted ? 'border-green-500 bg-green-50' : 
        isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}
    `}>
      <div 
        className="flex items-center mb-2 cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className={`
          w-6 h-6 rounded-full flex items-center justify-center mr-3
          ${isCompleted ? 'bg-green-500 text-white' : 
            isActive ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}
        `}>
          {isCompleted ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <span className="text-xs font-semibold">{isActive ? '...' : '○'}</span>
          )}
        </div>
        <h3 className={`font-medium text-sm flex-grow ${isCompleted ? 'text-green-700' : isActive ? 'text-blue-700' : 'text-gray-700'}`}>
          {title}
        </h3>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-5 w-5 transition-transform duration-200 ${isCollapsed ? 'transform rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      <div className={`
        ml-9 overflow-hidden transition-all duration-300
        ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}
      `}>
        <div className={`text-sm ${isCompleted ? 'text-green-700' : isActive ? 'text-blue-700' : 'text-gray-600'}`}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default Step; 