'use client'
import { FormEvent, useEffect, useRef, useState } from "react";
import { RiRobot2Line } from "react-icons/ri";
import ChatInput from './components/ChatInput';
import ChatMessage, { ChatMessageProps } from './components/ChatMessage';
import { StepType } from "./components/Step";
import Welcome from './components/Welcome';
import { sendAgentTask, sendChatbotQuery } from './services/api';
import { formatStepResult, parseSSEEvents, updateChatMessage as updateChat } from './utils/chatUtils';

export type Mode = 'agent' | 'chatbot';

export default function Home() {
  const [message, setMessage] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<ChatMessageProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mode, setMode] = useState<Mode>('chatbot');
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
                      isFinal: data.is_final
                    }
                  ];
                  
                  // Mark the latest step as active
                  if (steps.length > 0) {
                    steps = steps.map((step) => ({ ...step }));
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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="glass-surface border-b border-gray-200/50 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <RiRobot2Line className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Madgic Chat</h1>
          </div>
          {chatHistory.length > 0 && (
            <button
              onClick={handleNewChat}
              className="px-4 py-2 bg-white text-gray-700 rounded-full shadow-soft border border-gray-200 hover:bg-gray-50 transition-quick flex items-center space-x-2 focus-ring"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm font-medium">New Chat</span>
            </button>
          )}
        </div>
      </header>

      {/* Chat Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto"
      >
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Welcome Message */}
          {chatHistory.length === 0 && (
            <div className="animate-fade-in">
              <Welcome setMessage={setMessage} />
            </div>
          )}

          {/* Chat Messages */}
          <div className="space-y-6">
            {chatHistory.map((msg, index) => (
              <div key={index} className="animate-slide-up">
                <ChatMessage
                  role={msg.role}
                  content={msg.content}
                  id={msg.id}
                  thinking={msg.thinking}
                  isStepsCompleted={msg.isStepsCompleted}
                  steps={msg.steps}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-transparent px-6 pb-4 sticky bottom-0 z-50">
        <div className="max-w-4xl mx-auto">
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
    </div>
  );
}
