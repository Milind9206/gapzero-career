import type { ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Forge } from "@/components/Forge";
import { LogOut } from "lucide-react";

export type NavItem = { to: string; label: string };

export function Backdrop() {
  return (
    <>
      <div className="pointer-events-none fixed -left-24 top-4 -z-10 size-80 rounded-full bg-[oklch(0.78_0.12_235)] opacity-30 blur-3xl" />
      <div className="pointer-events-none fixed -right-20 top-56 -z-10 size-80 rounded-full bg-[oklch(0.78_0.14_300)] opacity-25 blur-3xl" />
      <div className="pointer-events-none fixed bottom-10 right-1/3 -z-10 size-72 rounded-full bg-[oklch(0.8_0.12_12)] opacity-20 blur-3xl" />
    </>
  );
}

export function AppShell({
  roleLabel,
  userName,
  photoUrl,
  nav,
  children,
}: {
  roleLabel: string;
  userName: string;
  photoUrl?: string | null;
  nav: NavItem[];
  children: ReactNode;
}) {
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <Backdrop />
      <div className="relative mx-auto max-w-6xl px-5 py-6 pb-28 sm:px-8 md:pb-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-lg bg-foreground text-[13px] font-extrabold text-background">
              G
            </div>
            <span className="text-[17px] font-extrabold tracking-tight">GapZero</span>
            <span className="hidden rounded-full border border-border bg-glass px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground sm:inline">
              {roleLabel}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
              {userName}
            </span>
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={userName}
                className="size-9 rounded-full object-cover ring-1 ring-border"
              />
            ) : (
              <div className="grid size-9 place-items-center rounded-full bg-muted text-xs font-bold">
                {userName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <button
              onClick={signOut}
              aria-label="Sign out"
              className="grid size-9 place-items-center rounded-full bg-glass text-muted-foreground ring-1 ring-border hover:text-foreground"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </header>

        {nav.length > 1 && (
          <nav className="mt-5 hidden gap-1.5 md:flex">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to.split("/").length <= 2 }}
                activeProps={{
                  className: "bg-foreground text-background",
                }}
                inactiveProps={{ className: "bg-glass text-muted-foreground hover:text-foreground" }}
                className="rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-wider ring-1 ring-border"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        <main className="mt-6 space-y-5">{children}</main>
      </div>

      {nav.length > 1 && (
        <nav className="fixed inset-x-0 bottom-0 z-30 md:hidden">
          <div className="mx-auto flex max-w-md items-center justify-around rounded-t-3xl bg-glass-strong px-4 py-3 backdrop-blur-md ring-1 ring-border">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to.split("/").length <= 2 }}
                activeProps={{ className: "text-foreground [&>span:first-child]:bg-primary" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className="flex flex-col items-center gap-1"
              >
                <span className="size-1.5 rounded-full bg-current" />
                <span className="font-mono text-[10px] uppercase tracking-wider">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}

      <Forge />
    </div>
  );
}
