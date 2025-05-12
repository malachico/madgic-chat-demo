import Image from 'next/image';
import React, { JSX } from 'react';

interface WelcomeProps {
  gradientTextStyle: React.CSSProperties;
  setMessage: (message: string) => void;
}

interface SuggestionItem {
  icon: JSX.Element;
  text: string;
  color: string;
}

const suggestions: SuggestionItem[] = [
  { 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    text: 'Plan a trip to Italy',
    color: 'from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-purple-200'
  },
  { 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    text: 'Help me brainstorm ideas for my project',
    color: 'from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200 border-pink-200'
  },
  { 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    text: 'Write a blog post about AI trends',
    color: 'from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 border-indigo-200'
  },
  { 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    text: 'Create a workout plan for beginners',
    color: 'from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-200'
  },
];

const Welcome: React.FC<WelcomeProps> = ({ gradientTextStyle, setMessage }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-6">
      <div className="relative">
        <Image 
          src="/logo.png" 
          alt="AI Agent Logo" 
          width={240} 
          height={160} 
          className="drop-shadow-lg" 
          priority 
        />
      </div>

      <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center max-w-lg w-full border border-gray-100">
        <h1 className="text-2xl mb-6" style={gradientTextStyle}>This Agent is free because it is monetized by Madgic.ai!</h1>   
        <h1 className="text-lg mb-6">Want to monetize your Agent? <br/><a href="https://publishersmadgic.ai/docs" className="text-blue-500 hover:text-blue-600">Check out the docs!</a></h1>   
        <div className="mt-8">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-center margin-auto-0">
            {suggestions.map((suggestion, index) => (
              <div 
                key={index}
                className={`bg-gradient-to-br ${suggestion.color} rounded-xl shadow-sm p-5 cursor-pointer 
                           border border-opacity-50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md`}
                onClick={() => setMessage(suggestion.text)}
              >
                <div className="flex items-start">
                  <div className="text-purple-600 mr-3">{suggestion.icon}</div>
                  <p className="text-gray-700 font-medium text-sm leading-relaxed">
                    {suggestion.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">Or type your own question in the input field below</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome; 