from typing import TypedDict, List, Dict, Optional
from langchain_core.tools import BaseTool

class AgentState(TypedDict):
    task: str # The initial high-level task
    plan: Optional[List[str]] # List of sub-tasks
    current_task_index: int # Index to track the current sub-task
    results: Dict[str, str] # To store results of each sub-task
    final_result: Optional[str] # Final response to the task
    error: Optional[str] # To store any error messages
    tools: Optional[List[BaseTool]] # List of available tools 