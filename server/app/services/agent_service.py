from typing import Dict, Any, Optional, AsyncGenerator
from langchain_google_genai import ChatGoogleGenerativeAI
from .graph import build_graph
from .nodes import set_llm_and_tools
from .tools import init_mcp_client, cleanup_mcp_client, get_tools

async def run_agent_task(task: str, thread_id: Optional[str] = None) -> AsyncGenerator[Dict[str, Any], None]:
    """
    Runs the LangGraph agent for a given task and yields each state update.
    
    Args:
        task: The task to execute
        thread_id: Optional thread ID for conversation tracking
        
    Yields:
        Dict containing each step's state information
    """
    try:
        # Initialize MCP client and get tools
        await init_mcp_client()
        mcp_tools = await get_tools()
        
        # Initialize LLM
        llm = ChatGoogleGenerativeAI(model="models/gemini-2.5-flash", temperature=0.3)
        
        # Set the initialized LLM and tools
        set_llm_and_tools(llm)
        
        # Build the LangGraph app
        app = build_graph(llm)
        
        # Use provided thread_id or generate a new one
        config = {"configurable": {"thread_id": thread_id or "default_thread"}}
        
        inputs = {
            "task": task,
            "current_task_index": 0,
            "results": {},
            "plan": None,
            "error": None,
            "tools": mcp_tools
        }
        
        final_state = None
        step_count = 0
        
        # Yield each state update as it comes in
        async for event in app.astream(inputs, config, stream_mode="values"):
            step_count += 1
            # Add step information to the state
            event["step"] = step_count
            event["is_final"] = False
            
            yield event
            final_state = event
            
        if final_state:
            # Mark the final state
            final_state["is_final"] = True
            yield final_state
        else:
            yield {
                "error": "No final state captured",
                "is_final": True,
                "step": step_count + 1
            }
            
    except Exception as e:
        # Yield any exceptions that occur
        yield {
            "error": str(e),
            "is_final": True,
            "step": step_count if 'step_count' in locals() else 1
        }
    finally:
        # Clean up the MCP client resources
        await cleanup_mcp_client() 