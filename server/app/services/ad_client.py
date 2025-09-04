import os
import aiohttp
from typing import Dict, Any, Optional
import asyncio

class AdServerClient:
    def __init__(self):
        self.base_url = os.getenv('ADSERVER_URL', '')
        self.api_key = os.getenv('MADGIC_API_KEY', '')
        self.timeout = aiohttp.ClientTimeout(total=5.0)  # 5 second timeout
        
    async def initialize_stream(self, content_type: str = "chat", language: str = "en") -> Optional[str]:
        """Initialize a new ad stream session"""
        if not self.base_url or not self.api_key:
            return None
            
        try:
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                async with session.post(
                    f"{self.base_url}/api/v1/streams",
                    json={
                        "content_type": content_type,
                        "language": language,
                        "settings": {
                            "ad_frequency": "moderate"
                        }
                    },
                    headers={
                        "x-api-key": self.api_key,
                        "Content-Type": "application/json"
                    }
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data.get("stream_id")
                    else:
                        print(f"Failed to initialize ad stream: {response.status}")
                        return None
        except Exception as e:
            print(f"Error initializing ad stream: {str(e)}")
            return None
    
    async def process_chunk(self, stream_id: str, content: str, sequence: int, total_length: int) -> Dict[str, Any]:
        """Process a content chunk through the ad server"""
        if not self.base_url or not self.api_key or not stream_id:
            return {"processed_content": content, "ads_added": []}
            
        try:
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                async with session.post(
                    f"{self.base_url}/api/v1/streams/{stream_id}/chunks",
                    json={
                        "content": content,
                        "sequence": sequence,
                        "total_length_so_far": total_length
                    },
                    headers={
                        "x-api-key": self.api_key,
                        "Content-Type": "application/json"
                    }
                ) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        print(f"Failed to process chunk: {response.status}")
                        return {"processed_content": content, "ads_added": []}
        except Exception as e:
            print(f"Error processing chunk: {str(e)}")
            return {"processed_content": content, "ads_added": []}
    
    async def finalize_stream(self, stream_id: str, total_chunks: int, final_word_count: int) -> bool:
        """Finalize the ad stream session"""
        if not self.base_url or not self.api_key or not stream_id:
            return True
            
        try:
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                async with session.post(
                    f"{self.base_url}/api/v1/streams/{stream_id}/finalize",
                    json={
                        "total_chunks": total_chunks,
                        "final_word_count": final_word_count
                    },
                    headers={
                        "x-api-key": self.api_key,
                        "Content-Type": "application/json"
                    }
                ) as response:
                    return response.status == 200
        except Exception as e:
            print(f"Error finalizing stream: {str(e)}")
            return False

# Global client instance
ad_client = AdServerClient()