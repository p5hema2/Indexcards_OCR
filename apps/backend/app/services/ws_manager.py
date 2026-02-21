import logging
from typing import Dict, List
from fastapi import WebSocket
from app.models.schemas import BatchProgress

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # batch_id -> list of active websockets
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # batch_id -> latest progress data
        self.batch_states: Dict[str, BatchProgress] = {}

    async def connect(self, websocket: WebSocket, batch_id: str):
        await websocket.accept()
        if batch_id not in self.active_connections:
            self.active_connections[batch_id] = []
        self.active_connections[batch_id].append(websocket)
        
        # If we have a state, send it immediately (re-attach)
        if batch_id in self.batch_states:
            state = self.batch_states[batch_id]
            await websocket.send_text(state.json())
            logger.info(f"Re-attached client to batch {batch_id}, sent current state")

    def disconnect(self, websocket: WebSocket, batch_id: str):
        if batch_id in self.active_connections:
            if websocket in self.active_connections[batch_id]:
                self.active_connections[batch_id].remove(websocket)
            if not self.active_connections[batch_id]:
                del self.active_connections[batch_id]
                # We keep the state for future re-attachments until the batch is finished?
                # For now, let's keep it until explicitly cleared.

    async def broadcast_progress(self, batch_id: str, progress: BatchProgress):
        # Update state
        self.batch_states[batch_id] = progress
        
        # Broadcast to all connections for this batch
        if batch_id in self.active_connections:
            message = progress.json()
            for connection in self.active_connections[batch_id]:
                try:
                    await connection.send_text(message)
                except Exception as e:
                    logger.error(f"Error sending WebSocket message to client for batch {batch_id}: {e}")

    def clear_state(self, batch_id: str):
        if batch_id in self.batch_states:
            del self.batch_states[batch_id]

ws_manager = ConnectionManager()
