"use client";

import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  Check,
  Clock,
  Copy,
  ExternalLink,
  GripVertical,
  Hash,
  Inbox,
  Key,
  Loader2,
  Mail,
  Pencil,
  PhoneCall,
  Trash2,
  Trophy,
  X,
} from "lucide-react";
import { useEffect, useOptimistic, useState, useTransition } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type BookingStatus = "new" | "reached" | "deal";

type Booking = {
  id: number;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  company_name: string | null;
  company_id: number | null;
  social_media_url: string | null;
  status: BookingStatus;
  scheduled_at: string | null;
  access_keys: { key: string; expires_at: string }[] | null;
};

// ─── Status config ────────────────────────────────────────────────────────────

type StatusConfig = {
  label: string;
  Icon: React.ElementType;
  headerBg: string;
  headerBorder: string;
  badgeBg: string;
  badgeText: string;
  dotColor: string;
  avatarBg: string;
  avatarText: string;
  accentBorder: string;
  dropGlow: string;
  emptyText: string;
};

const STATUS_CONFIG: Record<BookingStatus, StatusConfig> = {
  new: {
    label: "New",
    Icon: Inbox,
    headerBg: "bg-blue-50",
    headerBorder: "border-blue-200",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-700",
    dotColor: "bg-blue-500",
    avatarBg: "bg-blue-100",
    avatarText: "text-blue-700",
    accentBorder: "border-t-blue-400",
    dropGlow: "ring-blue-300 bg-blue-50/60",
    emptyText: "No new bookings",
  },
  reached: {
    label: "Reached",
    Icon: PhoneCall,
    headerBg: "bg-amber-50",
    headerBorder: "border-amber-200",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-700",
    dotColor: "bg-amber-500",
    avatarBg: "bg-amber-100",
    avatarText: "text-amber-700",
    accentBorder: "border-t-amber-400",
    dropGlow: "ring-amber-300 bg-amber-50/60",
    emptyText: "No reached bookings",
  },
  deal: {
    label: "Deal",
    Icon: Trophy,
    headerBg: "bg-emerald-50",
    headerBorder: "border-emerald-200",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-700",
    dotColor: "bg-emerald-500",
    avatarBg: "bg-emerald-100",
    avatarText: "text-emerald-700",
    accentBorder: "border-t-emerald-400",
    dropGlow: "ring-emerald-300 bg-emerald-50/60",
    emptyText: "No deals yet",
  },
};

// ─── Root component ───────────────────────────────────────────────────────────

type BookingsClientProps = {
  initialBookings: Booking[];
};

