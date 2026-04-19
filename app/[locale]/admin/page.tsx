"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
    } else {
      router.push("/en/admin/bookings");
      router.refresh(); // Refresh the page to update the session state in the layout
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="w-96 rounded bg-white p-8 shadow-md"
      >
        <h1 className="mb-4 font-bold text-2xl">Admin Login</h1>
        {error && <p className="text-red-500">{error}</p>}
        <div className="mb-4">
          <label className="mb-2 block" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border p-2"
            required
          />
        </div>
        <div className="mb-4">
          <label className="mb-2 block" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border p-2"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full rounded bg-blue-500 p-2 text-white"
        >
          Login
        </button>
      </form>
    </div>
  );
}
