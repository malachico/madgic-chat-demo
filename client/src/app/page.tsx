'use client'
import { FormEvent, useEffect, useRef, useState } from "react";
import ChatInput from './components/ChatInput';
import ChatMessage, { ChatMessageProps } from './components/ChatMessage';
import Welcome from './components/Welcome';
import { sendAgentTask, sendChatbotQuery } from './services/api';
import { formatStepResult, parseSSEEvents, updateChatMessage as updateChat } from './utils/chatUtils';
import { StepType } from "./components/Step";

// Styles
const gradientTextStyle = {
  background: 'linear-gradient(90deg, #9333ea, #ec4899)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  display: 'inline-block'
};

export type Mode = 'agent' | 'chatbot';

export default function Home() {
  const [message, setMessage] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<ChatMessageProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mode, setMode] = useState<Mode>('agent');
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of chat when messages change
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message to chat history with a unique ID
    const userMessage: ChatMessageProps = {
      role: "user",
      content: message,
      id: Date.now().toString() + '_user'
    };
    setChatHistory((prev) => [...prev, userMessage]);

    // Create placeholder for assistant response with a unique ID
    const responseId = Date.now().toString();
    setChatHistory((prev) => [
      ...prev,
      { role: "assistant", content: "", id: responseId, thinking: true }
    ]);

    setIsLoading(true);
    setMessage("");

    try {
      if (mode === 'agent') {
        // Handle agent mode
        const response = await sendAgentTask(message);
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("Failed to get response reader");
        }

        const decoder = new TextDecoder();
        let currentThinking = "";
        let finalResponse = "";
        let steps: StepType[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          const events = parseSSEEvents(text);

          for (const event of events) {
            if (event.event === "update") {
              try {
                const data = JSON.parse(event.data);
                if (data.step && data.result) {
                  // Format the step result for display
                  const stepResult = formatStepResult(data.result);
                  
                  // Add to steps array for structured display
                  steps = [
                    ...steps, 
                    {
                      title: data.step,
                      content: stepResult,
                      isCompleted: true,
                      isActive: false,
                      isFinal: data.is_final
                    }
                  ];
                  
                  // Mark the latest step as active
                  if (steps.length > 0) {
                    steps = steps.map((step, index) => ({
                      ...step,
                      isActive: index === steps.length - 1 && !data.is_final
                    }));
                  }

                  // Update thinking content for legacy support
                  currentThinking = `${currentThinking}\n**${data.step}**:\n\`\`\`markdown\n${stepResult}\n\`\`\``;

                  if (data.is_final && data.final_result) {
                    finalResponse = data.final_result;
                    setIsLoading(false);

                    // Update the existing thinking message to stop thinking and mark steps as completed
                    setChatHistory((prev) =>
                      updateChat(prev, responseId, currentThinking, false, true, steps)
                    );

                    // Create a new message for the final response with a new unique ID
                    const finalMessageId = Date.now().toString() + '_final';
                    setChatHistory((prev) => [
                      ...prev,
                      { role: "assistant", content: finalResponse, id: finalMessageId, thinking: false }
                    ]);
                  } else {
                    // Update the message in chat history with structured steps
                    setChatHistory((prev) =>
                      updateChat(prev, responseId, currentThinking, true, false, steps)
                    );
                  }
                }

                if (data.error) {
                  setChatHistory((prev) =>
                    updateChat(prev, responseId, `Error: ${data.error}`, false)
                  );
                }
              } catch (err) {
                console.error("Error parsing SSE event data:", err);
              }
            }
          }
        }
      } else {
        // Handle chatbot mode
        const response = await sendChatbotQuery(message);
        
        if (response.status === 'success' && response.response) {
          setChatHistory((prev) =>
            updateChat(prev, responseId, response.response, false)
          );
        } else {
          setChatHistory((prev) =>
            updateChat(prev, responseId, `Error: ${response.error || 'Unknown error'}`, false)
          );
        }
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setChatHistory((prev) =>
        updateChat(prev, responseId, `Error: ${errorMessage}`, false)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setChatHistory([]);
    setMessage("");
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Header area with new chat button and mode selection */}
      <header className="bg-white bg-opacity-80 backdrop-blur-sm border-b border-gray-200 py-3 px-6 z-10 sticky top-0">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold" style={gradientTextStyle}>AI Assistant</h1>
          </div>
          {chatHistory.length > 0 && (
            <button
              onClick={handleNewChat}
              className="bg-white text-gray-700 px-4 py-2 rounded-full shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors duration-200 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Chat
            </button>
          )}
        </div>
      </header>

      {/* Chat Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto py-6 px-4 sm:px-6"
      >
        <div className="space-y-6 max-w-3xl mx-auto">
          {/* Welcome Message */}
          {chatHistory.length === 0 && (
            <Welcome gradientTextStyle={gradientTextStyle} setMessage={setMessage} />
          )}

          {/* Chat Messages */}
          {chatHistory.map((msg, index) => (
            <ChatMessage
              key={index}
              role={msg.role}
              content={msg.content}
              id={msg.id}
              thinking={msg.thinking}
              isStepsCompleted={msg.isStepsCompleted}
              steps={msg.steps}
              mode={mode}
            />
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 z-10 bg-white bg-opacity-80 backdrop-blur-sm border-t border-gray-200 py-3">
        <div className="max-w-3xl mx-auto">
          <ChatInput
            message={message}
            setMessage={setMessage}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            mode={mode}
            setMode={setMode}
          />
        </div>
      </div>

      <style jsx global>{`
        .markdown-content a {
            text-decoration: underline;
            color: #9333ea;
        }
        /* Add styles to wrap text in code blocks */
        .markdown-content pre,
        .markdown-content code {
            white-space: pre-wrap; /* Ensure text wraps */
            overflow-wrap: break-word; /* Break long words if necessary */
            word-break: break-all; /* Break all characters if word-wrap is not enough */
            /* Remove potential default overflow-x */
            overflow-x: hidden;
            background-color: rgba(249, 250, 251, 0.8);
            border-radius: 0.375rem;
            padding: 0.75rem;
            font-size: 0.875rem;
            border: 1px solid rgba(209, 213, 219, 0.5);
        }
        
        /* Custom scrollbar for the chat container */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(243, 244, 246, 0.5);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(209, 213, 219, 0.7);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.8);
        }
      `}</style>
    </div>
  );
}
