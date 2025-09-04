import React, { ChangeEvent, FormEvent, useState } from 'react';
import { BsChatDots } from "react-icons/bs";
import { RiRobot2Line } from "react-icons/ri";
import { TbWaveSine } from "react-icons/tb";
import { Mode, StreamMode } from '../page';

interface ChatInputProps {
  message: string;
  setMessage: (message: string) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  isLoading: boolean;
  mode: Mode;
  setMode: (mode: Mode) => void;
  streamMode: StreamMode;
  setStreamMode: (streamMode: StreamMode) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  message,
  setMessage,
  handleSubmit,
  isLoading,
  mode,
  setMode,
  streamMode,
  setStreamMode
}) => {
  const [showModePopup, setShowModePopup] = useState(false);

  const handleModeClick = () => {
    const newMode = mode === 'agent' ? 'chatbot' : 'agent';
    setMode(newMode);
    
    // Show popup indication
    setShowModePopup(true);
    setTimeout(() => setShowModePopup(false), 2000);
  };

  const handleStreamToggle = () => {
    const newStreamMode = streamMode === 'stream' ? 'normal' : 'stream';
    setStreamMode(newStreamMode);
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center space-x-2">
          {/* Input Field */}
          <input
            type="text"
            value={message}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 bg-white border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-quick shadow-soft"
            disabled={isLoading}
          />
          
          {/* Mode Selector Button */}
          <div className="relative group">
            <button
              type="button"
              onClick={handleModeClick}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-quick focus-ring flex items-center space-x-2 shadow-soft"
            >
              {mode === 'agent' ? (
                <RiRobot2Line className="w-4 h-4" />
              ) : (
                <BsChatDots className="w-4 h-4" />
              )}
              {/* <span className="capitalize">{mode}</span> */}
            </button>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-large text-sm font-medium whitespace-nowrap">
                {mode === 'agent' ? 'Agent' : 'Chatbot'}
                {/* Tooltip arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>

          {/* Stream Mode Toggle - Only show for chatbot mode */}
          {mode === 'chatbot' && (
            <div className="relative group">
              <button
                type="button"
                onClick={handleStreamToggle}
                className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-quick focus-ring flex items-center space-x-2 shadow-soft ${
                  streamMode === 'stream' 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <TbWaveSine className="w-4 h-4" />
              </button>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-large text-sm font-medium whitespace-nowrap">
                  {streamMode === 'stream' ? 'Stream' : 'Bulk'}
                  {/* Tooltip arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
          )}
          
          {/* Send Button */}
          <button
            type="submit"
            disabled={isLoading || !message.trim()}
            className={`p-2.5 rounded-xl transition-quick focus-ring shadow-soft ${
              isLoading || !message.trim() 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-medium'
            }`}
          >
            {isLoading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </form>

      {/* Mode Change Popup */}
      {showModePopup && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 animate-fade-in">
          <div className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-large text-sm font-medium">
            <div className="flex items-center space-x-2">
              {mode === 'agent' ? (
                <RiRobot2Line className="w-4 h-4" />
              ) : (
                <BsChatDots className="w-4 h-4" />
              )}
              <span>Switched to {mode}</span>
            </div>
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInput; 