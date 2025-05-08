from langgraph.graph import StateGraph, END
from langchain_core.language_models import BaseChatModel # Import BaseChatModel type hint
from .agent_state import AgentState
from .nodes import plan_node, execute_task_node, generate_final_result_node, handle_error_node, should_continue

def build_graph(llm: BaseChatModel):
    """
    Builds the LangGraph workflow.

    Args:
        llm: The language model to use in the nodes.

    Returns:
        A compiled LangGraph application.
    """
    # Create the workflow graph
    workflow = StateGraph(AgentState)

    # Add nodes
    workflow.add_node("planner", plan_node)
    workflow.add_node("execute_task", execute_task_node)
    workflow.add_node("generate_final_result", generate_final_result_node)
    workflow.add_node("handle_error", handle_error_node)

    # Set entry point
    workflow.set_entry_point("planner")

    # Add edges
    # From plan, always go to execute_task (error handling is within should_continue)
    workflow.add_edge("planner", "execute_task")

    # From execute_task, use conditional logic
    workflow.add_conditional_edges(
        "execute_task",
        should_continue,
        {
            "execute_task": "execute_task", # Loop back to execute if more tasks
            "generate_final_result": "generate_final_result",  # Go to generate_final_result if all tasks done
            "handle_error": "handle_error"  # Go to error if execution failed
        }
    )

    # From generate_final_result, end the workflow
    workflow.add_edge("generate_final_result", END)

    # From error handler, end the workflow
    workflow.add_edge("handle_error", END)

    # Compile the graph
    app = workflow.compile()
    
    return app 