# Madgic.ai Agent Demo

## Overview
This project demonstrates the capabilities of [madgic.ai](https://madgic.ai) to connect AI agents in real-time. It showcases how multiple agents can communicate, collaborate, and perform tasks together in a distributed environment.

You can find a live version of this demo at [chat.madgic.ai](https://chat.madgic.ai).

## Tech Stack

### Frontend
- Next.js 15.3.2
- React 19.0.0
- TypeScript 5
- TailwindCSS 4
- React Markdown

### Backend
- Python with FastAPI
- Uvicorn server
- LangChain & LangGraph for agent orchestration
- Integration with multiple LLM providers:
  - Anthropic
  - Google AI

## Project Structure
```
.
├── client/         # Next.js frontend application
├── server/         # Python FastAPI backend
│   ├── app/        # Application code
│   ├── static/     # Static files
│   └── run.py      # Server entry point
```

## Getting Started

### Prerequisites
- Node.js (for frontend)
- Python 3.10+ (for backend)
- API keys for supported LLM services

### Installation

#### Frontend
```bash
cd client
npm install
npm run dev
```

#### Backend
```bash
cd server
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

## Usage
1. Start both the frontend and backend servers
2. Navigate to http://localhost:3000 in your browser
3. Interact with the agent interface to observe real-time agent collaboration

## Features
- Multi-agent conversations
- Real-time agent interactions
- Integration with multiple LLM providers
- Customizable agent behaviors

## Live Demo
Visit [chat.madgic.ai](https://chat.madgic.ai) to see the demo in action.

## Learn More
For more information about madgic.ai and its capabilities, visit [madgic.ai](https://madgic.ai). 