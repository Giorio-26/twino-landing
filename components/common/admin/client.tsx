"use client";

import { useEffect, useOptimistic, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

type Booking = {
  id: number;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  company_name: string | null;
  social_media_url: string | null;
  reached: boolean;
};

type BookingsClientProps = {
  initialBookings: Booking[];
};

export default function BookingsClient({
  initialBookings,
}: BookingsClientProps) {
  const [bookings, setBookings] = useState(initialBookings);
  const [_isPending, startTransition] = useTransition();

  const [optimisticBookings, setOptimisticBookings] = useOptimistic(
    bookings,
    (state, { id, reached }: { id: number; reached: boolean }) => {
      return state.map((booking) =>
        booking.id === id ? { ...booking, reached } : booking,
      );
    },
  );

  const supabase = createClient();

  const handleToggleReached = async (id: number, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    startTransition(() => {
      setOptimisticBookings({ id, reached: newStatus });
    });

    const { error } = await supabase
      .from("booking_requests")
      .update({ reached: newStatus })
      .match({ id });

    if (error) {
      console.error("Error updating booking:", error);
      // Revert the optimistic update on error
      setBookings((bookings) =>
        bookings.map((b) =>
          b.id === id ? { ...b, reached: currentStatus } : b,
        ),
      );
    } else {
      // Manually update the state after successful Supabase call
      setBookings((bookings) =>
        bookings.map((b) => (b.id === id ? { ...b, reached: newStatus } : b)),
      );
    }
  };

  const newBookings = optimisticBookings.filter((b) => !b.reached);
  const reachedBookings = optimisticBookings.filter((b) => b.reached);

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 font-bold text-2xl">Booking Requests</h1>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-4 font-semibold text-xl">New</h2>
          <div className="space-y-4">
            {newBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onToggleReached={handleToggleReached}
              />
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-4 font-semibold text-xl">Reached</h2>
          <div className="space-y-4">
            {reachedBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onToggleReached={handleToggleReached}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

type BookingCardProps = {
  booking: Booking;
  onToggleReached: (id: number, currentStatus: boolean) => void;
};

function BookingCard({ booking, onToggleReached }: BookingCardProps) {
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    setFormattedDate(new Date(booking.created_at).toLocaleString());
  }, [booking.created_at]);

  return (
    <div className="group relative rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md">
  {/* Top Section */}
  <div className="flex items-start justify-between gap-4">
    {/* Left Content */}
    <div className="min-w-0">
      {/* Name */}
      <p className="text-lg font-semibold text-gray-900 leading-tight">
        {booking.first_name} {booking.last_name}
      </p>

      {/* Email */}
      <p className="mt-1 text-sm text-gray-600 truncate">
        {booking.email}
      </p>

      {/* Company */}
      {booking.company_name && (
        <p className="mt-1 text-sm text-gray-500">
          <span className="font-medium text-gray-700">Company:</span>{" "}
          {booking.company_name}
        </p>
      )}

      {/* Social */}
      {booking.social_media_url && (
        <p className="mt-1 text-sm text-gray-500 flex items-center gap-1">
          <span className="font-medium text-gray-700">Social:</span>
          <a
            href={booking.social_media_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 hover:underline truncate max-w-[180px]"
          >
            {booking.social_media_url}
          </a>
        </p>
      )}

      {/* Date */}
      <p className="mt-3 text-xs text-gray-400">
        {formattedDate}
      </p>
    </div>

    {/* Right Actions */}
    <div className="flex flex-col items-end gap-2">
      {/* Status Badge */}
      <span
        className={`text-xs font-medium px-2 py-1 rounded-full ${
          booking.reached
            ? "bg-yellow-100 text-yellow-700"
            : "bg-green-100 text-green-700"
        }`}
      >
        {booking.reached ? "Reached" : "New"}
      </span>

      {/* Action Button */}
      <button
        type="button"
        onClick={() => onToggleReached(booking.id, booking.reached)}
        className={`text-xs font-semibold px-3 py-1.5 rounded-full transition 
        focus:outline-none focus:ring-2 focus:ring-offset-1
        ${
          booking.reached
            ? "bg-yellow-200 text-yellow-900 hover:bg-yellow-300 focus:ring-yellow-400"
            : "bg-green-200 text-green-900 hover:bg-green-300 focus:ring-green-400"
        }`}
      >
        {booking.reached ? "Mark as New" : "Mark as Reached"}
      </button>
    </div>
  </div>

  {/* Subtle hover border glow */}
  <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-transparent group-hover:ring-gray-200 transition" />
</div>
  );
}
