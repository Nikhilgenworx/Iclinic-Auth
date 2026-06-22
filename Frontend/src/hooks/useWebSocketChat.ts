import { useCallback, useEffect, useRef, useState } from "react";
import { getAccessToken } from "../lib/backendClient";
import { ENV } from "../config/env";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface WebSocketState {
  isConnected: boolean;
  isTyping: boolean;
  sessionId: string | null;
}

/**
 * Custom hook for WebSocket-based chat with the iClinic AI Agent.
 */
export function useWebSocketChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isTyping: false,
    sessionId: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const generateId = () =>
    `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    // Don't connect if already open or connecting
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    cleanup();

    const token = getAccessToken() || "";
    const wsBaseUrl = ENV.WS_BASE_URL;
    const url = `${wsBaseUrl}/ws/chat?token=${encodeURIComponent(token)}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) {
        ws.close();
        return;
      }
      console.log("[WS] Connected");
      setState((s) => ({ ...s, isConnected: true }));

      // Start ping interval (every 30s)
      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, 30000);
    };

    ws.onmessage = (event) => {
      if (!mountedRef.current) return;
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "connected":
            setState((s) => ({ ...s, sessionId: data.session_id }));
            // Don't add system "connected" message to chat — it's metadata only
            break;

          case "message":
            setState((s) => ({ ...s, isTyping: false }));
            setMessages((prev) => [
              ...prev,
              {
                id: generateId(),
                role: "assistant",
                content: data.content,
                timestamp: new Date(),
              },
            ]);
            break;

          case "typing":
            setState((s) => ({ ...s, isTyping: true }));
            break;

          case "error":
            setState((s) => ({ ...s, isTyping: false }));
            setMessages((prev) => [
              ...prev,
              {
                id: generateId(),
                role: "system",
                content: data.content,
                timestamp: new Date(),
              },
            ]);
            break;

          case "pong":
            break;

          default:
            break;
        }
      } catch (err) {
        console.error("[WS] Failed to parse message:", err);
      }
    };

    ws.onclose = () => {
      console.log("[WS] Disconnected");
      cleanup();
      setState((s) => ({ ...s, isConnected: false, isTyping: false }));

      // Auto-reconnect after 5s if still mounted
      if (mountedRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            console.log("[WS] Attempting reconnect...");
            wsRef.current = null;
            connect();
          }
        }, 5000);
      }
    };

    ws.onerror = (err) => {
      console.error("[WS] Error:", err);
    };
  }, [cleanup]);

  const disconnect = useCallback(() => {
    cleanup();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, [cleanup]);

  const sendMessage = useCallback((content: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error("[WS] Not connected");
      return;
    }

    // Add user message to local state immediately
    setMessages((prev) => [
      ...prev,
      {
        id: generateId(),
        role: "user",
        content,
        timestamp: new Date(),
      },
    ]);

    // Send via WebSocket
    wsRef.current.send(JSON.stringify({ type: "message", content }));
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    mountedRef.current = true;

    // Small delay to avoid React StrictMode double-connection
    const connectTimeout = setTimeout(() => {
      if (mountedRef.current) {
        connect();
      }
    }, 50);

    return () => {
      mountedRef.current = false;
      clearTimeout(connectTimeout);
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    messages,
    sendMessage,
    clearMessages,
    isConnected: state.isConnected,
    isTyping: state.isTyping,
    sessionId: state.sessionId,
    reconnect: () => {
      disconnect();
      wsRef.current = null;
      connect();
    },
  };
}
