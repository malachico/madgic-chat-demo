from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
from ..services.agent_service import run_agent_task
from ..services.ad_service import integrate_recommendations, StreamingAdSession
from fastapi.responses import RedirectResponse
from sse_starlette.sse import EventSourceResponse
from langchain_google_genai import ChatGoogleGenerativeAI
import json
import asyncio
import os

router = APIRouter()

class MCPRequest(BaseModel):
    task: str
    thread_id: Optional[str] = None

class MCPResponse(BaseModel):
    status: str
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class GeminiRequest(BaseModel):
    prompt: str
    temperature: Optional[float] = 0.7
    model: Optional[str] = "models/gemini-2.5-flash"

class GeminiResponse(BaseModel):
    status: str
    response: Optional[str] = None
    error: Optional[str] = None

@router.get("/")
async def redirect_to_client():
    """Redirect to the SSE client interface."""
    return RedirectResponse(url="/static/index.html")

@router.post("/mcp")
async def handle_mcp_request(request: MCPRequest):
    try:
        # Create an async generator that yields SSE events
        async def event_generator():
            last_step = -1
            try:
                async for state in run_agent_task(request.task, request.thread_id):
                    current_task_index = state.get("current_task_index", 0)
                    is_final = state.get("is_final", False)
                    has_error = state.get("error") is not None

                    # Determine the status based on state information
                    status = "error" if has_error else "in_progress"
                    if is_final and not has_error:
                        status = "success"

                    # Only send an update if the step number has changed or it's the final state/error state
                    if current_task_index > last_step or is_final or has_error:
                        last_step = current_task_index

                        results = state.get("results", {})
                        results_list = list(results.items())
                        
                        last_key, last_value = results_list[-1] if len(results_list)>0 else ('', '')

                        results_list = state.get("results", {})

                        event_data = {
                            "status": status,
                            "step": last_key,
                            "result": last_value,
                            "is_final": is_final,
                            "final_result": state.get("final_result"),
                            "error": state.get("error")
                        }

                        # Stream the extracted information as an SSE event
                        yield {
                            "event": "update",
                            "data": json.dumps(event_data)
                        }

                    # Small delay to prevent overwhelming the client, even if no event was sent
                    await asyncio.sleep(0.01)

            except Exception as e:
                # Send any unexpected errors as events
                yield {
                    "event": "error",
                    "data": json.dumps({
                        "status": "error",
                        "error": str(e),
                        "is_final": True
                    })
                }

        # Return a streaming response with SSE events
        return EventSourceResponse(event_generator())

    except Exception as e:
        # Handle exceptions outside the event stream
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.post("/query", response_model=GeminiResponse)
async def handle_gemini_request(request: GeminiRequest):
    try:
        # Initialize Gemini model
        llm = ChatGoogleGenerativeAI(
            model=request.model,
            temperature=request.temperature
        )
        
        # Get response from Gemini
        response = await llm.ainvoke(request.prompt)
        
        # Integrate recommendations into the response
        response_with_recommendations = await integrate_recommendations(response.content)
        return GeminiResponse(
            status="success",
            response=response_with_recommendations.get('data', response.content)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.post("/query/stream")
async def handle_gemini_stream_request(request: GeminiRequest):
    try:
        # Create an async generator that yields SSE events for streaming Gemini responses
        async def event_generator():
            ad_session = None
            try:
                # Initialize Gemini model
                llm = ChatGoogleGenerativeAI(
                    model=request.model,
                    temperature=request.temperature
                )
                
                # Initialize streaming ad session
                ad_session = StreamingAdSession(content_type="chat", language="en")
                await ad_session.initialize()
                
                full_response = ""
                last_processed_chunk = ""
                
                # Stream response from Gemini with ad integration
                async for chunk in llm.astream(request.prompt):
                    if hasattr(chunk, 'content') and chunk.content:
                        # Process chunk through ad server immediately
                        processed_chunk = await ad_session.process_chunk(chunk.content)
                        full_response += processed_chunk
                        last_processed_chunk = processed_chunk
                        
                        # Send processed chunk as SSE event
                        yield {
                            "event": "update",
                            "data": json.dumps({
                                "status": "streaming",
                                "chunk": processed_chunk,
                                "full_response": full_response,
                                "is_final": False
                            })
                        }
                        
                        # Small delay to prevent overwhelming the client
                        await asyncio.sleep(0.01)
                
                # Finalize the ad session
                if ad_session:
                    await ad_session.finalize()
                
                # Send final event with the last chunk content (not empty)
                yield {
                    "event": "update", 
                    "data": json.dumps({
                        "status": "success",
                        "chunk": last_processed_chunk,
                        "full_response": full_response,
                        "is_final": True
                    })
                }
                
            except Exception as e:
                # Cleanup ad session on error
                if ad_session:
                    await ad_session.finalize()
                
                # Send any unexpected errors as events
                yield {
                    "event": "error",
                    "data": json.dumps({
                        "status": "error",
                        "error": str(e),
                        "is_final": True
                    })
                }

        # Return a streaming response with SSE events
        return EventSourceResponse(event_generator())

    except Exception as e:
        # Handle exceptions outside the event stream
        raise HTTPException(
            status_code=500,
            detail=str(e)
        ) 