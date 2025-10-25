from fastapi import WebSocket
from typing import List, Dict
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.poll_subscribers: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        
        # Remove from all poll subscriptions
        for poll_id in list(self.poll_subscribers.keys()):
            if websocket in self.poll_subscribers[poll_id]:
                self.poll_subscribers[poll_id].remove(websocket)
            if not self.poll_subscribers[poll_id]:
                del self.poll_subscribers[poll_id]

    def subscribe_to_poll(self, websocket: WebSocket, poll_id: int):
        if poll_id not in self.poll_subscribers:
            self.poll_subscribers[poll_id] = []
        if websocket not in self.poll_subscribers[poll_id]:
            self.poll_subscribers[poll_id].append(websocket)

    async def broadcast_to_all(self, message: dict):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                disconnected.append(connection)
        
        for connection in disconnected:
            self.disconnect(connection)

    async def broadcast_to_poll(self, poll_id: int, message: dict):
        if poll_id not in self.poll_subscribers:
            return
        
        disconnected = []
        for connection in self.poll_subscribers[poll_id]:
            try:
                await connection.send_json(message)
            except:
                disconnected.append(connection)
        
        for connection in disconnected:
            self.disconnect(connection)

manager = ConnectionManager()