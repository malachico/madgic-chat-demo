import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';


export interface StepType {
  title: string;
  content: string;
  isFinal: boolean;
}

interface StepProps {
  title: string;
  content: string;
  isFinal: boolean;
  isLastStep?: boolean;
}

const Step: React.FC<StepProps> = ({ title, content, isLastStep = false }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    // Only the last step should be expanded by default
    setIsCollapsed(!isLastStep);
  }, [isLastStep]);

  return (
    <div className={`relative bg-white rounded-xl border transition-smooth ${
      'border-green-200 shadow-soft'
    }`}>
      <button 
        className="w-full p-4 text-left focus-ring rounded-xl transition-quick"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center space-x-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-smooth ${
            'bg-green-100 text-green-600'
          }`}>
            {true ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (true) ? (
              <div className="flex space-x-px">
                <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            ) : (
              <div className="w-2 h-2 bg-current rounded-full"></div>
            )}
          </div>
          
          <h3 className={`font-medium text-sm flex-grow transition-smooth text-green-700`}>
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
      
      <div className={`transition-smooth ${
        isCollapsed ? 'max-h-0 overflow-hidden' : 'max-h-[500px] overflow-y-auto'
      }`}>
        <div className="px-4 pb-4">
          <div className={`pl-9 text-sm leading-relaxed markdown-content ${
            'text-green-700'
          }`}>
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step; 