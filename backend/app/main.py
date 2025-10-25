from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv

from .database import engine, get_db, Base
from .routers import polls, votes, likes
from .websocket_manager import manager
from . import crud, schemas

load_dotenv()

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="QuickPoll API",
    description="Real-time polling platform API",
    version="1.0.0"
)

# CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(polls.router)
app.include_router(votes.router)
app.include_router(likes.router)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to QuickPoll API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            
            # Handle poll subscription
            if data.get("type") == "subscribe" and "poll_id" in data:
                manager.subscribe_to_poll(websocket, data["poll_id"])
                await websocket.send_json({
                    "type": "subscribed",
                    "poll_id": data["poll_id"]
                })
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)