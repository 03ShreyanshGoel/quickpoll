from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas
from ..database import get_db
from ..websocket_manager import manager

router = APIRouter(prefix="/polls", tags=["likes"])

@router.post("/{poll_id}/likes")
async def toggle_like(poll_id: int, like: schemas.LikeCreate, db: Session = Depends(get_db)):
    """Toggle like on a poll"""
    poll = crud.get_poll(db, poll_id)
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    is_liked, new_count = crud.toggle_like(db, poll_id, like.user_id)
    
    # Broadcast like update via WebSocket
    await manager.broadcast_to_poll(poll_id, {
        "type": "like",
        "poll_id": poll_id,
        "data": {
            "like_count": new_count,
            "is_liked": is_liked
        }
    })
    
    return {
        "is_liked": is_liked,
        "like_count": new_count
    }

@router.get("/{poll_id}/likes/{user_id}")
def check_user_like(poll_id: int, user_id: str, db: Session = Depends(get_db)):
    """Check if user has liked a poll"""
    like = crud.get_user_like(db, poll_id, user_id)
    return {"is_liked": like is not None}