from langchain_mcp_adapters.client import MultiServerMCPClient
import os
import json
from langchain_google_community import GoogleSearchAPIWrapper
from langchain_core.tools import Tool

mcp_client = None

async def init_mcp_client():
    """Initialize the MCP client with configured servers."""
    global mcp_client
    
    # Load configuration from config.json
    config_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../config.json")
    
    try:
        with open(config_path, 'r') as f:
            config = json.load(f)
        
        # Get MCP server configurations
        mcp_servers_config = config.get("mcpServers", {})
        
        # Replace API key placeholder with actual key from environment variable
        madgic_api_key = os.environ.get("MADGIC_API_KEY")
        if madgic_api_key and "madgic-mcp" in mcp_servers_config:
            for i, arg in enumerate(mcp_servers_config["madgic-mcp"].get("args", [])):
                if arg.startswith("Authorization: Bearer "):
                    mcp_servers_config["madgic-mcp"]["args"][i] = f"Authorization: Bearer {madgic_api_key}"
        
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error loading config.json: {e}. Using default configuration.")
    
    # Create a new client if it doesn't exist
    if mcp_client is None:
        mcp_client = MultiServerMCPClient(mcp_servers_config)
        await mcp_client.__aenter__()  # Use the async context manager
    
    return mcp_client


async def get_google_search_tool():
    cse_api_key = os.environ["GOOGLE_CSE_API_KEY"]
    if cse_api_key is None:
        raise ValueError("GOOGLE_CSE_API_KEY is not set")
    
    search = GoogleSearchAPIWrapper(google_api_key=cse_api_key)
    tool = Tool(
        name="google_search",
        description="Search Google for recent results.",
        func=search.run,
        
    )
    return tool

async def get_mcp_tools():
    """Get tools from the MCP client and add LangChain Playwright tools."""
    mcp_client = await init_mcp_client()
    return mcp_client.get_tools() if mcp_client else []
    

async def cleanup_mcp_client():
    """Clean up the MCP client resources."""
    global mcp_client
    if mcp_client is not None:
        await mcp_client.__aexit__(None, None, None)
        mcp_client = None 


async def get_tools():
    mcp_tools = await get_mcp_tools()
    google_search_tool = await get_google_search_tool()
    all_tools = mcp_tools + [google_search_tool]
    return all_tools

