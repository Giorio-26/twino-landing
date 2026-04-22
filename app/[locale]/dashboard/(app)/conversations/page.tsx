"use client";

import {
  AlertTriangle,
  Check,
  CheckCheck,
  Circle,
  Loader2,
  Search,
  Send,
  Shield,
  ShieldOff,
  User,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Lead {
  id: number;
  company_id: string;
  chat_id: string;
  budget: string | null;
  location: string | null;
  intent: string | null;
  lead_score: number;
  status: "new" | "contacted" | "qualified" | "deal";
  updated_at: string;
}

interface ChatMessage {
  sender: "user" | "ai" | "human_agent";
  text: string;
  time?: string;
  timestamp?: string;
}

type WsEvent =
  | { type: "user_msg"; chat_id: string; text: string }
  | { type: "ai_msg"; chat_id: string; text: string }
  | { type: "typing"; chat_id: string; is_typing: boolean }
  | { type: "lead_updated"; chat_id: string; lead: Lead }
  | { type: "takeover"; chat_id: string; enabled: boolean }
  | { type: "escalate"; chat_id: string; manager_summary: string }
  | { type: "conversation_closed"; chat_id: string }
  | { type: "profanity_blocked"; chat_id: string };

function formatPhone(chatId: string): string {
  return `+${chatId.split("@")[0]}`;
}

function timeAgo(isoDate: string): string {
  const utc = isoDate.endsWith("Z") || isoDate.includes("+") ? isoDate : `${isoDate}Z`;
  const diff = Date.now() - new Date(utc).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function ConversationsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [leadsError, setLeadsError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const [filter, setFilter] = useState("whatsapp");
  const [search, setSearch] = useState("");

  const [lastMessages, setLastMessages] = useState<Record<string, string>>({});
  const [typingChats, setTypingChats] = useState<Set<string>>(new Set());
  const [takeoverChats, setTakeoverChats] = useState<Set<string>>(new Set());
  const [escalations, setEscalations] = useState<Record<string, string>>({});
  const [closedChats, setClosedChats] = useState<Set<string>>(new Set());
  const [blockedChats, setBlockedChats] = useState<Set<string>>(new Set());

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [actionPending, setActionPending] = useState(false);

  const selectedRef = useRef<Lead | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  selectedRef.current = selected;

  async function handleTakeover() {
    if (!selected || actionPending) return;
    setActionPending(true);
    const isTakeover = takeoverChats.has(selected.chat_id);
    const action = isTakeover ? "start-ai" : "takeover";
    await fetch(
      `/api/dashboard/chat-controls/${encodeURIComponent(selected.chat_id)}/${action}`,
      { method: "POST" },
    ).catch(() => null);
    setTakeoverChats((prev) => {
      const s = new Set(prev);
      if (isTakeover) s.delete(selected.chat_id);
      else s.add(selected.chat_id);
      return s;
    });
    setActionPending(false);
  }

  async function handleBlock() {
    if (!selected || actionPending) return;
    setActionPending(true);
    const isBlocked = blockedChats.has(selected.chat_id);
    const action = isBlocked ? "unblock" : "block";
    await fetch(
      `/api/dashboard/chat-controls/${encodeURIComponent(selected.chat_id)}/${action}`,
      { method: "POST" },
    ).catch(() => null);
    setBlockedChats((prev) => {
      const s = new Set(prev);
      if (isBlocked) s.delete(selected.chat_id);
      else s.add(selected.chat_id);
      return s;
    });
    setActionPending(false);
  }

  async function sendMessage() {
    if (!input.trim() || !selected || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setMessages((prev) => [...prev, { sender: "ai", text, time: now }]);
    await fetch("/api/dashboard/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: selected.chat_id, message: text }),
    }).catch(() => null);
    setSending(false);
  }

  // Fetch leads
  useEffect(() => {
    fetch("/api/dashboard/leads")
      .then((r) => r.json())
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setLeads(json.data ?? []);
      })
      .catch((e: Error) => setLeadsError(e.message))
      .finally(() => setLeadsLoading(false));
  }, []);

  // WebSocket for live updates
  useEffect(() => {
    let ws: WebSocket | null = null;

    fetch("/api/dashboard/ws-info")
      .then((r) => r.json())
      .then((json: { wsUrl: string }) => {
        ws = new WebSocket(json.wsUrl);

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data as string) as WsEvent;

            switch (data.type) {
              case "user_msg":
              case "ai_msg": {
                if (data.type === "ai_msg") {
                  setTypingChats((prev) => {
                    const s = new Set(prev);
                    s.delete(data.chat_id);
                    return s;
                  });
                }
                setLastMessages((prev) => ({
                  ...prev,
                  [data.chat_id]: data.text,
                }));
                if (selectedRef.current?.chat_id === data.chat_id) {
                  const now = new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  setMessages((prev) => [
                    ...prev,
                    {
                      sender: data.type === "ai_msg" ? "ai" : "user",
                      text: data.text,
                      time: now,
                    },
                  ]);
                }
                break;
              }

              case "typing": {
                setTypingChats((prev) => {
                  const s = new Set(prev);
                  if (data.is_typing) s.add(data.chat_id);
                  else s.delete(data.chat_id);
                  return s;
                });
                break;
              }

              case "lead_updated": {
                setLeads((prev) =>
                  prev.map((l) =>
                    l.chat_id === data.chat_id ? { ...l, ...data.lead } : l,
                  ),
                );
                if (selectedRef.current?.chat_id === data.chat_id) {
                  setSelected((prev) =>
                    prev ? { ...prev, ...data.lead } : prev,
                  );
                }
                break;
              }

              case "takeover": {
                setTakeoverChats((prev) => {
                  const s = new Set(prev);
                  if (data.enabled) s.add(data.chat_id);
                  else s.delete(data.chat_id);
                  return s;
                });
                break;
              }

              case "escalate": {
                setEscalations((prev) => ({
                  ...prev,
                  [data.chat_id]: data.manager_summary,
                }));
                break;
              }

              case "conversation_closed": {
                setClosedChats((prev) => new Set([...prev, data.chat_id]));
                break;
              }

              case "profanity_blocked": {
                setBlockedChats((prev) => new Set([...prev, data.chat_id]));
                break;
              }
            }
          } catch {}
        };

        ws.onerror = (e) =>
          console.error("[WS] connection error", json.wsUrl, e);
        ws.onclose = (e) => console.warn("[WS] closed", e.code, e.reason);
      })
      .catch(() => console.error("[WS] failed to get ws-info"));

    return () => ws?.close();
  }, []);

  // Fetch chat state + history when lead is selected
  useEffect(() => {
    if (!selected) return;
    setMessages([]);
    setMessagesLoading(true);

    const chatId = selected.chat_id;

    fetch(`/api/dashboard/chat-controls/${encodeURIComponent(chatId)}`)
      .then((r) => r.json())
      .then((json: { state?: { human_takeover: boolean; is_blocked: boolean; conversation_closed: boolean } }) => {
        if (!json.state) return;
        const { human_takeover, is_blocked, conversation_closed } = json.state;
        setTakeoverChats((prev) => { const s = new Set(prev); human_takeover ? s.add(chatId) : s.delete(chatId); return s; });
        setBlockedChats((prev) => { const s = new Set(prev); is_blocked ? s.add(chatId) : s.delete(chatId); return s; });
        setClosedChats((prev) => { const s = new Set(prev); conversation_closed ? s.add(chatId) : s.delete(chatId); return s; });
      })
      .catch(() => null);

    fetch(`/api/dashboard/chat-history?chat_id=${encodeURIComponent(chatId)}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setMessages(json.data?.messages ?? []);
      })
      .catch(() => setMessages([]))
      .finally(() => setMessagesLoading(false));
  }, [selected]);

  // Scroll to bottom on new messages or typing indicator change.
  // deps are intentional triggers, not values read inside the effect.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingChats, selected]);

  const filtered = leads.filter((lead) => {
    const phone = formatPhone(lead.chat_id);
    if (search && !phone.includes(search)) return false;
    return true;
  });

  const QualBadge = ({
    label,
    value,
  }: {
    label: string;
    value: string | null;
  }) => (
    <div
      className={`flex items-center gap-2 rounded-lg p-2.5 ${value ? "bg-dash-success-muted" : "bg-dash-surface-secondary"}`}
    >
      {value ? (
        <Check className="h-3.5 w-3.5 text-dash-success" />
      ) : (
        <Circle className="h-3.5 w-3.5 text-dash-text-muted" />
      )}
      <div>
        <div className="font-medium text-[10px] text-dash-text-muted uppercase">
          {label}
        </div>
        <div
          className={`font-semibold text-xs ${value ? "text-dash-success" : "text-dash-text-muted"}`}
        >
          {value || "Pending"}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full dash-animate-in flex h-[calc(100vh-4rem)] gap-0 overflow-hidden rounded-2xl border border-dash-border bg-dash-surface">
      {/* Left: Lead list */}
      <div className="flex w-80 shrink-0 flex-col border-dash-border border-r">
        <div className="border-dash-border border-b p-4">
          <div className="relative">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-dash-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by phone..."
              className="w-full rounded-lg border border-dash-border bg-dash-bg py-2 pr-3 pl-9 text-dash-text text-sm placeholder-dash-text-muted focus:border-dash-accent/40 focus:outline-none"
            />
          </div>
          <div className="mt-3 flex gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              type="button"
              onClick={() => setFilter("whatsapp")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium text-xs transition-colors ${filter === "whatsapp" ? "bg-[#25D366]/15 text-[#25D366]" : "text-dash-text-muted hover:text-dash-text-secondary"}`}
            >
              <svg
                aria-hidden="true"
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </button>
            <button
              type="button"
              disabled
              className="relative flex cursor-not-allowed items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium text-xs text-dash-text-muted opacity-50"
              title="Coming soon"
            >
              <svg
                aria-hidden="true"
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z" />
              </svg>
              Messenger
              <span className="ml-0.5 rounded bg-dash-surface-secondary px-1 py-0.5 text-[9px] uppercase tracking-wide text-dash-text-muted">
                Soon
              </span>
            </button>
            <button
              type="button"
              disabled
              className="relative flex cursor-not-allowed items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium text-xs text-dash-text-muted opacity-50"
              title="Coming soon"
            >
              <svg
                aria-hidden="true"
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
              Instagram
              <span className="ml-0.5 rounded bg-dash-surface-secondary px-1 py-0.5 text-[9px] uppercase tracking-wide text-dash-text-muted">
                Soon
              </span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {leadsLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-dash-text-muted" />
            </div>
          )}
          {leadsError && (
            <p className="p-4 text-center text-dash-text-muted text-xs">
              {leadsError}
            </p>
          )}
          {!leadsLoading && !leadsError && filtered.length === 0 && (
            <p className="p-4 text-center text-dash-text-muted text-xs">
              No conversations found.
            </p>
          )}
          {filtered.map((lead) => {
            const phone = formatPhone(lead.chat_id);
            const lastMsg = lastMessages[lead.chat_id];
            const isClosed = closedChats.has(lead.chat_id);
            const isBlocked = blockedChats.has(lead.chat_id);
            const hasEscalation = Boolean(escalations[lead.chat_id]);
            return (
              <button
                key={lead.id}
                type="button"
                onClick={() => setSelected(lead)}
                className={`flex w-full items-start gap-3 border-dash-border border-b p-4 text-left transition-colors ${selected?.id === lead.id ? "bg-dash-accent-muted/30" : "hover:bg-dash-surface-hover"}`}
              >
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-dash-surface-secondary font-semibold text-dash-text text-sm">
                    {phone[1]}
                  </div>
                  {!isClosed && !isBlocked && (
                    <span className="-bottom-0.5 -right-0.5 absolute h-3 w-3 rounded-full border-2 border-dash-surface bg-green-500" />
                  )}
                  {isClosed && (
                    <span className="-bottom-0.5 -right-0.5 absolute h-3 w-3 rounded-full border-2 border-dash-surface bg-dash-text-muted" />
                  )}
                  {isBlocked && (
                    <span className="-bottom-0.5 -right-0.5 absolute h-3 w-3 rounded-full border-2 border-dash-surface bg-red-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-dash-text text-sm">
                      {phone}
                    </span>
                    <span className="text-[11px] text-dash-text-muted">
                      {timeAgo(lead.updated_at)}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-dash-text-muted text-xs">
                    {lastMsg ?? lead.intent ?? "—"}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    {lead.budget && (
                      <span className="h-1.5 w-1.5 rounded-full bg-dash-success" />
                    )}
                    {lead.location && (
                      <span className="h-1.5 w-1.5 rounded-full bg-dash-success" />
                    )}
                    {lead.intent && (
                      <span className="h-1.5 w-1.5 rounded-full bg-dash-success" />
                    )}
                    {(!lead.budget || !lead.location || !lead.intent) && (
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-dash-text-muted" />
                    )}
                    {hasEscalation && (
                      <AlertTriangle className="h-3 w-3 text-dash-warning" />
                    )}
                    {isClosed && (
                      <span className="rounded px-1 py-0.5 text-[9px] font-medium uppercase tracking-wide bg-dash-surface-secondary text-dash-text-muted">
                        Closed
                      </span>
                    )}
                    {isBlocked && (
                      <span className="rounded px-1 py-0.5 text-[9px] font-medium uppercase tracking-wide bg-red-500/10 text-red-500">
                        Blocked
                      </span>
                    )}
                  </div>
                </div>
                {/* {lead.lead_score >= 7 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-dash-accent px-1 font-bold text-[10px] text-white">
                    {lead.lead_score}
                  </span>
                )} */}
              </button>
            );
          })}
        </div>
      </div>

      {/* Center: Chat */}
      <div className="flex flex-1 flex-col">
        {!selected ? (
          <div className="flex flex-1 items-center justify-center text-dash-text-muted text-sm">
            Select a conversation
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-dash-border border-b px-6 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-dash-surface-secondary font-semibold text-dash-text text-sm">
                  {formatPhone(selected.chat_id)[1]}
                </div>
                <div>
                  <div className="font-semibold text-dash-text text-sm">
                    {formatPhone(selected.chat_id)}
                  </div>
                  <div className="text-dash-text-muted text-xs">WhatsApp</div>
                </div>
              </div>
              {takeoverChats.has(selected.chat_id) ? (
                <button
                  type="button"
                  onClick={handleTakeover}
                  disabled={actionPending}
                  className="flex items-center gap-1.5 rounded-lg border border-dash-success/30 bg-dash-success-muted px-3 py-1.5 font-semibold text-dash-success text-xs transition-colors hover:bg-dash-success/20 disabled:opacity-50"
                >
                  {actionPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                  Resume AI
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleTakeover}
                  disabled={actionPending}
                  className="flex items-center gap-1.5 rounded-lg border border-dash-warning/30 bg-dash-warning-muted px-3 py-1.5 font-semibold text-dash-warning text-xs transition-colors hover:bg-dash-warning/20 disabled:opacity-50"
                >
                  {actionPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <User className="h-3.5 w-3.5" />}
                  Take Over
                </button>
              )}
            </div>

            <div
              className="flex-1 space-y-3 overflow-y-auto p-6"
              style={{ background: "var(--dash-bg)" }}
            >
              {messagesLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-dash-text-muted" />
                </div>
              )}
              {!messagesLoading &&
                messages.map((msg, i) => {
                  const isOutbound = msg.sender === "ai" || msg.sender === "human_agent";
                  const displayTime = msg.time ?? (msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined);
                  return (
                    <div
                      key={`${msg.sender}-${i}-${msg.text.slice(0, 12)}`}
                      className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          msg.sender === "ai"
                            ? "rounded-tr-sm bg-dash-accent text-white"
                            : msg.sender === "human_agent"
                            ? "rounded-tr-sm bg-emerald-600 text-white"
                            : "rounded-tl-sm border border-dash-border bg-dash-surface text-dash-text"
                        }`}
                      >
                        {msg.sender === "ai" && (
                          <div className="mb-1 flex items-center gap-1 font-medium text-[10px] text-white/70">
                            <Zap className="h-3 w-3" />
                            Sales Twin
                          </div>
                        )}
                        {msg.sender === "human_agent" && (
                          <div className="mb-1 flex items-center gap-1 font-medium text-[10px] text-white/70">
                            <User className="h-3 w-3" />
                            Agent
                          </div>
                        )}
                        <span>{msg.text}</span>
                        {displayTime && (
                          <div
                            className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                              isOutbound ? "text-white/60" : "text-dash-text-muted"
                            }`}
                          >
                            {displayTime}
                            {isOutbound && <CheckCheck className="h-3 w-3" />}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

              {/* Typing indicator */}
              {typingChats.has(selected.chat_id) && (
                <div className="flex justify-end">
                  <div className="rounded-2xl rounded-tr-sm bg-dash-accent px-4 py-3">
                    <div className="mb-1.5 flex items-center gap-1 font-medium text-[10px] text-white/70">
                      <Zap className="h-3 w-3" />
                      Sales Twin
                    </div>
                    <div className="flex items-center gap-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/80"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Conversation closed / blocked notices */}
              {closedChats.has(selected.chat_id) && (
                <div className="flex justify-center">
                  <span className="rounded-full border border-dash-border bg-dash-surface px-3 py-1 text-[11px] text-dash-text-muted">
                    Conversation closed — deal handed off
                  </span>
                </div>
              )}
              {blockedChats.has(selected.chat_id) && (
                <div className="flex justify-center">
                  <span className="flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-[11px] text-red-500">
                    <ShieldOff className="h-3 w-3" />
                    Chat blocked due to repeated profanity
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-dash-border border-t p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 rounded-xl border border-dash-border bg-dash-bg px-4 py-3 text-dash-text text-sm placeholder-dash-text-muted focus:border-dash-accent/40 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-dash-accent text-white transition-colors hover:bg-dash-accent-hover disabled:opacity-50"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right: Lead sidebar */}
      {selected && (
        <div className="hidden w-64 shrink-0 flex-col border-dash-border border-l xl:flex">
          <div className="border-dash-border border-b p-4">
            <h4 className="font-Helvetica-Neue font-semibold text-dash-text-muted text-xs uppercase tracking-wider">
              Lead Qualification
            </h4>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {/* Escalation alert */}
            {escalations[selected.chat_id] && (
              <div className="rounded-xl border border-dash-warning/30 bg-dash-warning-muted p-3">
                <div className="mb-1 flex items-center gap-1.5 font-semibold text-[10px] text-dash-warning uppercase">
                  <AlertTriangle className="h-3 w-3" />
                  Escalation
                </div>
                <p className="text-dash-text-secondary text-xs leading-relaxed">
                  {escalations[selected.chat_id]}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setEscalations((prev) => {
                      const next = { ...prev };
                      delete next[selected.chat_id];
                      return next;
                    })
                  }
                  className="mt-2 flex items-center gap-1 text-[10px] text-dash-text-muted hover:text-dash-text"
                >
                  <X className="h-3 w-3" />
                  Dismiss
                </button>
              </div>
            )}

            <QualBadge label="Budget" value={selected.budget} />
            <QualBadge label="Location" value={selected.location} />
            <QualBadge label="Intent" value={selected.intent} />

            <div className="flex items-center gap-2 rounded-lg bg-dash-surface-secondary p-2.5">
              <Zap className="h-3.5 w-3.5 text-dash-accent" />
              <div>
                <div className="font-medium text-[10px] text-dash-text-muted uppercase">
                  Lead Score
                </div>
                <div className="font-semibold text-dash-accent text-xs">
                  {selected.lead_score} / 10
                </div>
              </div>
            </div>

            {selected.budget && selected.location && selected.intent && (
              <div className="mt-4 rounded-xl border border-dash-success/20 bg-dash-success-muted p-4 text-center">
                <Check className="mx-auto h-6 w-6 text-dash-success" />
                <p className="mt-2 font-semibold text-dash-success text-sm">
                  Fully Qualified
                </p>
                <p className="mt-1 text-dash-text-muted text-xs">
                  Ready for agent handoff
                </p>
              </div>
            )}

            <div className="mt-6 space-y-2">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-dash-accent py-2.5 font-semibold text-white text-xs hover:bg-dash-accent-hover"
              >
                Send to CRM
              </button>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dash-border py-2.5 font-semibold text-dash-text-secondary text-xs hover:bg-dash-surface-hover"
              >
                Schedule Meeting
              </button>
              <button
                type="button"
                onClick={handleBlock}
                disabled={actionPending}
                className={`flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 font-semibold text-xs transition-colors disabled:opacity-50 ${
                  blockedChats.has(selected.chat_id)
                    ? "border-dash-success/30 bg-dash-success-muted text-dash-success hover:bg-dash-success/20"
                    : "border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10"
                }`}
              >
                {actionPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : blockedChats.has(selected.chat_id) ? (
                  <Shield className="h-3.5 w-3.5" />
                ) : (
                  <ShieldOff className="h-3.5 w-3.5" />
                )}
                {blockedChats.has(selected.chat_id) ? "Unblock User" : "Block User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
