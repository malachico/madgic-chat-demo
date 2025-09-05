'use client'
import Image from "next/image";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import ChatInput from './components/ChatInput';
import ChatMessage, { ChatMessageProps } from './components/ChatMessage';
import { StepType } from "./components/Step";
import Welcome from './components/Welcome';
import { sendAgentTask, sendChatbotQuery, sendChatbotQueryStream } from './services/api';
import { formatStepResult, parseSSEEvents, updateChatMessage as updateChat } from './utils/chatUtils';

export type Mode = 'agent' | 'chatbot';
export type StreamMode = 'stream' | 'normal';

export default function Home() {
  const [message, setMessage] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<ChatMessageProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mode, setMode] = useState<Mode>('chatbot');
  const [streamMode, setStreamMode] = useState<StreamMode>('stream');
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
  const [showScrollButton, setShowScrollButton] = useState<boolean>(false);

  // Auto-scroll to bottom of chat when messages change
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
      setIsAtBottom(true);
      setShowScrollButton(false);
    }
  };

  // Check if user is at bottom of scroll container
  const checkScrollPosition = useCallback(() => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const threshold = 100; // pixels from bottom
      const atBottom = scrollHeight - scrollTop - clientHeight < threshold;
      setIsAtBottom(atBottom);
      setShowScrollButton(!atBottom && chatHistory.length > 0);
    }
  }, [chatHistory.length]);

  // Auto-scroll only if user is at bottom
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [chatHistory, isAtBottom]);

  // Add scroll event listener
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener('scroll', checkScrollPosition);
      return () => {
        chatContainer.removeEventListener('scroll', checkScrollPosition);
      };
    }
  }, [checkScrollPosition]);

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
      { role: "assistant", content: "", id: responseId, thinking: true, mode }
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
        if (streamMode === 'stream') {
          // Handle streaming chatbot mode
          const response = await sendChatbotQueryStream(message);
          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error("Failed to get response reader");
          }

          const decoder = new TextDecoder();
          let fullResponse = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const text = decoder.decode(value);
            const events = parseSSEEvents(text);

            for (const event of events) {
              if (event.event === "update") {
                try {
                  const data = JSON.parse(event.data);
                  
                  if (data.status === "streaming" && data.chunk) {
                    // Update with streaming chunk
                    fullResponse = data.full_response || fullResponse + data.chunk;
                    setChatHistory((prev) =>
                      updateChat(prev, responseId, fullResponse, true, false, undefined, mode)
                    );
                  } else if (data.is_final) {
                    // Final response received
                    fullResponse = data.full_response || fullResponse;
                    setChatHistory((prev) =>
                      updateChat(prev, responseId, fullResponse, false, false, undefined, mode)
                    );
                    setIsLoading(false);
                  }
                } catch (err) {
                  console.error("Error parsing SSE event data:", err);
                }
              } else if (event.event === "error") {
                try {
                  const data = JSON.parse(event.data);
                  setChatHistory((prev) =>
                    updateChat(prev, responseId, `Error: ${data.error}`, false, false, undefined, mode)
                  );
                  setIsLoading(false);
                } catch (err) {
                  console.error("Error parsing SSE error event:", err);
                }
              }
            }
          }
        } else {
          // Handle non-streaming chatbot mode
          const response = await sendChatbotQuery(message);
          
          if (response.status === 'success' && response.response) {
            setChatHistory((prev) =>
              updateChat(prev, responseId, response.response, false, false, undefined, mode)
            );
          } else {
            setChatHistory((prev) =>
              updateChat(prev, responseId, `Error: ${response.error || 'Unknown error'}`, false, false, undefined, mode)
            );
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setChatHistory((prev) =>
        updateChat(prev, responseId, `Error: ${errorMessage}`, false, false, undefined, mode)
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
      <header>
  <div className="flex justify-between items-center">
    <div className="flex items-center space-x-3">
      <div>
        <Image src="/logo.png" alt="Logo" width={60} height={36} />
      </div>
      <h1 className="text-xl font-semibold">Madgic Chat</h1>
    </div>
    {chatHistory.length > 0 && (
      <button onClick={handleNewChat}>
        <svg
          className="w-4 h-4 inline-block mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        <span>New Chat</span>
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
                  mode={msg.mode || mode}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <div className="fixed bottom-20 right-6 z-40">
          <button
            onClick={scrollToBottom}
            className="bg-white text-gray-700 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-quick p-3 focus-ring flex items-center justify-center"
            title="Scroll to bottom"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      )}

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
            streamMode={streamMode}
            setStreamMode={setStreamMode}
          />
        </div>
      </div>
    </div>
  );
}
