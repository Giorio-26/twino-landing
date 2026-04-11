"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAdminAuthenticated");
    const isLoginPage = pathname === "/en/admin" || pathname === "/ka/admin";

    if (!isAuthenticated && !isLoginPage) {
      router.push("/en/admin");
    } else {
      setIsLoading(false);
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("isAdminAuthenticated");
    router.push("/en/admin");
  };

  const isLoginPage = pathname === "/en/admin" || pathname === "/ka/admin";

  if (isLoading && !isLoginPage) {
    return null; // Or a loading spinner
  }

  if (isLoginPage) {
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
