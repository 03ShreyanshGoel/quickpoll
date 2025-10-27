from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv
import logging

from .database import engine, get_db, Base
from . import crud, schemas, models
from .websocket_manager import manager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="QuickPoll API",
    description="Real-time polling platform with WebSocket support",
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

# ============= REST API ENDPOINTS =============

@app.get("/")
def read_root():
    return {
        "message": "QuickPoll API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# POLLS
@app.post("/polls/", response_model=schemas.PollResponse, status_code=status.HTTP_201_CREATED)
async def create_poll(poll: schemas.PollCreate, db: Session = Depends(get_db)):
    """Create a new poll"""
    db_poll = crud.create_poll(db, poll)
    
    # Prepare response
    poll_response = schemas.PollResponse.from_orm(db_poll)
    poll_response.total_votes = sum(option.vote_count for option in db_poll.options)
    
    # Broadcast to all clients
    logger.info(f"📢 New poll created: {db_poll.id}")
    await manager.broadcast({
        "type": "poll_created",
        "data": poll_response.dict()
    })
    
    return poll_response

@app.get("/polls/", response_model=list[schemas.PollResponse])
def get_polls(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all polls"""
    polls = crud.get_polls(db, skip=skip, limit=limit)
    
    response_polls = []
    for poll in polls:
        poll_response = schemas.PollResponse.from_orm(poll)
        poll_response.total_votes = sum(option.vote_count for option in poll.options)
        response_polls.append(poll_response)
    
    return response_polls

@app.get("/polls/{poll_id}", response_model=schemas.PollResponse)
def get_poll(poll_id: int, db: Session = Depends(get_db)):
    """Get a specific poll"""
    poll = crud.get_poll(db, poll_id)
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    poll_response = schemas.PollResponse.from_orm(poll)
    poll_response.total_votes = sum(option.vote_count for option in poll.options)
    
    return poll_response

# VOTES
@app.post("/polls/{poll_id}/votes", status_code=status.HTTP_201_CREATED)
async def create_vote(poll_id: int, vote: schemas.VoteCreate, db: Session = Depends(get_db)):
    """Cast a vote"""
    poll = crud.get_poll(db, poll_id)
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    db_vote = crud.create_vote(db, poll_id, vote)
    if not db_vote:
        raise HTTPException(
            status_code=400,
            detail="Invalid option or user has already voted"
        )
    
    # Get updated poll
    updated_poll = crud.get_poll(db, poll_id)
    poll_response = schemas.PollResponse.from_orm(updated_poll)
    poll_response.total_votes = sum(option.vote_count for option in updated_poll.options)
    
    # Broadcast vote update to ALL clients
    logger.info(f"📢 Vote cast on poll {poll_id}")
    await manager.broadcast({
        "type": "vote_update",
        "data": poll_response.dict()
    })
    
    return {"message": "Vote recorded", "poll": poll_response}

@app.get("/polls/{poll_id}/votes/{user_id}")
def get_user_vote(poll_id: int, user_id: str, db: Session = Depends(get_db)):
    """Check if user voted"""
    vote = crud.get_user_vote(db, poll_id, user_id)
    if not vote:
        raise HTTPException(status_code=404, detail="Vote not found")
    return {"option_id": vote.option_id}

# LIKES
@app.post("/polls/{poll_id}/likes")
async def toggle_like(poll_id: int, like: schemas.LikeCreate, db: Session = Depends(get_db)):
    """Toggle like on a poll"""
    poll = crud.get_poll(db, poll_id)
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    is_liked, new_count = crud.toggle_like(db, poll_id, like.user_id)
    
    # Get updated poll
    updated_poll = crud.get_poll(db, poll_id)
    poll_response = schemas.PollResponse.from_orm(updated_poll)
    poll_response.total_votes = sum(option.vote_count for option in updated_poll.options)
    
    # Broadcast like update to ALL clients
    logger.info(f"📢 Like toggled on poll {poll_id}")
    await manager.broadcast({
        "type": "like_update",
        "data": poll_response.dict()
    })
    
    return {
        "is_liked": is_liked,
        "like_count": new_count,
        "poll": poll_response
    }

@app.get("/polls/{poll_id}/likes/{user_id}")
def check_user_like(poll_id: int, user_id: str, db: Session = Depends(get_db)):
    """Check if user liked a poll"""
    like = crud.get_user_like(db, poll_id, user_id)
    return {"is_liked": like is not None}

# ============= WEBSOCKET ENDPOINT =============

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    
    try:
        while True:
            # Keep connection alive and handle any client messages
            data = await websocket.receive_text()
            logger.info(f"📨 Received from client: {data}")
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"❌ WebSocket error: {e}")
        manager.disconnect(websocket)