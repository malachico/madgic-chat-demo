/**
 * API service for communicating with the backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * Send a task to the MCP agent
 * @param task - The task to send to the agent
 * @param threadId - Optional thread ID for conversation tracking
 * @returns Response readable stream for SSE processing
 */
export const sendAgentTask = async (task: string, threadId?: string): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/mcp`, {
    method: "POST", 
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ task, thread_id: threadId })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response;
};

/**
 * Send a query to the chatbot
 * @param prompt - The prompt to send to the chatbot
 * @returns JSON response with the chatbot's response
 */
export const sendChatbotQuery = async (prompt: string) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Send a task to the MCP agent synchronously (non-streaming)
 * @param task - The task to send to the agent
 * @param threadId - Optional thread ID for conversation tracking
 * @returns JSON response with the final result
 */
export const sendAgentTaskSync = async (task: string, threadId?: string) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/mcp/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ task, thread_id: threadId })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}; 