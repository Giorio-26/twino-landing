"use client";

import { LogOut } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface EventShellProps {
  children: React.ReactNode;
  role: "organizer" | "company";
  locale: string;
}

export default function EventShell({ children, role, locale }: EventShellProps) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await fetch("/api/event/sign-out", { method: "POST" });
    const target =
      role === "organizer"
        ? `/${locale}/event/organizer/access`
        : `/${locale}/event/company/access`;
    router.push(target);
    router.refresh();
  }

  return (
    <div className="dashboard-theme flex min-h-screen flex-col bg-white">
      <header className="mx-auto flex h-16 w-full max-w-350 shrink-0 items-center justify-between border-b border-black/5 bg-white/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Image
            src="/images/twino.svg"
            alt="Twino"
            width={90}
            height={24}
            priority
          />
          <span className="rounded-full bg-accent/10 px-2.5 py-0.5 font-medium text-accent text-xs capitalize">
            {role}
          </span>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex items-center gap-2 rounded-xl border border-black/8 px-3 py-2 text-primary/50 text-sm transition-colors hover:border-black/15 hover:text-primary/80 disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </header>

      <main className="flex-1 bg-accent-secondary-light/50 p-6">
        <div className="mx-auto w-full max-w-350">
          {children}
        </div>
      </main>
    </div>
  );
}
