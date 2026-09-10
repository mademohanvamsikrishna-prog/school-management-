"""
Chat REST API — conversations and messages.

NOTE: This is a REST polling implementation, NOT WebSocket real-time.
WebSocket real-time push requires a message broker (Redis, etc.) not present in this environment.
Clients should poll GET /api/v1/chat/conversations/{id}/messages periodically for new messages.

Endpoints:
  GET  /chat/conversations          — list my conversations
  POST /chat/conversations          — create or get direct conversation
  GET  /chat/conversations/{id}     — get conversation details
  GET  /chat/conversations/{id}/messages — message history (paginated)
  POST /chat/conversations/{id}/messages — send message
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.dependencies import get_current_user, require_permission
from app.db.session import get_db
from app.models.user import User
from app.models.communication import Conversation, Message, conversation_participants
from app.db.base import generate_uuid

router = APIRouter(prefix="/chat", tags=["Chat"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class ConversationOut(BaseModel):
    id: str
    title: Optional[str]
    type: str
    participant_count: int
    model_config = {"from_attributes": True}

class ConversationCreateIn(BaseModel):
    participant_ids: List[str]  # user IDs (excluding self, will be added auto)
    title: Optional[str] = None
    type: str = "direct"  # direct or group

class MessageOut(BaseModel):
    id: str
    conversation_id: str
    sender_id: str
    sender_name: str
    content: str
    is_read: bool
    created_at: str
    model_config = {"from_attributes": True}

class MessageSendIn(BaseModel):
    content: str


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _conv_out(c: Conversation) -> ConversationOut:
    return ConversationOut(
        id=c.id,
        title=c.title,
        type=c.type,
        participant_count=len(c.participants),
    )

def _msg_out(m: Message) -> MessageOut:
    return MessageOut(
        id=m.id,
        conversation_id=m.conversation_id,
        sender_id=m.sender_id,
        sender_name=m.sender.name if m.sender else "",
        content=m.content,
        is_read=m.is_read,
        created_at=str(m.created_at),
    )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.get("/conversations", response_model=List[ConversationOut], summary="My conversations")
def list_conversations(
    current_user: User = Depends(require_permission("chat:participate")),
    db: Session = Depends(get_db),
) -> List[ConversationOut]:
    convs = (
        db.query(Conversation)
        .filter(Conversation.participants.any(id=current_user.id))
        .order_by(Conversation.created_at.desc())
        .all()
    )
    return [_conv_out(c) for c in convs]


@router.post("/conversations", response_model=ConversationOut, status_code=201, summary="Create conversation")
def create_conversation(
    payload: ConversationCreateIn,
    current_user: User = Depends(require_permission("chat:participate")),
    db: Session = Depends(get_db),
) -> ConversationOut:
    # For direct messages: check if conversation already exists
    if payload.type == "direct" and len(payload.participant_ids) == 1:
        other_id = payload.participant_ids[0]
        existing = (
            db.query(Conversation)
            .filter(
                Conversation.type == "direct",
                Conversation.participants.any(id=current_user.id),
                Conversation.participants.any(id=other_id),
            )
            .first()
        )
        if existing:
            return _conv_out(existing)

    all_participant_ids = list(set(payload.participant_ids + [current_user.id]))
    participants = db.query(User).filter(User.id.in_(all_participant_ids)).all()
    if len(participants) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 valid participants.")

    conv = Conversation(
        title=payload.title,
        type=payload.type,
        participants=participants,
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return _conv_out(conv)


@router.get("/conversations/{conversation_id}", response_model=ConversationOut, summary="Get conversation")
def get_conversation(
    conversation_id: str,
    current_user: User = Depends(require_permission("chat:participate")),
    db: Session = Depends(get_db),
) -> ConversationOut:
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    if not any(p.id == current_user.id for p in conv.participants):
        raise HTTPException(status_code=403, detail="Not a participant.")
    return _conv_out(conv)


@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageOut], summary="Message history")
def get_messages(
    conversation_id: str,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(require_permission("chat:participate")),
    db: Session = Depends(get_db),
) -> List[MessageOut]:
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    if not any(p.id == current_user.id for p in conv.participants):
        raise HTTPException(status_code=403, detail="Not a participant.")

    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return [_msg_out(m) for m in reversed(messages)]


@router.post("/conversations/{conversation_id}/messages", response_model=MessageOut, status_code=201, summary="Send message")
def send_message(
    conversation_id: str,
    payload: MessageSendIn,
    current_user: User = Depends(require_permission("chat:participate")),
    db: Session = Depends(get_db),
) -> MessageOut:
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    if not any(p.id == current_user.id for p in conv.participants):
        raise HTTPException(status_code=403, detail="Not a participant.")
    if not payload.content.strip():
        raise HTTPException(status_code=422, detail="Message content cannot be empty.")

    msg = Message(
        conversation_id=conversation_id,
        sender_id=current_user.id,
        content=payload.content.strip(),
        is_read=False,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return _msg_out(msg)
