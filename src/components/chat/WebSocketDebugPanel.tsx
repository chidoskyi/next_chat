import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { getChatWebSocket } from "@/src/services/wsApi";
import { selectCurrentConversation } from "@/src/store/slices/messageSlice";
import { selectCurrentUser } from "@/src/store/slices/authSlice";
import { RootState } from "@/src/store/store";

// ─── Types ────────────────────────────────────────────────────────────────────
interface LogEntry {
  id: number;
  time: string;
  category: "SEND" | "RECV" | "STORE" | "STATUS" | "ERROR" | "INFO";
  label: string;
  detail: string;
}

// ─── Category styles (FIXED: Using CSSProperties instead of string) ──────────
const CATEGORY_STYLE: Record<LogEntry["category"], React.CSSProperties> = {
  SEND: {
    backgroundColor: "#1e3a5f",
    color: "#7dd3fc",
    fontWeight: "bold",
  },
  RECV: {
    backgroundColor: "#1e3a2f",
    color: "#6ee7b7",
    fontWeight: "bold",
  },
  STORE: {
    backgroundColor: "#3b2f1e",
    color: "#fcd34d",
    fontWeight: "bold",
  },
  STATUS: {
    backgroundColor: "#3b1e3b",
    color: "#c4b5fd",
    fontWeight: "bold",
  },
  ERROR: {
    backgroundColor: "#5f1e1e",
    color: "#fca5a5",
    fontWeight: "bold",
  },
  INFO: {
    backgroundColor: "#1e1e3b",
    color: "#94a3b8",
    fontWeight: "bold",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export function WebSocketDebugPanel() {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logId = useRef(0);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const currentUser = useSelector(selectCurrentUser);
  const currentConversation = useSelector(selectCurrentConversation);
  const conversationId = currentConversation?.id;

  // Live snapshot of messages in Redux for the current conversation
  const reduxMessages = useSelector((state: RootState) =>
    conversationId ? (state.message?.messages?.[conversationId] ?? []) : []
  );

  // ─── Helper to push a log entry ─────────────────────────────────────────────
  const log = useCallback((category: LogEntry["category"], label: string, detail: string) => {
    setLogs((prev) => [
      ...prev.slice(-199), // keep max 200 entries
      {
        id: logId.current++,
        time: new Date().toLocaleTimeString([], { 
          hour: "2-digit", 
          minute: "2-digit", 
          second: "2-digit", 
          fractionalSecondDigits: 3 
        }),
        category,
        label,
        detail,
      },
    ]);
  }, []);

  // ─── Log current user + conversation on mount / change ──────────────────────
  useEffect(() => {
    log("INFO", "CONTEXT", `currentUser.id = ${currentUser?.id ?? "null"}  |  conversation = ${conversationId ?? "null"}`);
  }, [currentUser?.id, conversationId, log]);

  // ─── Subscribe to WebSocket events ──────────────────────────────────────────
  useEffect(() => {
    const ws = getChatWebSocket();

    // ── message (incoming from server) ──
    const unsubMessage = ws.on("message", (data: any) => {
      const senderId = data?.sender?.id ?? data?.data?.sender?.id ?? "??";
      const msgId = data?.id ?? data?.data?.id ?? "??";
      const isOwn = senderId === currentUser?.id;
      log("RECV", "message", `id=${msgId}  sender=${senderId}  isOwn=${isOwn}  body="${(data?.body ?? data?.data?.body ?? "").slice(0, 40)}"`);
    });

    // ── message_sent (server confirmation back to sender) ──
    const unsubMessageSent = ws.on("message_sent", (data: any) => {
      log("RECV", "message_sent", `message_id=${data?.message_id}  conversation_id=${data?.conversation_id}`);
    });

    // ── delivery_receipt ──
    const unsubDelivery = ws.on("delivery_receipt", (data: any) => {
      log("RECV", "delivery_receipt", `message_id=${data?.message_id}  delivered_by=${data?.user_id}  conversation=${data?.conversation_id}`);
    });

    // ── read_receipt ──
    const unsubRead = ws.on("read_receipt", (data: any) => {
      log("RECV", "read_receipt", `message_id=${data?.message_id}  read_by=${data?.user_id} (${data?.username})`);
    });

    // ── all_read_receipt ──
    const unsubAllRead = ws.on("all_read_receipt", (data: any) => {
      log("RECV", "all_read_receipt", `read_by=${data?.user_id} (${data?.username})  conversation=${data?.conversation_id}  marked=${data?.marked_count}`);
    });

    // ── all_messages_read_confirm ──
    const unsubAllReadConfirm = ws.on("all_messages_read_confirm", (data: any) => {
      log("RECV", "all_messages_read_confirm", `conversation=${data?.conversation_id}  marked=${data?.marked_count}`);
    });

    // ── typing ──
    const unsubTyping = ws.on("typing", (data: any) => {
      log("RECV", "typing", `user=${data?.username}  is_typing=${data?.is_typing}`);
    });

    // ── error ──
    const unsubError = ws.on("error", (data: any) => {
      log("ERROR", "ws_error", JSON.stringify(data));
    });

    // ── connection_established ──
    const unsubConn = ws.on("connection_established", (data: any) => {
      log("INFO", "connected", `user_id=${data?.user_id}  username=${data?.username}`);
    });

    // ── conversation_joined ──
    const unsubJoined = ws.on("conversation_joined", (data: any) => {
      log("INFO", "conversation_joined", `conversation=${data?.conversation_id}  has_unread=${data?.has_unread}`);
    });

    // ── conversation_left ──
    const unsubLeft = ws.on("conversation_left", (data: any) => {
      log("INFO", "conversation_left", `conversation=${data?.conversation_id}`);
    });

    return () => {
      unsubMessage();
      unsubMessageSent();
      unsubDelivery();
      unsubRead();
      unsubAllRead();
      unsubAllReadConfirm();
      unsubTyping();
      unsubError();
      unsubConn();
      unsubJoined();
      unsubLeft();
    };
  }, [currentUser?.id, log]);

  // ─── Auto-scroll to bottom when new logs arrive ────────────────────────────
  useEffect(() => {
    if (open && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, open]);

  // ─── Snapshot button: dump current Redux message state ──────────────────────
  const dumpReduxState = useCallback(() => {
    log("STORE", "REDUX SNAPSHOT", `--- ${reduxMessages.length} messages in conversation ---`);
    reduxMessages.forEach((m: any, i: number) => {
      log(
        "STORE",
        `msg[${i}]`,
        `id=${m.id}  sender=${m.sender?.id}  isOwn=${m.sender?.id === currentUser?.id}  ` +
        `delivered=${m.is_delivered}  read=${m.is_read}  status=${m.status}  ` +
        `body="${(m.body ?? "").slice(0, 30)}"`
      );
    });
  }, [reduxMessages, currentUser?.id, log]);

  // ─── Send mark_all_read manually (to test if server responds) ───────────────
  const sendMarkAllRead = useCallback(() => {
    if (!conversationId) {
      log("ERROR", "mark_all_read", "No conversation open");
      return;
    }
    log("SEND", "mark_all_read", `conversation_id=${conversationId}`);
    getChatWebSocket().markAllMessagesRead(conversationId);
  }, [conversationId, log]);

  // ─── Send mark_delivered for a specific message (test button) ───────────────
  const sendMarkDelivered = useCallback(() => {
    if (!conversationId) {
      log("ERROR", "mark_delivered", "No conversation open");
      return;
    }
    // Find the first message NOT from us that doesn't have is_delivered yet
    const target = reduxMessages.find(
      (m: any) => m.sender?.id !== currentUser?.id && !m.is_delivered
    );
    if (!target) {
      log("INFO", "mark_delivered", "No undelivered messages from others found");
      return;
    }
    log("SEND", "mark_delivered", `message_id=${target.id}  conversation_id=${conversationId}`);
    getChatWebSocket().markAsDelivered(conversationId, target.id);
  }, [conversationId, reduxMessages, currentUser?.id, log]);

  // ─── Clear logs ─────────────────────────────────────────────────────────────
  const clearLogs = useCallback(() => setLogs([]), []);

  // ─── Shared button style ────────────────────────────────────────────────────
  const btnStyle: React.CSSProperties = {
    background: "#1e293b",
    color: "#cbd5e1",
    border: "1px solid #334155",
    borderRadius: 4,
    padding: "2px 8px",
    cursor: "pointer",
    fontSize: 11,
    fontFamily: "monospace",
  };

  return (
    <div style={{ 
      position: "fixed", 
      bottom: 0, 
      right: 0, 
      zIndex: 9999, 
      fontFamily: "monospace", 
      fontSize: 11 
    }}>
      {/* ── Tab toggle ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: "absolute",
          bottom: open ? "100%" : 0,
          right: 0,
          background: "#0f172a",
          color: "#38bdf8",
          border: "1px solid #334155",
          borderBottom: "none",
          borderRadius: "6px 6px 0 0",
          padding: "4px 12px",
          cursor: "pointer",
          fontSize: 11,
          whiteSpace: "nowrap",
          fontFamily: "monospace",
        }}
      >
        {open ? "▼ Close Debug" : "▲ WS Debug"}
      </button>

      {/* ── Panel ── */}
      {open && (
        <div
          style={{
            width: 720,
            height: 440,
            background: "#0f172a",
            border: "1px solid #334155",
            borderRadius: "8px 0 0 0",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Toolbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 8px",
              borderBottom: "1px solid #334155",
              background: "#1e293b",
              flexWrap: "wrap",
            }}
          >
            <span style={{ color: "#94a3b8", marginRight: 4, fontSize: "11px" }}>
              user={currentUser?.id?.slice(0, 8) ?? "null"}  conv={conversationId?.slice(0, 8) ?? "null"}
            </span>
            <button onClick={dumpReduxState} style={btnStyle}>📦 Redux Snapshot</button>
            <button onClick={sendMarkAllRead} style={btnStyle}>📖 Send mark_all_read</button>
            <button onClick={sendMarkDelivered} style={btnStyle}>📬 Send mark_delivered</button>
            <button onClick={clearLogs} style={{ 
              ...btnStyle, 
              marginLeft: "auto", 
              color: "#f87171" 
            }}>
              🗑 Clear
            </button>
          </div>

          {/* Log list */}
          <div style={{ 
            flex: 1, 
            overflowY: "auto", 
            padding: 4,
            backgroundColor: "#0f172a"
          }}>
            {logs.length === 0 && (
              <div style={{ 
                color: "#475569", 
                padding: 12, 
                textAlign: "center",
                fontSize: "11px"
              }}>
                No events yet. Open a conversation or send a message.
              </div>
            )}
            {logs.map((entry) => (
              <div
                key={entry.id}
                style={{
                  display: "flex",
                  gap: 6,
                  alignItems: "flex-start",
                  padding: "3px 0",
                  borderBottom: "1px solid #1e293b",
                  fontSize: "11px",
                }}
              >
                {/* Time */}
                <span style={{ 
                  color: "#64748b", 
                  minWidth: 82, 
                  flexShrink: 0 
                }}>
                  {entry.time}
                </span>

                {/* Category badge - FIXED: Now using CSSProperties object */}
                <span
                  style={{
                    ...CATEGORY_STYLE[entry.category], // ✅ This now works!
                    padding: "1px 5px",
                    borderRadius: 3,
                    minWidth: 48,
                    textAlign: "center",
                    flexShrink: 0,
                    fontSize: "11px",
                    display: "inline-block",
                  }}
                >
                  {entry.category}
                </span>

                {/* Label */}
                <span style={{ 
                  color: "#cbd5e1", 
                  minWidth: 140, 
                  flexShrink: 0 
                }}>
                  {entry.label}
                </span>

                {/* Detail */}
                <span style={{ 
                  color: "#94a3b8", 
                  flex: 1, 
                  wordBreak: "break-all",
                  whiteSpace: "normal"
                }}>
                  {entry.detail}
                </span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>

          {/* Footer: live message count */}
          <div style={{ 
            borderTop: "1px solid #334155", 
            padding: "4px 8px", 
            color: "#64748b", 
            background: "#1e293b",
            fontSize: "11px",
          }}>
            Redux messages in current conversation: {reduxMessages.length}  |  Logs captured: {logs.length}
          </div>
        </div>
      )}
    </div>
  );
}

// Export a hook to use this in other components
export function useDebugLogger() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logId = useRef(0);

  const log = useCallback((category: LogEntry["category"], label: string, detail: string) => {
    const newEntry: LogEntry = {
      id: logId.current++,
      time: new Date().toLocaleTimeString([], { 
        hour: "2-digit", 
        minute: "2-digit", 
        second: "2-digit", 
        fractionalSecondDigits: 3 
      }),
      category,
      label,
      detail,
    };
    
    setLogs(prev => [...prev.slice(-199), newEntry]);
    
    // Also log to console for debugging
    console.log(`[${category}] ${label}:`, detail);
  }, []);

  const clearLogs = useCallback(() => setLogs([]), []);

  return {
    logs,
    log,
    clearLogs,
    WebSocketDebugPanel: () => <WebSocketDebugPanel />,
  };
}

// Simple wrapper to easily add the debug panel to any component
export const withDebugPanel = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return function WithDebugPanel(props: P) {
    return (
      <>
        <Component {...props} />
        <WebSocketDebugPanel />
      </>
    );
  };
};

// Default export
export default WebSocketDebugPanel;