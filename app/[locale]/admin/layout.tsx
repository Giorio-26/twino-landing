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
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUser(data.session.user);
      }
      setIsLoading(false);
    };
    getSession();
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
      <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl">Admin Panel</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </header>
      <main className="p-4">{children}</main>
    </div>
  );
}
