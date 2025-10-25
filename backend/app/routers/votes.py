from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import crud, schemas
from ..database import get_db
from ..websocket_manager import manager

router = APIRouter(prefix="/polls", tags=["votes"])

@router.post("/{poll_id}/votes", response_model=schemas.VoteResponse, status_code=status.HTTP_201_CREATED)
async def create_vote(poll_id: int, vote: schemas.VoteCreate, db: Session = Depends(get_db)):
    """Cast a vote on a poll"""
    # Check if poll exists
    poll = crud.get_poll(db, poll_id)
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    # Create vote
    db_vote = crud.create_vote(db, poll_id, vote)
    if not db_vote:
        raise HTTPException(
            status_code=400,
            detail="Invalid option or user has already voted"
        )
    
    # Get updated poll data
    updated_poll = crud.get_poll(db, poll_id)
    poll_response = schemas.PollResponse.from_orm(updated_poll)
    poll_response.total_votes = sum(option.vote_count for option in updated_poll.options)
    
    # Broadcast vote update via WebSocket
    await manager.broadcast_to_poll(poll_id, {
        "type": "vote",
        "poll_id": poll_id,
        "data": poll_response.dict()
    })
    
    return db_vote

@router.get("/{poll_id}/votes/{user_id}", response_model=schemas.VoteResponse)
def get_user_vote(poll_id: int, user_id: str, db: Session = Depends(get_db)):
    """Check if a user has voted on a poll"""
    vote = crud.get_user_vote(db, poll_id, user_id)
    if not vote:
        raise HTTPException(status_code=404, detail="Vote not found")
    return vote