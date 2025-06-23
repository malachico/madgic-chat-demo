import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Step, { StepType } from './Step';
import { TbUser } from "react-icons/tb";
import { RiRobot3Line } from "react-icons/ri";


export interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  id?: string;
  thinking?: boolean;
  isStepsCompleted?: boolean;
  steps?: StepType[];
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  id,
  thinking = false,
  isStepsCompleted = false,
  steps = [],
}) => {
  const [timestamp] = useState(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));

  const extractStepsFromContent = () => {
    if (!content) return [];

    // Simple parsing of markdown to extract steps
    const lines = content.split('\n');
    const extractedSteps: { title: string; content: string; isCompleted: boolean; isActive: boolean; isFinal?: boolean }[] = [];

    let currentStep: { title: string; content: string; isCompleted: boolean; isActive: boolean; isFinal?: boolean } | null = null;

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
    <div className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[80%] ${role === "user" ? "flex-row-reverse" : "flex-row"} items-start space-x-3`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${role === "user" ? "ml-3" : "mr-3"}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white ${role === "user"
              ? "bg-blue-600"
              : "bg-gray-600"
            }`}>
            {role === "user" ? <TbUser /> : <RiRobot3Line />}
          </div>
        </div>

        {/* Message Content */}
        <div
          id={id ? `msg-${id}` : undefined}
          className={`relative max-w-none ${role === "user"
              ? "bg-white text-gray-900 rounded-2xl rounded-tr-md shadow-soft p-4"
              : "text-gray-900"
            }`}
        >
          {thinking ? (
            <div className="space-y-4">
              {messageSteps.length > 0 ? (
                messageSteps.map((step, index) => (
                  <Step
                    key={index}
                    title={step.title}
                    content={step.content}
                    isCompleted={step.isCompleted}
                    isActive={step.isActive}
                    isFinal={step.isFinal || false}
                  />
                ))
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-500">Thinking...</span>
                </div>
              )}
            </div>
          ) : isStepsCompleted ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Processing Complete</span>
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              </div>
              <details className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <summary className="cursor-pointer text-sm font-medium text-gray-600 flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>View Processing Steps</span>
                </summary>
                <div className="mt-3 space-y-2">
                  {messageSteps.map((step, index) => (
                    <Step
                      key={index}
                      title={step.title}
                      content={step.content}
                      isCompleted={true}
                      isActive={false}
                      isFinal={step.isFinal || false}
                    />
                  ))}
                </div>
              </details>
            </div>
          ) : (
            <div
              id={id ? `msg-content-${id}` : undefined}
              className="markdown-content prose prose-sm max-w-none"
            >
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}

          {/* Timestamp */}
          <div className={`text-xs mt-3 text-gray-400`}>
            {timestamp}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage; 