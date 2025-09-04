import os
import aiohttp
from typing import Optional
from .ad_client import ad_client

ADSERVER_URL = os.getenv('ADSERVER_URL')
MADGIC_API_KEY = os.getenv('MADGIC_API_KEY', '')

# non-streaming responses
async def integrate_recommendations(text: str) -> dict:
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{ADSERVER_URL}/api/ads/integrate",
                json={"text": text},
                headers={
                    "x-api-key": MADGIC_API_KEY,
                    "Content-Type": "application/json",
                }
            ) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    print(f"Ad server responded with status {response.status}")
                    return {"data": text}
    except Exception as e:
        print(f"Error integrating recommendations: {str(e)}")
        return {"data": text}

# streaming-based ad integration
class StreamingAdSession:
    def __init__(self, content_type: str = "chat", language: str = "en"):
        self.content_type = content_type
        self.language = language
        self.stream_id: Optional[str] = None
        self.sequence = 1
        self.total_length = 0
        self.total_chunks = 0
        
    async def initialize(self) -> bool:
        """Initialize the streaming ad session"""
        self.stream_id = await ad_client.initialize_stream(
            content_type=self.content_type,
            language=self.language
        )
        return self.stream_id is not None
    
    async def process_chunk(self, content: str) -> str:
        """Process a content chunk and return the processed version"""
        if not self.stream_id:
            return content
            
        self.total_length += len(content)
        self.total_chunks += 1
        
        result = await ad_client.process_chunk(
            stream_id=self.stream_id,
            content=content,
            sequence=self.sequence,
            total_length=self.total_length
        )
        
        self.sequence += 1
        return result.get("processed_content", content)
    
    async def finalize(self) -> bool:
        """Finalize the streaming session"""
        if not self.stream_id:
            return True
            
        word_count = len(str(self.total_length).split()) if self.total_length else 0
        return await ad_client.finalize_stream(
            stream_id=self.stream_id,
            total_chunks=self.total_chunks,
            final_word_count=word_count
        )