"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  useEffect(() => {
    if (
      !isLoading &&
      !user &&
      pathname !== "/en/admin" &&
      pathname !== "/ka/admin"
    ) {
      router.push("/en/admin");
    }
  }, [isLoading, user, pathname, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/en/admin");
    router.refresh();
  };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  if (pathname === "/en/admin" || pathname === "/ka/admin") {
    return <>{children}</>;
  }

  return (
    <div>
      <header className="flex items-center justify-between bg-gray-800 p-4 text-white">
        <h1 className="text-xl">Admin Panel</h1>
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
