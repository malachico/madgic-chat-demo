import React, { FormEvent, ChangeEvent } from 'react';

interface ChatInputProps {
  message: string;
  setMessage: (message: string) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  isLoading: boolean;
}

const buttonStyle = {
  background: 'linear-gradient(90deg, #9333ea, #ec4899)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  display: 'inline-block'
};

const ChatInput: React.FC<ChatInputProps> = ({
  message,
  setMessage,
  handleSubmit,
  isLoading
}) => {
  return (
    <div className="bg-white border-t border-gray-200 py-2 px-2 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            value={message}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 text-gray-800"
            disabled={isLoading}
          />
          <button
            type="submit"
            style={{ ...buttonStyle, marginLeft: '10px' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing
              </span>
            ) : (
              "Send"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInput; 