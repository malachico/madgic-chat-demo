import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Skeleton from './Skeleton';
import Step from './Step';

export interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  id?: string;
  thinking?: boolean;
  isStepsCompleted?: boolean;
  steps?: { title: string; content: string; isCompleted: boolean; isActive: boolean; isFinal?: boolean }[];
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  id,
  thinking = false,
  isStepsCompleted = false,
  steps = []
}) => {
  const [timestamp] = useState(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));

  const extractStepsFromContent = () => {
    if (!content) return [];

    // Simple parsing of markdown to extract steps
    const lines = content.split('\n');
    const extractedSteps: { title: string; content: string; isCompleted: boolean; isActive: boolean }[] = [];

    let currentStep: { title: string; content: string; isCompleted: boolean; isActive: boolean } | null = null;

    lines.forEach(line => {
      const stepMatch = line.match(/\*\*(.*?)\*\*/);
      if (stepMatch && line.includes('**')) {
        if (currentStep) {
          extractedSteps.push(currentStep);
        }
        currentStep = {
          title: stepMatch[1],
          content: '',
          isCompleted: true,
          isActive: false
        };
      } else if (currentStep) {
        currentStep.content += line + '\n';
      }
    });

    if (currentStep) {
      extractedSteps.push(currentStep);
    }

    // Mark the last step as active if we're still thinking
    if (extractedSteps.length > 0 && thinking) {
      extractedSteps[extractedSteps.length - 1].isCompleted = false;
      extractedSteps[extractedSteps.length - 1].isActive = true;
    }

    return extractedSteps;
  };
  const messageSteps = steps.length > 0 ? steps.filter(step => !step.isFinal) : extractStepsFromContent();

  return (
    <div
      className={`flex ${role === "user" ? "justify-end" : "justify-start"} mb-6`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 ${role === "user" ? "order-2 ml-4" : "order-1 mr-4"}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center 
          ${role === "user" ? "bg-pink-500" : "bg-purple-500"} text-white font-medium text-lg`}>
          {role === "user" ? "U" : "A"}
        </div>
      </div>

      {/* Message content */}
      <div
        id={id ? `msg-${id}` : undefined}
        className={`max-w-[75%] rounded-2xl p-4 ${role === "user"
            ? "order-1 bg-gradient-to-r from-pink-200 to-pink-300 text-gray-800"
            : "order-2 bg-gradient-to-r from-purple-200 to-purple-300 text-gray-800"
          } shadow-md`}
      >
        {thinking ? (
          <>
            <div className="flex items-center mb-3">
              <div className="w-4 h-4 mr-2 rounded-full bg-purple-500 animate-pulse"></div>
            </div>

            {/* Display steps while thinking */}
            <div className="space-y-4">
              {messageSteps.length > 0 ? (
                messageSteps.map((step, index) => (
                  <Step
                    key={index}
                    title={step.title}
                    content={step.content}
                    isCompleted={step.isCompleted}
                    isActive={step.isActive}
                    isFinal={step.isFinal}
                  />
                ))
              ) : (
                <Skeleton type="step" />
              )}
            </div>
          </>
        ) : isStepsCompleted ? (
          <>
            {/* Display completed steps in collapsed view */}
            <div className="font-medium mb-2">Steps Completed</div>
            <details className="mt-2 p-3 bg-white bg-opacity-50 rounded-lg shadow-sm">
              <summary className="cursor-pointer font-medium text-sm text-gray-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View Processing Steps
              </summary>
              <div className="mt-3 space-y-2">
                {messageSteps.map((step, index) => (
                  <Step
                    key={index}
                    title={step.title}
                    content={step.content}
                    isCompleted={true}
                    isActive={false}
                  />
                ))}
              </div>
            </details>
          </>
        ) : (
          // Display final message content with typewriter effect
          <div
            id={id ? `msg-content-${id}` : undefined}
            className="whitespace-pre-wrap markdown-content"
          >
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
        <div className="text-xs text-gray-500 mt-2 text-right">
          {timestamp}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage; 