import React from 'react';
import ReactMarkdown from 'react-markdown';

export interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  id?: string;
  thinking?: boolean;
  isStepsCompleted?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  id,
  thinking = false,
  isStepsCompleted = false
}) => {
  return (
    <div
      className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        id={id ? `msg-${id}` : undefined}
        className={`max-w-[80%] rounded-2xl p-4 ${
          role === "user"
            ? "bg-pink-300 text-gray-800"
            : "bg-purple-300 text-gray-800"
        }`}
      >
        {thinking ? (
          <>
            <div className="flex items-center mb-2">
              <div className="w-4 h-4 mr-2 rounded-full bg-purple-200 animate-pulse"></div>
              <span className="font-medium">Thinking...</span>
            </div>
            {/* Display content while thinking */}
            <div
              id={id ? `msg-content-${id}` : undefined}
              className="text-xs whitespace-pre-wrap font-mono bg-gray-50 text-gray-800 p-2 rounded overflow-x-auto markdown-content"
            >
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </>
        ) : isStepsCompleted ? (
          <>
            {/* Display completed steps */}
            <div className="font-medium mb-2">Steps Executed:</div>
            <details className="mt-2 p-2 bg-gray-50 rounded overflow-x-auto">
              <summary className="cursor-pointer font-mono text-sm text-gray-800">Show Steps</summary>
              <div
                id={id ? `msg-content-${id}` : undefined}
                className="text-xs whitespace-pre-wrap text-gray-800 markdown-content"
              >
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            </details>
          </>
        ) : (
          // Display final message content
          <div
            id={id ? `msg-content-${id}` : undefined}
            className="whitespace-pre-wrap markdown-content"
          >
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage; 