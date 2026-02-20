import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.ws_manager import ws_manager

logger = logging.getLogger(__name__)

router = APIRouter()

@router.websocket("/task/{batch_id}")
async def websocket_endpoint(websocket: WebSocket, batch_id: str):
    await ws_manager.connect(websocket, batch_id)
    try:
        while True:
            # We don't expect messages from the client, just keep connection alive
            data = await websocket.receive_text()
            logger.debug(f"Received from client {batch_id}: {data}")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, batch_id)
        logger.info(f"Client disconnected from batch {batch_id}")
    except Exception as e:
        logger.error(f"WebSocket error for batch {batch_id}: {e}")
        ws_manager.disconnect(websocket, batch_id)
