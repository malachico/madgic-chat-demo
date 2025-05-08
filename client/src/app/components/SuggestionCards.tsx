import React from 'react';

interface SuggestionCardsProps {
  setMessage: (message: string) => void;
}

interface SuggestionItem {
  emoji: string;
  text: string;
}

const suggestions: SuggestionItem[] = [
  { emoji: '🔬', text: 'Tell me about the latest advancements in AI.' },
  { emoji: '⚖️', text: 'What are some ethical considerations in large language models?' },
  { emoji: '⚛️', text: 'Explain the concept of quantum computing in simple terms.' },
  { emoji: '🌐', text: 'Summarize the history of the internet.' },
  { emoji: '🔗', text: 'How does blockchain technology work?' },
  { emoji: '🌡️', text: 'What are the potential impacts of climate change?' },
];

const SuggestionCards: React.FC<SuggestionCardsProps> = ({ setMessage }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
      {suggestions.map((suggestion, index) => (
        <div 
          key={index}
          className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:ring-2 hover:ring-pink-300 transition-all duration-200 ease-in-out" 
          onClick={() => setMessage(suggestion.text)}
        >
          <p className="text-gray-700 font-semibold flex items-center">
            {suggestion.emoji} <span className="ml-2">{suggestion.text}</span>
          </p>
        </div>
      ))}
    </div>
  );
};

export default SuggestionCards; 