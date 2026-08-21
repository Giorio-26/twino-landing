"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminShell({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`/${locale}/admin`);
    router.refresh();
  };

  return (
    <div>
      <header className="flex items-center justify-between bg-gray-800 p-4 text-white">
        <div className="flex items-center gap-6">
          <h1 className="text-xl">Admin Panel</h1>
          <nav className="flex gap-4 text-sm">
            <a
              href={`/${locale}/admin/bookings`}
              className="text-gray-300 hover:text-white"
            >
              Bookings
            </a>
          </nav>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700"
        >
          Logout
        </button>
      </header>
      <main className="p-4">{children}</main>
    </div>
  );
}
