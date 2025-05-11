import { ChatMessageProps } from '../components/ChatMessage';
import { StepType } from '../components/Step';
import { Mode } from '../page';
export interface SSEEvent {
  event: string;
  data: string;
}

/**
 * Parse Server-Sent Events from a text string
 * @param text - The raw SSE text to parse
 * @returns Array of parsed SSE events
 */
export const parseSSEEvents = (text: string): SSEEvent[] => {
  const lines = text.split("\n");
  const events: SSEEvent[] = [];
  
  let currentEvent: SSEEvent = { event: "", data: "" };
  
  for (const line of lines) {
    if (line.startsWith("event:")) {
      currentEvent.event = line.substring(6).trim();
    } else if (line.startsWith("data:")) {
      currentEvent.data = line.substring(5).trim();
    } else if (line === "" && currentEvent.event && currentEvent.data) {
      events.push({ ...currentEvent });
      currentEvent = { event: "", data: "" };
    }
  }
  
  return events;
};

/**
 * Extract displayable content from a step result
 * @param stepResult - The raw step result from the agent
 * @returns Formatted step result for display
 */
export const formatStepResult = (stepResult: string): string => {
  if (typeof stepResult !== 'string') {
    return JSON.stringify(stepResult, null, 2);
  }
  
  // Attempt to extract markdown content if it has the "Agent execution result: " prefix
  const resultPrefix = "Agent execution result: ";
  if (stepResult.startsWith(resultPrefix)) {
    return stepResult.substring(resultPrefix.length).trim();
  }
  
  return stepResult;
};

/**
 * Updates a chat message in the chat history array
 * @param chatHistory - The current chat history array
 * @param id - The ID of the message to update
 * @param content - The new content for the message
 * @param thinking - Whether the message should show thinking state
 * @param isStepsCompleted - Whether the steps are completed for this message
 * @param steps - Array of structured steps for the message
 * @returns Updated chat history array
 */
export const updateChatMessage = (
  chatHistory: ChatMessageProps[],
  id: string,
  content: string,
  thinking: boolean,
  isStepsCompleted: boolean = false,
  steps?: StepType[],
  mode?: Mode
): ChatMessageProps[] => {
  return chatHistory.map((msg) =>
    msg.id === id ? { ...msg, content, thinking, isStepsCompleted, steps, mode } : msg
  );
}; 