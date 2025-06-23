import React, { JSX } from 'react';

interface WelcomeProps {
  setMessage: (message: string) => void;
}

interface SuggestionItem {
  icon: JSX.Element;
  text: string;
  subtitle: string;
}

const suggestions: SuggestionItem[] = [
  { 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    text: 'Plan a trip to Italy',
    subtitle: 'Get detailed itineraries and travel recommendations'
  },
  { 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    text: 'Help me brainstorm ideas for my project',
    subtitle: 'Generate creative concepts and solutions'
  },
  { 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    text: 'Write a blog post about AI trends',
    subtitle: 'Create engaging content on current topics'
  },
  { 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    text: 'Create a workout plan for beginners',
    subtitle: 'Develop personalized fitness routines'
  },
];

const Welcome: React.FC<WelcomeProps> = ({ setMessage }) => {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-semibold text-gray-900 mb-4">
          How can I help you today?
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          Choose a suggestion below or type your own question to get started.
        </p>
      </div>

      {/* Suggestions List */}
      <div className="space-y-3 mb-8">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            className="w-full bg-white rounded-2xl shadow-soft border border-gray-200/50 p-6 text-left hover:shadow-medium hover:border-gray-300/50 transition-smooth focus-ring group"
            onClick={() => setMessage(suggestion.text)}
          >
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-smooth">
                {suggestion.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-medium text-gray-900 mb-1 group-hover:text-blue-600 transition-smooth">
                  {suggestion.text}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {suggestion.subtitle}
                </p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-smooth">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer Info */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 bg-white rounded-full px-6 py-3 shadow-soft border border-gray-200/50">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600 font-medium">
            This Agent is free because it is monetized by
          </span>
          <a 
            href="https://madgic.ai" 
            className="text-blue-600 hover:text-blue-700 transition-quick font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            Madgic.ai
          </a>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          <a 
            href="https://publishers.madgic.ai" 
            className="text-blue-600 hover:text-blue-700 transition-quick font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            Want to monetize your Agent?
          </a>
        </p>
      </div>
    </div>
  );
};

export default Welcome; 