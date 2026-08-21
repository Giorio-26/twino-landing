"use client";

import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCheck,
  Circle,
  Clock,
  ExternalLink,
  Loader2,
  MapPin,
  MessageSquare,
  Phone,
  Search,
  Send,
  StickyNote,
  User,
  X,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

interface Lead {
  id: number;
  company_id: string;
  chat_id: string;
  customer_name: string | null;
  budget: string | null;
  location: string | null;
  selected_property: string | null;
  intent: string | null;
  lead_score: number;
  status: "new" | "hot" | "qualified" | "call_in" | "deal";
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

function getDisplayName(lead: Lead): string {
  if (lead.customer_name && lead.customer_name !== "უცნობია") return lead.customer_name;
  return formatPhone(lead.chat_id);
}

function getDisplayInitials(lead: Lead): string {
  const name = getDisplayName(lead);
  if (name.startsWith("+")) return name.replace(/\D/g, "").slice(-2);
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
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

const STATUS_COLORS: Record<Lead["status"], { bg: string; text: string }> = {
  new: { bg: "bg-dash-accent-muted", text: "text-dash-accent" },
  hot: { bg: "bg-dash-warning-muted", text: "text-dash-warning" },
  qualified: { bg: "bg-dash-success-muted", text: "text-dash-success" },
  call_in: { bg: "bg-dash-purple-muted", text: "text-dash-purple" },
  deal: { bg: "bg-teal-500/10", text: "text-teal-600" },
};

const STATUS_LABELS: Record<Lead["status"], string> = {
  new: "New",
  hot: "Needs Attention",
  qualified: "Qualified",
  call_in: "Qualifying",
  deal: "Converted",
};

function guessChannel(chatId: string): string {
  if (chatId.endsWith("@s.whatsapp.net") || chatId.includes("whatsapp")) return "WhatsApp";
  if (chatId.endsWith("@messaging") || chatId.includes("messenger")) return "Messenger";
  if (chatId.endsWith("@instagram") || chatId.includes("instagram")) return "Instagram";
  return "Inbox";
}

function isKnown(value: string | null): boolean {
  return !!value && value !== "უცნობია";
}

export default function ConversationsPage() {
  const t = useTranslations("dashboard.conversations");

  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [leadsError, setLeadsError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

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

  // Right panel actions
  const [noteText, setNoteText] = useState("");
  const [notePending, setNotePending] = useState(false);
  const [notes, setNotes] = useState<string[]>([]);
  const [assignmentPending, setAssignmentPending] = useState(false);

  const selectedRef = useRef<Lead | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  selectedRef.current = selected;

  async function handleTakeover() {
    if (!selected || actionPending) return;
    setActionPending(true);
    const isTakeover = takeoverChats.has(selected.chat_id);
    const action = isTakeover ? "start-ai" : "takeover";
    await fetch(`/api/dashboard/chat-controls/${encodeURIComponent(selected.chat_id)}/${action}`, {
      method: "POST",
    }).catch(() => null);
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
    await fetch(`/api/dashboard/chat-controls/${encodeURIComponent(selected.chat_id)}/${action}`, {
      method: "POST",
    }).catch(() => null);
    setBlockedChats((prev) => {
      const s = new Set(prev);
      if (isBlocked) s.delete(selected.chat_id);
      else s.add(selected.chat_id);
      return s;
    });
    setActionPending(false);
  }

  async function handleAssign() {
    if (!selected || assignmentPending) return;
    setAssignmentPending(true);
    await fetch(`/api/dashboard/leads/${selected.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "call_in" }),
    }).catch(() => null);
    setTakeoverChats((prev) => new Set([...prev, selected.chat_id]));
    setAssignmentPending(false);
  }

  async function handleMarkQualified() {
    if (!selected || actionPending) return;
    setActionPending(true);
    await fetch(`/api/dashboard/leads/${selected.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "qualified" }),
    }).catch(() => null);
    setActionPending(false);
  }

  async function handleAddNote() {
    if (!selected || !noteText.trim() || notePending) return;
    const text = noteText.trim();
    setNoteText("");
    setNotePending(true);
    setNotes((prev) => [text, ...prev]);
    await fetch(`/api/dashboard/leads/${selected.id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    }).catch(() => null);
    setNotePending(false);
  }

  async function handleCloseLead() {
    if (!selected || actionPending) return;
    setActionPending(true);
    await fetch(`/api/dashboard/chat-controls/${encodeURIComponent(selected.chat_id)}/close`, {
      method: "POST",
    }).catch(() => null);
    setClosedChats((prev) => new Set([...prev, selected.chat_id]));
    setActionPending(false);
  }

  async function sendMessage() {
    if (!input.trim() || !selected || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [...prev, { sender: "human_agent", text, time: now }]);
    await fetch("/api/dashboard/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: selected.chat_id, message: text }),
    }).catch(() => null);
    setSending(false);
  }

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
      .then((json: { wsUrl: string; wsToken: string }) => {
        ws = new WebSocket(json.wsUrl, ["twino", json.wsToken]);
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
                setLastMessages((prev) => ({ ...prev, [data.chat_id]: data.text }));
                if (selectedRef.current?.chat_id === data.chat_id) {
                  const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                  setMessages((prev) => [
                    ...prev,
                    { sender: data.type === "ai_msg" ? "ai" : "user", text: data.text, time: now },
                  ]);
                }
                break;
              }
              case "typing":
                setTypingChats((prev) => {
                  const s = new Set(prev);
                  if (data.is_typing) s.add(data.chat_id);
                  else s.delete(data.chat_id);
                  return s;
                });
                break;
              case "lead_updated": {
                setLeads((prev) => prev.map((l) => (l.chat_id === data.chat_id ? { ...l, ...data.lead } : l)));
                if (selectedRef.current?.chat_id === data.chat_id) {
                  setSelected((prev) => (prev ? { ...prev, ...data.lead } : prev));
                }
                break;
              }
              case "takeover":
                setTakeoverChats((prev) => {
                  const s = new Set(prev);
                  if (data.enabled) s.add(data.chat_id);
                  else s.delete(data.chat_id);
                  return s;
                });
                break;
              case "escalate":
                setEscalations((prev) => ({ ...prev, [data.chat_id]: data.manager_summary }));
                break;
              case "conversation_closed":
                setClosedChats((prev) => new Set([...prev, data.chat_id]));
                break;
              case "profanity_blocked":
                setBlockedChats((prev) => new Set([...prev, data.chat_id]));
                break;
            }
          } catch {}
        };
        ws.onerror = (e) => console.error("[WS] connection error", json.wsUrl, e);
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
      .then(
        (json: {
          state?: { human_takeover: boolean; is_blocked: boolean; conversation_closed: boolean };
        }) => {
          if (!json.state) return;
          const { human_takeover, is_blocked, conversation_closed } = json.state;
          setTakeoverChats((prev) => {
            const s = new Set(prev);
            human_takeover ? s.add(chatId) : s.delete(chatId);
            return s;
          });
          setBlockedChats((prev) => {
            const s = new Set(prev);
            is_blocked ? s.add(chatId) : s.delete(chatId);
            return s;
          });
          setClosedChats((prev) => {
            const s = new Set(prev);
            conversation_closed ? s.add(chatId) : s.delete(chatId);
            return s;
          });
        },
      )
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingChats, selected]);

  const filtered = leads.filter((lead) => {
    const phone = formatPhone(lead.chat_id);
    const name = lead.customer_name?.toLowerCase() ?? "";
    const q = search.toLowerCase();
    if (search && !phone.includes(search) && !name.includes(q)) return false;
    return true;
  });

  // Recommended next action from qualification context
  function nextActionFor(lead: Lead): string {
    if (closedChats.has(lead.chat_id)) return "Closed — no action needed";
    if (lead.status === "deal") return "Closed — deal handed to sales";
    if (isKnown(lead.budget) && isKnown(lead.location) && isKnown(lead.intent)) return "Fully qualified — book a viewing";
    if (lead.lead_score >= 7) return "High-intent lead — respond within 15 min";
    if (isKnown(lead.intent) && !isKnown(lead.budget)) return "Ask about budget and timeline";
    if (!isKnown(lead.intent)) return "Ask what property type they are looking for";
    return "Continue qualification — the Twin is collecting details";
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] w-full gap-0 overflow-hidden rounded-2xl border border-dash-border bg-dash-surface">
      {/* ============ LEFT: Conversation list ============ */}
      <div className="flex w-80 shrink-0 flex-col border-dash-border border-r">
        <div className="border-dash-border border-b p-4">
          <div className="relative">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-dash-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full rounded-lg border border-dash-border bg-dash-bg py-2 pr-3 pl-9 text-dash-text text-sm placeholder-dash-text-muted focus:border-dash-accent/40 focus:outline-none"
            />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-dash-text-muted text-[10px] font-medium uppercase tracking-wider">
              {leadsLoading ? "…" : `${filtered.length} conversations`}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-dash-success">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-dash-success" />
              Live
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {leadsLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-dash-text-muted" />
            </div>
          )}
          {leadsError && (
            <div className="p-4">
              <div className="rounded-xl border border-dash-danger/20 bg-dash-danger-muted/30 p-4 text-center">
                <p className="font-medium text-dash-danger text-sm">{leadsError}</p>
                <button
                  type="button"
                  onClick={() => {
                    setLeadsError(null);
                    setLeadsLoading(true);
                    fetch("/api/dashboard/leads")
                      .then((r) => r.json())
                      .then((json) => {
                        if (json.error) throw new Error(json.error);
                        setLeads(json.data ?? []);
                      })
                      .catch((e) => setLeadsError(e.message))
                      .finally(() => setLeadsLoading(false));
                  }}
                  className="mt-2 rounded-lg bg-dash-danger px-3 py-1.5 font-medium text-white text-xs"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
          {!leadsLoading && !leadsError && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-dash-surface-secondary">
                <MessageSquare className="h-6 w-6 text-dash-text-muted" />
              </div>
              <p className="font-Helvetica-Neue text-sm font-semibold text-dash-text">{t("empty.title")}</p>
              <p className="mt-1 max-w-[200px] text-xs text-dash-text-muted">{t("empty.description")}</p>
              <a
                href="/dashboard/integration"
                className="mt-3 rounded-lg bg-accent px-3.5 py-2 font-medium text-white text-xs no-underline hover:bg-accent-hover"
              >
                {t("empty.cta")}
              </a>
            </div>
          )}
          {filtered.map((lead) => {
            const name = getDisplayName(lead);
            const initials = getDisplayInitials(lead);
            const lastMsg = lastMessages[lead.chat_id];
            const isClosed = closedChats.has(lead.chat_id);
            const isBlocked = blockedChats.has(lead.chat_id);
            const hasEscalation = Boolean(escalations[lead.chat_id]);
            const isHuman = takeoverChats.has(lead.chat_id);
            const colors = STATUS_COLORS[lead.status];
            return (
              <button
                key={lead.id}
                type="button"
                onClick={() => setSelected(lead)}
                className={`flex w-full items-start gap-3 border-dash-border border-b p-4 text-left transition-colors ${
                  selected?.id === lead.id ? "bg-dash-accent-muted/30" : "hover:bg-dash-surface-hover"
                }`}
              >
                <div className="relative">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                      isHuman ? "bg-dash-warning-muted text-dash-warning" : "bg-dash-surface-secondary text-dash-text"
                    }`}
                  >
                    {initials}
                  </div>
                  <span
                    className={`-bottom-0.5 -right-0.5 absolute h-3 w-3 rounded-full border-2 border-dash-surface ${
                      isClosed ? "bg-dash-text-muted" : isBlocked ? "bg-red-500" : "bg-green-500"
                    }`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-dash-text">{name}</span>
                    <span className="ml-2 shrink-0 text-[11px] text-dash-text-muted">{timeAgo(lead.updated_at)}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-dash-text-muted">
                    <span className="truncate">{lead.selected_property ?? "No property yet"}</span>
                    <span>·</span>
                    <span className="shrink-0">{guessChannel(lead.chat_id)}</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-dash-text-muted">
                    {lastMsg ?? lead.intent ?? "—"}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide ${colors.bg} ${colors.text}`}
                    >
                      {STATUS_LABELS[lead.status]}
                    </span>
                    {lead.lead_score >= 7 && (
                      <span className="flex min-w-4 items-center justify-center rounded-full bg-dash-accent px-1 font-bold text-[9px] text-white">
                        {lead.lead_score}
                      </span>
                    )}
                    {isKnown(lead.budget) && <span className="h-1.5 w-1.5 rounded-full bg-dash-success" title="Budget known" />}
                    {isKnown(lead.location) && <span className="h-1.5 w-1.5 rounded-full bg-dash-success" title="Location known" />}
                    {isKnown(lead.intent) && <span className="h-1.5 w-1.5 rounded-full bg-dash-success" title="Intent known" />}
                    {(!isKnown(lead.budget) || !isKnown(lead.location) || !isKnown(lead.intent)) && (
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-dash-text-muted" title="Still qualifying" />
                    )}
                    {hasEscalation && <AlertTriangle className="h-3 w-3 text-dash-warning" />}
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
                    {isHuman && (
                      <span className="rounded px-1 py-0.5 text-[9px] font-medium uppercase tracking-wide bg-dash-warning-muted text-dash-warning">
                        Sales Agent
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============ CENTER: Conversation ============ */}
      <div className="flex flex-1 flex-col">
        {!selected ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-dash-surface-secondary">
              <MessageSquare className="h-7 w-7 text-dash-text-muted" />
            </div>
            <p className="font-Helvetica-Neue text-base font-semibold text-dash-text">{t("noConversation")}</p>
            <p className="mt-1 max-w-[280px] text-sm text-dash-text-muted">{t("noConversationDesc")}</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between border-dash-border border-b px-5 py-3">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                    takeoverChats.has(selected.chat_id)
                      ? "bg-dash-warning-muted text-dash-warning"
                      : "bg-dash-surface-secondary text-dash-text"
                  }`}
                >
                  {getDisplayInitials(selected)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-dash-text">{getDisplayName(selected)}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide ${STATUS_COLORS[selected.status].bg} ${STATUS_COLORS[selected.status].text}`}
                    >
                      {STATUS_LABELS[selected.status]}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-dash-text-muted">
                    <span>{formatPhone(selected.chat_id)}</span>
                    <span>·</span>
                    <span>{guessChannel(selected.chat_id)}</span>
                    {selected.selected_property && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {selected.selected_property}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {takeoverChats.has(selected.chat_id) ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 rounded-lg border border-dash-warning/30 bg-dash-warning-muted px-3 py-1.5">
                      <User className="h-3.5 w-3.5 text-dash-warning" />
                      <span className="text-xs font-semibold text-dash-warning">You're responding</span>
                      <span className="h-2 w-2 animate-pulse rounded-full bg-dash-warning" />
                    </div>
                    <button
                      type="button"
                      onClick={handleTakeover}
                      disabled={actionPending}
                      className="flex items-center gap-1.5 rounded-lg bg-dash-success px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                    >
                      {actionPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                      Resume TwinO AI
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleTakeover}
                    disabled={actionPending}
                    className="flex items-center gap-1.5 rounded-lg bg-dash-accent px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-dash-accent-hover disabled:opacity-50"
                  >
                    {actionPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <User className="h-3.5 w-3.5" />}
                    Take Over
                  </button>
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto p-6" style={{ background: "var(--dash-bg)" }}>
              {messagesLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-dash-text-muted" />
                </div>
              )}
              {!messagesLoading &&
                messages.map((msg, i) => {
                  const isOutbound = msg.sender === "ai" || msg.sender === "human_agent";
                  const displayTime =
                    msg.time ??
                    (msg.timestamp
                      ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : undefined);
                  return (
                    <div key={`${msg.sender}-${i}-${msg.text.slice(0, 12)}`} className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-xs rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          msg.sender === "ai"
                            ? "rounded-tr-sm bg-dash-accent text-white"
                            : msg.sender === "human_agent"
                              ? "rounded-tr-sm bg-emerald-600 text-white"
                              : "rounded-tl-sm border border-dash-border bg-dash-surface text-dash-text"
                        }`}
                      >
                        <div className="mb-1 flex items-center gap-1 text-[10px] font-medium text-white/70">
                          {msg.sender === "user" && (
                            <>
                              <User className="h-3 w-3" />
                              {t("labels.customer")}
                            </>
                          )}
                          {msg.sender === "ai" && (
                            <>
                              <Zap className="h-3 w-3" />
                              {t("labels.twin")}
                            </>
                          )}
                          {msg.sender === "human_agent" && (
                            <>
                              <User className="h-3 w-3" />
                              {t("labels.agent")}
                            </>
                          )}
                        </div>
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
                    <div className="mb-1.5 flex items-center gap-1 text-[10px] font-medium text-white/70">
                      <Zap className="h-3 w-3" />
                      {t("labels.twin")}
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

              {/* Notices */}
              {closedChats.has(selected.chat_id) && (
                <div className="flex justify-center">
                  <span className="rounded-full border border-dash-border bg-dash-surface px-3 py-1 text-[11px] text-dash-text-muted">
                    Conversation closed — deal handed to sales
                  </span>
                </div>
              )}
              {blockedChats.has(selected.chat_id) && (
                <div className="flex justify-center">
                  <span className="flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-[11px] text-red-500">
                    <X className="h-3 w-3" />
                    Chat blocked due to repeated profanity
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-dash-border border-t p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder={takeoverChats.has(selected.chat_id) ? "Type as Sales Agent…" : "Take over to reply…"}
                  className="flex-1 rounded-xl border border-dash-border bg-dash-bg px-4 py-3 text-dash-text text-sm placeholder-dash-text-muted focus:border-dash-accent/40 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-dash-accent text-white transition-colors hover:bg-dash-accent-hover disabled:opacity-50"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ============ RIGHT: Lead context ============ */}
      {selected && (
        <div className="hidden w-72 shrink-0 flex-col border-dash-border border-l overflow-y-auto xl:flex">
          <div className="border-dash-border border-b p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-dash-text-muted">{t("panel.title")}</h4>
          </div>
          <div className="space-y-3 p-4">
            {/* Score */}
            <div className="flex items-center justify-between rounded-xl bg-dash-surface-secondary p-3">
              <span className="text-[10px] font-medium uppercase text-dash-text-muted">{t("panel.score")}</span>
              <span className="text-sm font-bold text-dash-accent">{selected.lead_score} / 10</span>
            </div>

            {/* Qualification grid */}
            <div className="grid grid-cols-1 gap-2">
              <QualBadge label={t("panel.budget")} value={selected.budget} />
              <QualBadge label={t("panel.property")} value={selected.selected_property} />
              <QualBadge label={t("panel.intent")} value={selected.intent} />
              <QualBadge label={t("panel.location")} value={selected.location} />
              <QualBadge label={t("panel.status")} value={STATUS_LABELS[selected.status]} />
            </div>

            {/* Timeline */}
            <div>
              <h5 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-dash-text-muted">
                {t("panel.timeline")}
              </h5>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-dash-text-muted">
                  <Circle className="h-1.5 w-1.5 shrink-0 fill-current" />
                  Conversation opened · WhatsApp
                </div>
                <div className="flex items-center gap-2 text-xs text-dash-text-muted">
                  <Circle className="h-1.5 w-1.5 shrink-0 fill-dash-accent text-dash-accent" />
                  TwinO AI responded {timeAgo(selected.updated_at)}
                </div>
                {isKnown(selected.budget) && (
                  <div className="flex items-center gap-2 text-xs text-dash-text-muted">
                    <Circle className="h-1.5 w-1.5 shrink-0 fill-dash-success text-dash-success" />
                    Budget collected: {selected.budget}
                  </div>
                )}
                {isKnown(selected.intent) && (
                  <div className="flex items-center gap-2 text-xs text-dash-text-muted">
                    <Circle className="h-1.5 w-1.5 shrink-0 fill-dash-success text-dash-success" />
                    Intent identified: {selected.intent}
                  </div>
                )}
                {notes.map((n, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-2 py-1.5 text-xs text-amber-700">
                    <StickyNote className="h-3 w-3 shrink-0" />
                    {n}
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended next action */}
            <div className="rounded-xl border border-dash-accent/20 bg-dash-accent-muted/40 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-dash-accent">
                <ArrowRight className="h-3 w-3" />
                {t("panel.nextAction")}
              </div>
              <p className="text-xs font-medium leading-relaxed text-dash-text">
                {nextActionFor(selected)}
              </p>
            </div>

            {/* Escalation alert */}
            {escalations[selected.chat_id] && (
              <div className="rounded-xl border border-dash-warning/30 bg-dash-warning-muted p-3">
                <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase text-dash-warning">
                  <AlertTriangle className="h-3 w-3" />
                  Escalation
                </div>
                <p className="text-xs leading-relaxed text-dash-text-secondary">{escalations[selected.chat_id]}</p>
                <button
                  type="button"
                  onClick={() => {
                    setEscalations((prev) => {
                      const next = { ...prev };
                      delete next[selected.chat_id];
                      return next;
                    });
                  }}
                  className="mt-2 flex items-center gap-1 text-[10px] text-dash-text-muted hover:text-dash-text"
                >
                  <X className="h-3 w-3" />
                  Dismiss
                </button>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleAssign}
                disabled={assignmentPending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-dash-accent py-2.5 text-xs font-semibold text-white hover:bg-dash-accent-hover disabled:opacity-50"
              >
                {assignmentPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <User className="h-3.5 w-3.5" />}
                {t("panel.assignToSales")}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleMarkQualified}
                  disabled={actionPending}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-dash-success/30 bg-dash-success-muted py-2.5 text-xs font-semibold text-dash-success hover:bg-dash-success/20 disabled:opacity-50"
                >
                  {actionPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  {t("panel.markQualified")}
                </button>
                <button
                  type="button"
                  onClick={handleCloseLead}
                  disabled={actionPending}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-dash-border py-2.5 text-xs font-semibold text-dash-text-secondary hover:bg-dash-surface-hover disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                  {t("panel.closeLead")}
                </button>
              </div>

              {/* Add note */}
              <div className="flex items-start gap-2">
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                  placeholder={t("panel.notePlaceholder")}
                  className="flex-1 rounded-xl border border-dash-border bg-dash-bg px-3 py-2 text-xs text-dash-text placeholder-dash-text-muted focus:border-dash-accent/40 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddNote}
                  disabled={!noteText.trim() || notePending}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-dash-border text-dash-text-muted transition-colors hover:bg-dash-surface-hover hover:text-dash-text disabled:opacity-50"
                >
                  {notePending ? <Loader2 className="h-4 w-4 animate-spin" /> : <StickyNote className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-2 border-dash-border border-t pt-3">
              <a
                href={`tel:${formatPhone(selected.chat_id)}`}
                className="flex items-center justify-center gap-2 rounded-xl bg-dash-accent py-2.5 text-xs font-semibold text-white hover:bg-dash-accent-hover"
              >
                <Phone className="h-3.5 w-3.5" />
                Call
              </a>
              <a
                href={`https://wa.me/${selected.chat_id.split("@")[0]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-dash-border py-2.5 text-xs font-semibold text-dash-text-secondary hover:bg-dash-surface-hover"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open in WhatsApp
              </a>
              <button
                type="button"
                onClick={handleBlock}
                disabled={actionPending}
                className={`flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                  blockedChats.has(selected.chat_id)
                    ? "border-dash-success/30 bg-dash-success-muted text-dash-success hover:bg-dash-success/20"
                    : "border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10"
                }`}
              >
                {blockedChats.has(selected.chat_id) ? (
                  <>Unblock user</>
                ) : (
                  <>Block user</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QualBadge({ label, value }: { label: string; value: string | null }) {
  const known = value != null && value !== "უცნობია";
  return (
    <div className={`flex items-center gap-2 rounded-lg p-2.5 ${known ? "bg-dash-success-muted" : "bg-dash-surface-secondary"}`}>
      {known ? (
        <Check className="h-3.5 w-3.5 text-dash-success" />
      ) : (
        <Circle className="h-3.5 w-3.5 text-dash-text-muted" />
      )}
      <div className="min-w-0">
        <div className="text-[10px] font-medium uppercase text-dash-text-muted">{label}</div>
        <div className={`truncate text-xs font-semibold ${known ? "text-dash-success" : "text-dash-text-muted"}`}>
          {known ? value : "Pending"}
        </div>
      </div>
    </div>
  );
}
