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
  Building2,
  CalendarDays,
  Check,
  Clock,
  Copy,
  ExternalLink,
  GripVertical,
  Inbox,
  Key,
  Loader2,
  Mail,
  PhoneCall,
  Trophy,
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
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeBooking ? (
            <BookingCard booking={activeBooking} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

// ─── Kanban Column ────────────────────────────────────────────────────────────

function KanbanColumn({
  status,
  bookings,
}: {
  status: BookingStatus;
  bookings: Booking[];
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
            <DraggableCard key={booking.id} booking={booking} />
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

function DraggableCard({ booking }: { booking: Booking }) {
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
      <BookingCard booking={booking} />
    </div>
  );
}

// ─── Booking Card ─────────────────────────────────────────────────────────────

function BookingCard({
  booking,
  isOverlay = false,
}: {
  booking: Booking;
  isOverlay?: boolean;
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

          {/* Drag handle hint */}
          <GripVertical
            className="size-4 shrink-0 text-gray-300 transition-colors group-hover:text-gray-400"
            strokeWidth={2}
          />
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
  | { phase: "done"; key: string; emailSent: boolean; emailError: string | null }
  | { phase: "error"; message: string };

function AccessKeyButton({
  bookingId,
  initialKey,
}: {
  bookingId: number;
  initialKey: { key: string; expires_at: string } | null;
}) {
  const [state, setState] = useState<KeyState>(
    initialKey
      ? { phase: "done", key: initialKey.key, emailSent: true, emailError: null }
      : { phase: "idle" },
  );
  const [copied, setCopied] = useState(false);

  async function handleGenerate(e: React.MouseEvent) {
    e.stopPropagation();
    setState({ phase: "loading" });

    const res = await fetch("/api/admin/generate-access-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setState({ phase: "error", message: data.error ?? "Failed to generate key" });
      return;
    }

    const data = await res.json();
    setState({ phase: "done", key: data.key, emailSent: data.emailSent, emailError: data.emailError ?? null });
  }

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    if (state.phase !== "done") return;
    await navigator.clipboard.writeText(state.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Prevent pointer-down from propagating to the drag listener
  function stopDrag(e: React.PointerEvent) {
    e.stopPropagation();
  }

  return (
    <div
      className="mt-3"
      onPointerDown={stopDrag}
    >
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

      {state.phase === "done" && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
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
          <p className="mt-1 text-emerald-600 text-xs">
            {state.emailSent ? "Sent to client's email · valid 14 days" : "valid 14 days"}
          </p>
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
      )}
    </div>
  );
}
