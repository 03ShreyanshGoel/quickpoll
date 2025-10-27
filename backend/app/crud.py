from sqlalchemy.orm import Session
from . import models, schemas
from typing import List, Optional

def get_poll(db: Session, poll_id: int) -> Optional[models.Poll]:
    return db.query(models.Poll).filter(models.Poll.id == poll_id).first()

def get_polls(db: Session, skip: int = 0, limit: int = 100) -> List[models.Poll]:
    return db.query(models.Poll).order_by(models.Poll.created_at.desc()).offset(skip).limit(limit).all()

def create_poll(db: Session, poll: schemas.PollCreate) -> models.Poll:
    db_poll = models.Poll(
        title=poll.title,
        description=poll.description,
        created_by=poll.created_by
    )
    db.add(db_poll)
    db.flush()
    
    for option in poll.options:
        db_option = models.Option(poll_id=db_poll.id, text=option.text)
        db.add(db_option)
    
    db.commit()
    db.refresh(db_poll)
    return db_poll

def create_vote(db: Session, poll_id: int, vote: schemas.VoteCreate) -> Optional[models.Vote]:
    # Check if user already voted
    existing_vote = db.query(models.Vote).filter(
        models.Vote.poll_id == poll_id,
        models.Vote.user_id == vote.user_id
    ).first()
    
    if existing_vote:
        return None
    
    # Check if option belongs to poll
    option = db.query(models.Option).filter(
        models.Option.id == vote.option_id,
        models.Option.poll_id == poll_id
    ).first()
    
    if not option:
        return None
    
    db_vote = models.Vote(
        poll_id=poll_id,
        option_id=vote.option_id,
        user_id=vote.user_id
    )
    
    option.vote_count += 1
    db.add(db_vote)
    db.commit()
    db.refresh(db_vote)
    return db_vote

def toggle_like(db: Session, poll_id: int, user_id: str) -> tuple[bool, int]:
    """Returns (is_liked, new_like_count)"""
    existing_like = db.query(models.Like).filter(
        models.Like.poll_id == poll_id,
        models.Like.user_id == user_id
    ).first()
    
    poll = get_poll(db, poll_id)
    if not poll:
        return False, 0
    
    if existing_like:
        db.delete(existing_like)
        poll.like_count = max(0, poll.like_count - 1)
        db.commit()
        return False, poll.like_count
    else:
        new_like = models.Like(poll_id=poll_id, user_id=user_id)
        db.add(new_like)
        poll.like_count += 1
        db.commit()
        return True, poll.like_count

def get_user_vote(db: Session, poll_id: int, user_id: str) -> Optional[models.Vote]:
    return db.query(models.Vote).filter(
        models.Vote.poll_id == poll_id,
        models.Vote.user_id == user_id
    ).first()

def get_user_like(db: Session, poll_id: int, user_id: str) -> Optional[models.Like]:
    return db.query(models.Like).filter(
        models.Like.poll_id == poll_id,
        models.Like.user_id == user_id
    ).first()