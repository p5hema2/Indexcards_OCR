import { useEffect, useRef, useCallback } from 'react';
import type { BatchProgress } from '../../store/wizardStore';

export function useProcessingWebSocket(
  batchId: string | null,
  onMessage: (progress: BatchProgress) => void
) {
  const wsRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!batchId) return;

    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${location.host}/api/v1/ws/task/${batchId}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data: BatchProgress = JSON.parse(event.data);
        onMessageRef.current(data);
      } catch {
        console.error('WS parse error', event.data);
      }
    };

    ws.onclose = () => {
      // Single reconnect after 1s -- backend re-sends last state on reconnect
      // No need for exponential backoff (local/LAN use only)
      setTimeout(() => {
        if (wsRef.current === ws) {
          // Only reconnect if we haven't been cleaned up
          const newWs = new WebSocket(wsUrl);
          newWs.onmessage = ws.onmessage;
          newWs.onclose = ws.onclose;
          wsRef.current = newWs;
        }
      }, 1000);
    };

    return () => {
      const ref = wsRef.current;
      wsRef.current = null; // Signal cleanup to prevent reconnect
      ref?.close();
    };
  }, [batchId]);

  const close = useCallback(() => {
    const ref = wsRef.current;
    wsRef.current = null;
    ref?.close();
  }, []);

  return { close };
}
