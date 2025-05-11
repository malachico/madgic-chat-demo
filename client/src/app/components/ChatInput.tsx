import React, { ChangeEvent, FormEvent } from 'react';
import { FaComments, FaRobot } from 'react-icons/fa';
import { Mode } from '../page';

interface ChatInputProps {
  message: string;
  setMessage: (message: string) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  isLoading: boolean;
  mode: Mode;
  setMode: (mode: Mode) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  message,
  setMessage,
  handleSubmit,
  isLoading,
  mode,
  setMode
}) => {

  const handleModeClick = () => {
    setMode(mode === 'agent' ? 'chatbot' : 'agent');
  };
  return (
    <div className="w-full px-4">
      <form onSubmit={handleSubmit} className="flex items-center">
        <div className="relative flex-1 flex items-center gap-2">
          {/* Input */}
          <input
            type="text"
            value={message}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
            placeholder="Ask me anything..."
            className="w-full px-5 py-3 pr-14 bg-white border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all duration-200 text-gray-700"
            disabled={isLoading}
          />
          
          {/* Mode Selector Chip */}
          <button
            type="button"
            className={`absolute right-12 top-1/2 transform -translate-y-1/2 flex items-center gap-1 px-3 py-1 rounded-full border shadow-sm transition-colors duration-200 bg-purple-100 border-purple-400 text-purple-700`}
            onClick={handleModeClick}
            tabIndex={0}
          >
            {mode === 'agent' ? <FaRobot size={16} /> : <FaComments size={16} />}
            <span className="capitalize text-sm">{mode}</span>
          </button>
          
          <button
            type="submit"
            disabled={isLoading || !message.trim()}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200 ${
              isLoading || !message.trim() 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md hover:from-purple-600 hover:to-pink-600'
            }`}
          >
            {isLoading ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" transform="rotate(90 12 12)" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput; 