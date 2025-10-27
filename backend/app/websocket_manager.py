from fastapi import WebSocket
from fastapi.encoders import jsonable_encoder
from typing import List
import json
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"✅ New WebSocket connection. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"🔌 WebSocket disconnected. Remaining: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        """Broadcast message to ALL connected clients"""
        disconnected = []
        
        # ✅ Fix: safely handle datetime, UUID, and other non-JSON-serializable types
        safe_message = jsonable_encoder(message)
        message_json = json.dumps(safe_message)
        
        logger.info(f"📡 Broadcasting to {len(self.active_connections)} clients: {message.get('type', 'unknown')}")
        
        for connection in self.active_connections:
            try:
                await connection.send_text(message_json)
                logger.debug("✅ Sent to client")
            except Exception as e:
                logger.error(f"❌ Failed to send to client: {e}")
                disconnected.append(connection)
        
        # Clean up disconnected clients
        for connection in disconnected:
            self.disconnect(connection)

manager = ConnectionManager()
