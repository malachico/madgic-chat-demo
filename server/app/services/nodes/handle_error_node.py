from ..agent_state import AgentState

def handle_error_node(state: AgentState) -> AgentState:
    """
    Handles errors by logging them and continuing to the next step without sending the error to the client.
    """
    # Clear the error and increment the task index to skip this step
    new_task_index = state.get("current_task_index", 0) + 1
    
    # Return state without the error, ready to continue
    return {**state, "current_task_index": new_task_index, "error": None} 