export default function BookingsClient({
  initialBookings,
}: BookingsClientProps) {
  const [bookings, setBookings] = useState(initialBookings);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [_isPending, startTransition] = useTransition();
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDeleteConfirm() {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    const res = await fetch(`/api/admin/booking-requests/${deleteConfirmId}`, {
      method: "DELETE",
    });
    setIsDeleting(false);
    if (res.ok) {
      setBookings((prev) => prev.filter((b) => b.id !== deleteConfirmId));
    } else {
      console.error("Error deleting booking:", await res.text());
    }
    setDeleteConfirmId(null);
  }

  const [optimisticBookings, setOptimisticBookings] = useOptimistic(
    bookings,
    (state, { id, status }: { id: number; status: BookingStatus }) =>
      state.map((b) => (b.id === id ? { ...b, status } : b)),
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const bookingId = active.id as number;
    const newStatus = over.id as BookingStatus;
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking || booking.status === newStatus) return;

    startTransition(() => {
      setOptimisticBookings({ id: bookingId, status: newStatus });
    });

    const res = await fetch("/api/admin/booking-status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: bookingId, status: newStatus }),
    });

    if (!res.ok) {
      console.error("Error updating booking status:", await res.text());
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: booking.status } : b,
        ),
      );
    } else {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b)),
      );
    }
  };

  const activeBooking = activeId
    ? optimisticBookings.find((b) => b.id === activeId)
    : null;
  const total = optimisticBookings.length;

  const bookingToDelete = deleteConfirmId
    ? bookings.find((b) => b.id === deleteConfirmId)
    : null;

  return (
    <div className="min-h-screen bg-gray-50/70 p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-bold text-2xl text-gray-900 tracking-tight">
          Booking Requests
        </h1>
        <p className="mt-1 text-gray-500 text-sm">
          {total} total booking{total !== 1 ? "s" : ""} · drag cards to change
          status
        </p>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {(Object.keys(STATUS_CONFIG) as BookingStatus[]).map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              bookings={optimisticBookings.filter((b) => b.status === status)}
              onDeleteRequest={setDeleteConfirmId}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeBooking ? (
            <BookingCard booking={activeBooking} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Delete confirmation dialog */}
      {deleteConfirmId && bookingToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="size-4 text-red-600" strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Delete booking?</h3>
                <p className="mt-1 text-gray-500 text-xs">
                  This will permanently delete{" "}
                  <span className="font-medium text-gray-700">
                    {bookingToDelete.first_name} {bookingToDelete.last_name}
                  </span>
                  {bookingToDelete.company_id && " and their linked company record"}
                  , including any access keys. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                disabled={isDeleting}
                className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 font-medium text-sm text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
                ) : (
                  <Trash2 className="size-3.5" strokeWidth={2} />
                )}
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Kanban Column ────────────────────────────────────────────────────────────

function KanbanColumn({
  status,
  bookings,
  onDeleteRequest,
}: {
  status: BookingStatus;
  bookings: Booking[];
  onDeleteRequest: (id: number) => void;
}) {
  const cfg = STATUS_CONFIG[status];
  const { Icon } = cfg;
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div
        className={`flex items-center justify-between rounded-xl border px-4 py-3 ${cfg.headerBg} ${cfg.headerBorder}`}
      >
        <div className="flex items-center gap-2">
          <Icon className={`size-4 ${cfg.badgeText}`} strokeWidth={2} />
          <h2 className="font-semibold text-gray-800 text-sm tracking-tight">
            {cfg.label}
          </h2>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 font-semibold text-xs ${cfg.badgeBg} ${cfg.badgeText}`}
        >
          {bookings.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`min-h-52 flex-1 rounded-2xl p-2 transition-all duration-150 ${
          isOver ? `ring-2 ${cfg.dropGlow}` : "bg-transparent"
        }`}
      >
        <div className="space-y-3">
          {bookings.map((booking) => (
            <DraggableCard
              key={booking.id}
              booking={booking}
              onDeleteRequest={onDeleteRequest}
            />
          ))}
          {bookings.length === 0 && (
            <div className="flex h-28 flex-col items-center justify-center gap-1.5 rounded-xl border border-gray-200 border-dashed">
              <Icon className="size-5 text-gray-300" strokeWidth={1.5} />
              <p className="text-gray-400 text-xs">{cfg.emptyText}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Draggable wrapper ────────────────────────────────────────────────────────

function DraggableCard({
  booking,
  onDeleteRequest,
}: {
  booking: Booking;
  onDeleteRequest: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: booking.id });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`touch-none transition-opacity duration-150 ${isDragging ? "opacity-30" : ""}`}
      {...listeners}
      {...attributes}
    >
      <BookingCard booking={booking} onDeleteRequest={onDeleteRequest} />
    </div>
  );
}

// ─── Booking Card ─────────────────────────────────────────────────────────────

function BookingCard({
  booking,
  isOverlay = false,
  onDeleteRequest,
}: {
  booking: Booking;
  isOverlay?: boolean;
  onDeleteRequest?: (id: number) => void;
}) {
  const cfg = STATUS_CONFIG[booking.status];

  const [submittedAt, setSubmittedAt] = useState("");
  const [scheduledLabel, setScheduledLabel] = useState("");

  useEffect(() => {
    setSubmittedAt(
      new Date(booking.created_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    );
  }, [booking.created_at]);

  useEffect(() => {
    if (!booking.scheduled_at) return;
    setScheduledLabel(
      new Date(booking.scheduled_at).toLocaleString("en-GB", {
        timeZone: "Asia/Tbilisi",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
  }, [booking.scheduled_at]);

  const initials = (booking.first_name[0] ?? "") + (booking.last_name[0] ?? "");

  // Strip protocol from social URL for display
  const socialDisplay = booking.social_media_url
    ? booking.social_media_url.replace(/^https?:\/\/(www\.)?/, "")
    : null;

  return (
    <div
      className={[
        "group relative flex flex-col gap-0 overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-200",
        isOverlay
          ? "rotate-1 scale-105 shadow-2xl"
          : "hover:-translate-y-0.5 cursor-grab shadow-sm hover:shadow-md active:cursor-grabbing",
      ].join(" ")}
    >
      {/* Colored top accent bar */}
      <div className={`h-1 w-full ${cfg.dotColor}`} />

      <div className="p-4">
        {/* Row 1: avatar + name + drag hint */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div
            className={`flex size-9 shrink-0 items-center justify-center rounded-full font-semibold text-sm uppercase ${cfg.avatarBg} ${cfg.avatarText}`}
          >
            {initials}
          </div>

          {/* Name + status */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-gray-900 text-sm leading-snug">
                {booking.first_name} {booking.last_name}
              </p>
              <span
                className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 font-medium text-xs ${cfg.badgeBg} ${cfg.badgeText}`}
              >
                <span className={`size-1.5 rounded-full ${cfg.dotColor}`} />
                {cfg.label}
              </span>
            </div>
          </div>

          {/* Drag handle + delete */}
          <div className="flex shrink-0 items-center gap-1">
            {!isOverlay && onDeleteRequest && (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onDeleteRequest(booking.id); }}
                className="rounded p-0.5 text-gray-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                title="Delete booking"
              >
                <X className="size-3.5" strokeWidth={2} />
              </button>
            )}
            <GripVertical
              className="size-4 text-gray-300 transition-colors group-hover:text-gray-400"
              strokeWidth={2}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="my-3 h-px bg-gray-100" />

        {/* Details */}
        <div className="space-y-1.5">
          {/* Email */}
          <div className="flex items-center gap-2 text-gray-500 text-xs">
            <Mail className="size-3.5 shrink-0 text-gray-400" strokeWidth={2} />
            <span className="truncate">{booking.email}</span>
          </div>

          {/* Company */}
          {booking.company_name && (
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Building2
                className="size-3.5 shrink-0 text-gray-400"
                strokeWidth={2}
              />
              <span className="truncate">{booking.company_name}</span>
            </div>
          )}

          {/* Company ID — deal only */}
          {booking.status === "deal" && booking.company_id && (
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Hash className="size-3.5 shrink-0 text-gray-400" strokeWidth={2} />
              <span className="font-mono text-gray-400">company {booking.company_id}</span>
            </div>
          )}

          {/* Social */}
          {booking.social_media_url && socialDisplay && (
            <div className="flex items-center gap-2 text-xs">
              <ExternalLink
                className="size-3.5 shrink-0 text-gray-400"
                strokeWidth={2}
              />
              <a
                href={booking.social_media_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="max-w-45 truncate text-blue-500 underline-offset-2 hover:underline"
              >
                {socialDisplay}
              </a>
            </div>
          )}
        </div>

        {/* Scheduled slot — prominent */}
        {booking.scheduled_at && scheduledLabel && (
          <>
            <div className="my-3 h-px bg-gray-100" />
            <div
              className={`flex items-center gap-2 rounded-lg px-3 py-2 ${cfg.badgeBg}`}
            >
              <CalendarDays
                className={`size-3.5 shrink-0 ${cfg.badgeText}`}
                strokeWidth={2}
              />
              <span className={`font-medium text-xs ${cfg.badgeText}`}>
                {scheduledLabel}
                <span className="ml-1 font-normal opacity-70">(GE)</span>
              </span>
            </div>
          </>
        )}

        {/* Footer: submitted */}
        <div className="mt-3 flex items-center gap-1.5 text-gray-400 text-xs">
          <Clock className="size-3 shrink-0" strokeWidth={2} />
          <span>Submitted {submittedAt}</span>
        </div>

        {/* Access key — deal only */}
        {booking.status === "deal" && (
          <AccessKeyButton
            bookingId={booking.id}
            initialKey={booking.access_keys?.[0] ?? null}
          />
        )}
      </div>
    </div>
  );
}

