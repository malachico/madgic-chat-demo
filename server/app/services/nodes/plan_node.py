from langchain_core.messages import SystemMessage, HumanMessage
from ..agent_state import AgentState
from .utils import get_llm

def plan_node(state: AgentState) -> AgentState:
    """
    Analyzes the high-level task and breaks it down into subtasks using the LLM.
    Stores the plan in the state.
    """
    _llm = get_llm()
    if _llm is None:
        # Create a fallback plan
        subtasks = [f"Execute the task: {state['task']}"]
        return {**state, "plan": subtasks, "current_task_index": 0, "results": {}}
    
    # Get tools from the state
    tools = state.get("tools", [])
    tool_descriptions = "\n".join([f"- {tool.name}: {tool.description}" for tool in tools]) if tools else "No tools available."

    prompt = f'''You are a planning assistant.
Given the high-level task: '{state['task']}'

You have access to the following tools:
{tool_descriptions}

You can search the web using the google_search tool.
you can only use the google_search tool once in the entire plan.

Break down the high-level task into a series of clear, executable subtasks, considering the capabilities of the available tools. 
If a subtask requires a tool, make sure to include that in the plan description.

Respond with a list of subtasks, one per line, prefixed with a hyphen.
'''

    messages = [SystemMessage(content=prompt), HumanMessage(content=state['task'])]

    try:
        response = _llm.invoke(messages)
        # Assuming the LLM returns a string with tasks separated by newlines and hyphens
        subtasks = [s.strip().lstrip('-').strip() for s in response.content.strip().split('\n') if s.strip() and s.strip().startswith('-')]
        if not subtasks:
             # Fallback if LLM doesn't format as expected
             subtasks = [f"Execute the task: {state['task']}"]

        return {**state, "plan": subtasks, "current_task_index": 0, "results": {}}
    except Exception as e:
        # If planning fails, create a simple default plan
        subtasks = [f"Execute the task: {state['task']}"]
        return {**state, "plan": subtasks, "current_task_index": 0, "results": {}} 