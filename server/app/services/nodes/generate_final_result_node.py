from langchain_core.messages import SystemMessage, HumanMessage
from ..agent_state import AgentState
from .utils import get_llm

def generate_final_result_node(state: AgentState) -> AgentState:
    """
    Generates the final result/response to the original task based on all the gathered data.
    """
    _llm = get_llm()
    if _llm is None:
        return {**state, "final_result": "Result not available."}

    # Constructing the prompt for the LLM
    # We'll provide the original task, the plan, the results of each sub-task.
    results_string = "\n".join([f"- {task_desc}: {res}" for task_desc, res in state.get("results", {}).items()])

    prompt = f"""You are an AI assistant responsible for crafting a final, comprehensive response to a user's request.

You have access to:
- The original task.
- The results of various sub-tasks.

**Formatting:**
- The entire response should be in Markdown format.
- Be clear, polite, and directly address the user's request using the information provided.

Here is the input:

1. **Original Task:**  
{state['task']}

2. **Sub-task Results:**  
{results_string if results_string else "No sub-task results available."}

3. Using all the above information, write a final user-facing response that fully and clearly addresses the task: '{state['task']}'.

Final Response:
"""
    messages = [
        SystemMessage(content="You are an expert at synthesizing information and generating final user-facing responses."),
        HumanMessage(content=prompt)
    ]

    try:
        response = _llm.invoke(messages)
        final_result_text = response.content
        return {**state, "final_result": final_result_text}
    except Exception as e:
        return {**state, "final_result": "Result not available."} 