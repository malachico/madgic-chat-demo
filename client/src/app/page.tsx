'use client'
import { useState, useEffect, useRef, FormEvent } from "react";
import { parseSSEEvents, formatStepResult, updateChatMessage as updateChat } from './utils/chatUtils';
import { sendAgentTask } from './services/api';
import ChatMessage, { ChatMessageProps } from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import Welcome from './components/Welcome';
import SuggestionCards from './components/SuggestionCards';

// Styles
const gradientTextStyle = {
  background: 'linear-gradient(90deg, #9333ea, #ec4899)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  display: 'inline-block'
};

export default function Home() {
  const [message, setMessage] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<ChatMessageProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of chat when messages change
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
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
      // Send task to API
      const response = await sendAgentTask(message);

      // Process the SSE stream
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Failed to get response reader");
      }

      const decoder = new TextDecoder();
      let currentThinking = "";
      let finalResponse = "";

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

                if (data.is_final && data.final_result) {
                  finalResponse = data.final_result;
                  setIsLoading(false);

                  // Update the existing thinking message to stop thinking and mark steps as completed
                  setChatHistory((prev) =>
                    updateChat(prev, responseId, currentThinking, false, true)
                  );

                  // Create a new message for the final response with a new unique ID
                  const finalMessageId = Date.now().toString() + '_final';
                  setChatHistory((prev) => [
                    ...prev,
                    { role: "assistant", content: finalResponse, id: finalMessageId, thinking: false }
                  ]);

                } else {
                  // Format the step result for display
                  const stepResult = formatStepResult(data.result);

                  // Update thinking content
                  currentThinking = `${currentThinking}\n**${data.step}**:\n\`\`\`markdown\n${stepResult}\n\`\`\``;

                  // Update the message in chat history
                  setChatHistory((prev) =>
                    updateChat(prev, responseId, currentThinking, true)
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
    <div className="flex flex-col h-screen bg-gradient-to-b from-pink-50 to-purple-100">
      {/* New Chat Button */}
      {chatHistory.length > 0 && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleNewChat}
            className="bg-white text-gray-800 px-4 py-2 rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200"
          >
            +
          </button>
        </div>
      )}

      {/* Chat Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto py-6 px-4 sm:px-6 max-w-4xl mx-auto w-full"
      >
        <div className="space-y-6">
          {/* Welcome Message */}
          {chatHistory.length === 0 && (
            <Welcome gradientTextStyle={gradientTextStyle} />
          )}

          {/* Suggestion Cards */}
          {chatHistory.length === 0 && (
            <SuggestionCards setMessage={setMessage} />
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
            />
          ))}
        </div>
      </div>

      {/* Input Area */}
      <ChatInput
        message={message}
        setMessage={setMessage}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />

      <style jsx global>{`
        .markdown-content a {
            text-decoration: underline;
        }
        /* Add styles to wrap text in code blocks */
        .markdown-content pre,
        .markdown-content code {
            white-space: pre-wrap; /* Ensure text wraps */
            overflow-wrap: break-word; /* Break long words if necessary */
            word-break: break-all; /* Break all characters if word-wrap is not enough */
            /* Remove potential default overflow-x */
            overflow-x: hidden;
        }
      `}</style>
    </div>
  );
}