// ─── Access Key Button ────────────────────────────────────────────────────────

type KeyState =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "done"; key: string; emailSent: boolean; emailError: string | null; expiresAt: string }
  | { phase: "error"; message: string };

function formatTimeLeft(expiresAt: string): { label: string; urgent: boolean } {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return { label: "Expired", urgent: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days >= 1) return { label: `${days}d left`, urgent: days <= 3 };
  const hours = Math.floor(diff / (1000 * 60 * 60));
  return { label: hours > 0 ? `${hours}h left` : "< 1h left", urgent: true };
}

function AccessKeyButton({
  bookingId,
  initialKey,
}: {
  bookingId: number;
  initialKey: { key: string; expires_at: string } | null;
}) {
  const [state, setState] = useState<KeyState>(
    initialKey
      ? { phase: "done", key: initialKey.key, emailSent: true, emailError: null, expiresAt: initialKey.expires_at }
      : { phase: "idle" },
  );
  const [copied, setCopied] = useState(false);
  const [validityDays, setValidityDays] = useState(14);
  const [editingExpiry, setEditingExpiry] = useState(false);
  const [newDays, setNewDays] = useState(14);
  const [updatingExpiry, setUpdatingExpiry] = useState(false);

  async function handleGenerate(e: React.MouseEvent) {
    e.stopPropagation();
    setState({ phase: "loading" });

    const res = await fetch("/api/admin/generate-access-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, validityDays }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setState({ phase: "error", message: data.error ?? "Failed to generate key" });
      return;
    }

    const data = await res.json();
    setState({ phase: "done", key: data.key, emailSent: data.emailSent, emailError: data.emailError ?? null, expiresAt: data.expiresAt });
  }

  async function handleUpdateExpiry(e: React.MouseEvent) {
    e.stopPropagation();
    if (state.phase !== "done") return;
    setUpdatingExpiry(true);

    const res = await fetch("/api/admin/generate-access-key", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, validityDays: newDays }),
    });

    setUpdatingExpiry(false);

    if (res.ok) {
      const data = await res.json();
      setState({ ...state, expiresAt: data.expiresAt });
      setEditingExpiry(false);
    }
  }

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    if (state.phase !== "done") return;
    await navigator.clipboard.writeText(state.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function stopDrag(e: React.PointerEvent) {
    e.stopPropagation();
  }

  function openExpiryEdit(e: React.MouseEvent) {
    e.stopPropagation();
    if (state.phase !== "done") return;
    const remaining = Math.ceil((new Date(state.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    setNewDays(Math.max(1, remaining));
    setEditingExpiry(true);
  }

  return (
    <div className="mt-3" onPointerDown={stopDrag}>
      {/* Validity selector — shown when no key yet */}
      {(state.phase === "idle" || state.phase === "error") && (
        <div className="mb-2 flex items-center gap-1.5">
          <Clock className="size-3 text-gray-400" strokeWidth={2} />
          <span className="text-gray-500 text-xs">Valid for</span>
          <input
            type="number"
            min={1}
            max={365}
            value={validityDays}
            onChange={(e) => setValidityDays(Math.max(1, Math.min(365, Number(e.target.value) || 1)))}
            onClick={(e) => e.stopPropagation()}
            className="w-12 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-center font-medium text-gray-700 text-xs focus:border-emerald-400 focus:outline-none"
          />
          <span className="text-gray-500 text-xs">days</span>
        </div>
      )}

      {state.phase !== "done" && (
        <button
          type="button"
          disabled={state.phase === "loading"}
          onClick={handleGenerate}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-medium text-emerald-700 text-xs transition-colors hover:bg-emerald-100 disabled:opacity-60"
        >
          {state.phase === "loading" ? (
            <>
              <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
              Generating…
            </>
          ) : (
            <>
              <Key className="size-3.5" strokeWidth={2} />
              Generate Access Key
            </>
          )}
        </button>
      )}

      {state.phase === "error" && (
        <p className="mt-1.5 text-center text-red-500 text-xs">{state.message}</p>
      )}

      {state.phase === "done" && (() => {
        const { label, urgent } = formatTimeLeft(state.expiresAt);
        return (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
            {/* Key + copy */}
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-semibold text-emerald-800 text-xs tracking-widest">
                {state.key}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                title="Copy key"
                className="shrink-0 rounded p-0.5 text-emerald-600 transition-colors hover:bg-emerald-100"
              >
                {copied ? (
                  <Check className="size-3.5" strokeWidth={2.5} />
                ) : (
                  <Copy className="size-3.5" strokeWidth={2} />
                )}
              </button>
            </div>

            {/* Expiry row */}
            {!editingExpiry ? (
              <div className="mt-1 flex items-center gap-1">
                <p className={`text-xs ${urgent ? "text-amber-600" : "text-emerald-600"}`}>
                  {state.emailSent ? `Sent to client's email · ${label}` : label}
                </p>
                <button
                  type="button"
                  onClick={openExpiryEdit}
                  title="Change expiry"
                  className="rounded p-0.5 text-emerald-400 transition-colors hover:bg-emerald-100 hover:text-emerald-600"
                >
                  <Pencil className="size-3" strokeWidth={2} />
                </button>
              </div>
            ) : (
              <div className="mt-1.5 flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={newDays}
                  onChange={(e) => setNewDays(Math.max(1, Math.min(365, Number(e.target.value) || 1)))}
                  onClick={(e) => e.stopPropagation()}
                  className="w-12 rounded border border-emerald-300 bg-white px-1.5 py-0.5 text-center font-medium text-gray-700 text-xs focus:border-emerald-400 focus:outline-none"
                />
                <span className="text-emerald-600 text-xs">days</span>
                <button
                  type="button"
                  onClick={handleUpdateExpiry}
                  disabled={updatingExpiry}
                  className="rounded bg-emerald-600 px-1.5 py-0.5 font-medium text-white text-xs transition-colors hover:bg-emerald-700 disabled:opacity-60"
                >
                  {updatingExpiry ? <Loader2 className="size-3 animate-spin" strokeWidth={2} /> : "Set"}
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setEditingExpiry(false); }}
                  className="rounded p-0.5 text-gray-400 transition-colors hover:text-gray-600"
                >
                  <X className="size-3" strokeWidth={2} />
                </button>
              </div>
            )}

            {!state.emailSent && state.emailError && (
              <p className="mt-0.5 text-red-500 text-xs">Email error: {state.emailError}</p>
            )}
            <button
              type="button"
              onClick={handleGenerate}
              className="mt-1.5 text-emerald-500 text-xs underline-offset-2 hover:underline"
            >
              Regenerate
            </button>
          </div>
        );
      })()}
    </div>
  );
}
