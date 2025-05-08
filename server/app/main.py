import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from .routes import mcp

# Load environment variables
load_dotenv()

# Ensure GOOGLE_API_KEY is set
if "GOOGLE_API_KEY" not in os.environ:
    raise ValueError("GOOGLE_API_KEY not found in environment variables. Please set it in your .env file.")

app = FastAPI(
    title="MCP Agent Server",
    description="A server that provides MCP agent capabilities through a REST API",
    version="1.0.0"
)

allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # Use environment variable in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(mcp.router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    return {"status": "healthy"} 