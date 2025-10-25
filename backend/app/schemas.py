from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class OptionBase(BaseModel):
    text: str = Field(..., min_length=1, max_length=200)

class OptionCreate(OptionBase):
    pass

class OptionResponse(OptionBase):
    id: int
    vote_count: int
    
    class Config:
        from_attributes = True

class PollBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    created_by: str = Field(default="anonymous")

class PollCreate(PollBase):
    options: List[OptionCreate] = Field(..., min_items=2, max_items=10)

class PollResponse(PollBase):
    id: int
    created_at: datetime
    like_count: int
    options: List[OptionResponse]
    total_votes: int = 0
    
    class Config:
        from_attributes = True

class VoteCreate(BaseModel):
    option_id: int
    user_id: str

class VoteResponse(BaseModel):
    id: int
    poll_id: int
    option_id: int
    user_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class LikeCreate(BaseModel):
    user_id: str

class LikeResponse(BaseModel):
    id: int
    poll_id: int
    user_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class WebSocketMessage(BaseModel):
    type: str  # "vote", "like", "poll_created"
    poll_id: int
    data: dict