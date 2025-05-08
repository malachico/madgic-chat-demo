from langchain_core.language_models import BaseChatModel
from ..agent_state import AgentState

# Global variable for LLM (initialized by main)
_llm: BaseChatModel | None = None

def set_llm_and_tools(llm: BaseChatModel):
    """Set the LLM to be used by the nodes."""
    global _llm
    _llm = llm

def should_continue(state: AgentState) -> str:
    """
    Determines the next step based on the current state.
    Returns: "execute_task" or "generate_final_result" to trigger the appropriate node.
    """
    # If we have a plan and current index is within plan bounds, continue execution
    if state.get("plan") and state.get("current_task_index", 0) < len(state["plan"]):
        return "execute_task"

    # Otherwise, we've finished the plan and should generate_final_result
    return "generate_final_result" 

def get_llm():
    """Get the LLM instance."""
    return _llm 