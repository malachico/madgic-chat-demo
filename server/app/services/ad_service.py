import os
import aiohttp

ADSERVER_URL = os.getenv('ADSERVER_URL')
MADGIC_API_KEY = os.getenv('MADGIC_API_KEY', '')

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