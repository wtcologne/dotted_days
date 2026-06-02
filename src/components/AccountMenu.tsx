"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import type { SupabaseAuthState } from "@/lib/supabase/use-supabase-auth";

type AccountMenuProps = {
  auth: SupabaseAuthState;
};

export function AccountMenu({ auth }: AccountMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");

  const handleToggleOpen = () => {
    setIsOpen((current) => !current);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void auth.signInWithEmail(email);
  };

  const handleSignOut = () => {
    void auth.signOut();
  };

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  return (
    <section className="rounded-[1.5rem] border border-white/70 bg-paper/65 p-3 shadow-[0_12px_28px_rgba(72,55,40,0.05)] backdrop-blur">
      <button
        type="button"
        onClick={handleToggleOpen}
        className="flex min-h-11 w-full items-center justify-between rounded-[1.1rem] px-2 text-left"
      >
        <span>
          <span className="block text-sm font-semibold text-ink">{getTitle(auth)}</span>
          <span className="mt-0.5 block text-xs text-muted">{getSubtitle(auth)}</span>
        </span>
        <span className="text-sm font-semibold text-muted">{isOpen ? "Schließen" : "Account"}</span>
      </button>

      {isOpen ? (
        <div className="mt-3 border-t border-line/60 pt-3">
          {!auth.isConfigured ? (
            <p className="text-sm leading-5 text-muted">
              Supabase ist noch nicht konfiguriert. Deine Daten bleiben lokal auf diesem Gerät.
            </p>
          ) : auth.user ? (
            <div className="flex items-center justify-between gap-3">
              <p className="min-w-0 truncate text-sm text-muted">{auth.user.email}</p>
              <button
                type="button"
                onClick={handleSignOut}
                className="min-h-10 rounded-full bg-ink px-4 text-sm font-semibold text-paper"
              >
                Logout
              </button>
            </div>
          ) : (
            <form className="space-y-3" onSubmit={handleSubmit}>
              <label className="block">
                <span className="sr-only">E-Mail</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="deine@email.de"
                  className="min-h-12 w-full rounded-[1.15rem] border border-line/70 bg-[#FFF9F1] px-4 text-sm font-semibold text-ink outline-none placeholder:text-muted/50 focus:border-sageDeep/40 focus:ring-2 focus:ring-sageDeep/10"
                />
              </label>
              <button
                type="submit"
                disabled={auth.isLoading}
                className="min-h-12 w-full rounded-[1.15rem] bg-ink px-4 text-sm font-semibold text-paper transition active:scale-[0.99] disabled:bg-muted/40"
              >
                Login-Link senden
              </button>
            </form>
          )}

          {auth.message ? <p className="mt-3 text-sm leading-5 text-muted">{auth.message}</p> : null}
        </div>
      ) : null}
    </section>
  );
}

function getTitle(auth: SupabaseAuthState): string {
  if (!auth.isConfigured) {
    return "Guest-Modus";
  }

  return auth.user ? "Synchronisiert" : "Guest-Modus";
}

function getSubtitle(auth: SupabaseAuthState): string {
  if (!auth.isConfigured) {
    return "Lokale Speicherung aktiv";
  }

  return auth.user ? "Supabase ist aktiv" : "Optional mit E-Mail anmelden";
}
