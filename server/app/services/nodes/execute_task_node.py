from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_core.agents import AgentAction
from ..agent_state import AgentState
from .utils import get_llm

async def execute_task_node(state: AgentState) -> AgentState:
    """
    Executes the current task using the LLM or appropriate MCP tools.
    Updates results and increments the task index.
    Also extracts ads from tool outputs and updates state['ads'].
    """
    _llm = get_llm()
    if _llm is None:
         # Ensure ads list is carried over even if LLM is missing and we skip
         existing_ads = state.get("ads", [])
         return {**state, "current_task_index": state["current_task_index"] + 1, "ads": existing_ads}

    if state["plan"] is None or state["current_task_index"] >= len(state["plan"]):
        # Skip this task and move to next step
         existing_ads = state.get("ads", [])
         return {**state, "current_task_index": state["current_task_index"] + 1, "ads": existing_ads}


    current_task_description = state["plan"][state["current_task_index"]]
    task_result = ""
    newly_fetched_ads = [] # Initialize a list to collect ads from this execution

    try:
        tools = state.get("tools", [])
        if tools:
            
            # Create a tool-calling agent with the MCP tools
            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are an AI assistant tasked with executing the following subtask by using available tools: {task}. \
                 If you can answer without using a tool, you can do so. \
                 you can use the tools to answer the user's request. \
                 Use the most appropriate tool for the task. \
                 If the current data involves a product or service, use the get_contextual_ads tool with a robust context about the product or service. \
                 If you got an ad from the get_contextual_ads tool, you have to return it exactly as you received in the response so it will be availalbe for the final response. \
                 examples: \
                    •   If the user asks about travel to Europe, fetch ads related to travel to Europe \
                    with context: \"travel options, destinations, deals, and packages for visiting Europe.\"   \
                    •   If the user asks about a new iPhone, fetch ads for smartphones \
                    with context: \"latest iPhone models, smartphone features, accessories, and upgrade offers.\" \
                    •   If the user asks about weight loss tips, fetch ads for health and fitness \
                    with context: \"weight loss programs, fitness plans, dietary supplements, and healthy lifestyle services.\" \
                    •   If the user asks how to file crypto taxes, fetch ads for tax and finance tools \
                    with context: \"crypto tax reporting platforms, accounting software, and financial advisory services.\" \
                    •   If the user asks about project management software, fetch ads for productivity tools \
                    with context: \"project management platforms, team collaboration apps, and workflow optimization tools.\" \
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
            
            # Check intermediate steps for tool calls and their outputs
            intermediate_steps = agent_response.get("intermediate_steps", [])
            
            for step in intermediate_steps:
                # A step is typically (AgentAction, tool_output)
                if isinstance(step, tuple) and len(step) == 2:
                    action, observation = step
                    # Check if the action is a tool call and specifically the ads tool
                    if isinstance(action, AgentAction) and action.tool == 'get_contextual_ads':
                        # Append the tool's raw output (the ad) to our list
                        if observation != '':
                            newly_fetched_ads.append(observation)
                       
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
        
        # Update ads by taking existing ads and adding newly fetched ones
        existing_ads = state.get("ads", [])
        if not isinstance(existing_ads, list):
             print(f"Warning: state['ads'] is not a list ({type(existing_ads)}), initializing as list.")
             existing_ads = [] # Reset if it's in a wrong format or unexpected type

        new_ads = existing_ads + newly_fetched_ads

        # Increment the task index for the next task
        new_task_index = state["current_task_index"] + 1
        
        return {
            **state,
            "results": new_results,
            "ads": new_ads, 
            "current_task_index": new_task_index
        }
    except Exception as e:
        # Log the error for debugging
        print(f"Error executing task '{current_task_description}': {e}")
        import traceback
        traceback.print_exc() # Print full traceback

        # Increment the task index to skip this task on error
        new_task_index = state["current_task_index"] + 1
        # On error, we typically just move on, but ensure existing state (like ads) is carried over
        existing_ads = state.get("ads", [])
        return {
            **state,
            "current_task_index": new_task_index,
            "ads": existing_ads # Carry over ads even on error
        }