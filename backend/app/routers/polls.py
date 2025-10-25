from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, models
from ..database import get_db

router = APIRouter(prefix="/polls", tags=["polls"])

@router.post("/", response_model=schemas.PollResponse, status_code=status.HTTP_201_CREATED)
def create_poll(poll: schemas.PollCreate, db: Session = Depends(get_db)):
    """Create a new poll with options"""
    db_poll = crud.create_poll(db, poll)
    
    # Calculate total votes
    total_votes = sum(option.vote_count for option in db_poll.options)
    
    response = schemas.PollResponse.from_orm(db_poll)
    response.total_votes = total_votes
    
    return response

@router.get("/", response_model=List[schemas.PollResponse])
def get_polls(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all polls"""
    polls = crud.get_polls(db, skip=skip, limit=limit)
    
    response_polls = []
    for poll in polls:
        poll_response = schemas.PollResponse.from_orm(poll)
        poll_response.total_votes = sum(option.vote_count for option in poll.options)
        response_polls.append(poll_response)
    
    return response_polls

@router.get("/{poll_id}", response_model=schemas.PollResponse)
def get_poll(poll_id: int, db: Session = Depends(get_db)):
    """Get a specific poll by ID"""
    poll = crud.get_poll(db, poll_id)
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    poll_response = schemas.PollResponse.from_orm(poll)
    poll_response.total_votes = sum(option.vote_count for option in poll.options)
    
    return poll_response

@router.delete("/{poll_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_poll(poll_id: int, db: Session = Depends(get_db)):
    """Delete a poll"""
    success = crud.delete_poll(db, poll_id)
    if not success:
        raise HTTPException(status_code=404, detail="Poll not found")
    return None