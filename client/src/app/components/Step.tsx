import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';


export interface StepType {
  title: string;
  content: string;
  isCompleted: boolean;
  isActive: boolean;
  isFinal: boolean;
}

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
    <div className={`relative bg-white rounded-xl border transition-smooth ${
      isCompleted ? 'border-green-200 shadow-soft' : 
      isActive ? 'border-blue-200 shadow-soft' : 'border-gray-200'
    }`}>
      <button 
        className="w-full p-4 text-left focus-ring rounded-xl transition-quick"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center space-x-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-smooth ${
            isCompleted ? 'bg-green-100 text-green-600' : 
            isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
          }`}>
            {isCompleted ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : isActive ? (
              <div className="flex space-x-px">
                <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            ) : (
              <div className="w-2 h-2 bg-current rounded-full"></div>
            )}
          </div>
          
          <h3 className={`font-medium text-sm flex-grow transition-smooth ${
            isCompleted ? 'text-green-700' : 
            isActive ? 'text-blue-700' : 'text-gray-700'
          }`}>
            {title}
          </h3>
          
          <svg 
            className={`w-5 h-5 text-gray-400 transition-smooth ${
              isCollapsed ? 'rotate-0' : 'rotate-180'
            }`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      <div className={`overflow-hidden transition-smooth ${
        isCollapsed ? 'max-h-0' : 'max-h-[500px]'
      }`}>
        <div className="px-4 pb-4">
          <div className={`pl-9 text-sm leading-relaxed markdown-content ${
            isCompleted ? 'text-green-700' : 
            isActive ? 'text-blue-700' : 'text-gray-600'
          }`}>
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step; 