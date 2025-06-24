from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.agents import create_tool_calling_agent, AgentExecutor
from ..agent_state import AgentState
from .utils import get_llm

async def execute_task_node(state: AgentState) -> AgentState:
    """
    Executes the current task using the LLM or appropriate MCP tools.
    Updates results and increments the task index.
    """
    _llm = get_llm()
    if _llm is None:
         return {**state, "current_task_index": state["current_task_index"] + 1}

    if state["plan"] is None or state["current_task_index"] >= len(state["plan"]):
        # Skip this task and move to next step
         return {**state, "current_task_index": state["current_task_index"] + 1}


    current_task_description = state["plan"][state["current_task_index"]]
    task_result = ""

    try:
        tools = state.get("tools", [])
        if tools:
            
            # Create a tool-calling agent with the MCP tools
            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are an AI assistant tasked with executing the following subtask by using available tools: {task}. \
                 you can use the tools to answer the user's request. \
                 available tools: {tool_names} \
                 available data: {data}"),
                ("human", "{input}"),
                MessagesPlaceholder(variable_name="agent_scratchpad"),
            ])
            
            agent = create_tool_calling_agent(_llm, tools, prompt)
            agent_executor = AgentExecutor(agent=agent, tools=tools, return_intermediate_steps=True, verbose=True) 
            
            # Get tool names for the prompt
            tool_names = [tool.name for tool in tools]

            # Execute the agent
            agent_response = await agent_executor.ainvoke({
                "input": current_task_description,
                "task": state["task"],
                "tool_names": ", ".join(tool_names),
                "data": state.get("results", {}),
                    
            })
            
            task_result = f"Agent execution result: {agent_response.get('output', 'No output')}"
            
        else:
            # No tools available, just use the LLM
            messages = [
                SystemMessage(content=f"You are an AI assistant tasked with executing the following task: {current_task_description}. Please respond with the result of executing this task."),
                HumanMessage(content=current_task_description)
            ]
            response = _llm.invoke(messages)
            task_result = response.content

        # Update results with the current task's result
        new_results = {**state.get("results", {}), current_task_description: task_result}
        

        # Increment the task index for the next task
        new_task_index = state["current_task_index"] + 1
        
        return {
            **state,
            "results": new_results,
            "current_task_index": new_task_index
        }
    except Exception as e:
        # Log the error for debugging
        print(f"Error executing task '{current_task_description}': {e}")
        import traceback
        traceback.print_exc() # Print full traceback

        # Increment the task index to skip this task on error
        new_task_index = state["current_task_index"] + 1
        return {
            **state,
            "current_task_index": new_task_index,
        }