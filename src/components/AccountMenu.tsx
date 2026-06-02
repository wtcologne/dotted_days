"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import type { SupabaseAuthState } from "@/lib/supabase/use-supabase-auth";
import { themeOptions, type ThemeOption } from "@/lib/theme/themes";
import type { ThemeState } from "@/lib/theme/use-theme";

type AccountMenuProps = {
  auth: SupabaseAuthState;
  theme: ThemeState;
};

export function AccountMenu({ auth, theme }: AccountMenuProps) {
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
        <div className="mt-3 space-y-4 border-t border-line/60 pt-3">
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
                  className="min-h-12 w-full rounded-[1.15rem] border border-line/70 bg-input px-4 text-base font-semibold text-ink outline-none placeholder:text-muted/50 focus:border-sageDeep/40 focus:ring-2 focus:ring-sageDeep/10"
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

          {auth.message ? <p className="text-sm leading-5 text-muted">{auth.message}</p> : null}

          <ThemePicker theme={theme} />
        </div>
      ) : null}
    </section>
  );
}

type ThemePickerProps = {
  theme: ThemeState;
};

function ThemePicker({ theme }: ThemePickerProps) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Theme</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {themeOptions.map((option) => (
          <ThemeButton
            key={option.id}
            option={option}
            isActive={option.id === theme.themeId}
            onSelectTheme={theme.setTheme}
          />
        ))}
      </div>
    </div>
  );
}

type ThemeButtonProps = {
  option: ThemeOption;
  isActive: boolean;
  onSelectTheme(themeId: ThemeOption["id"]): void;
};

function ThemeButton({ option, isActive, onSelectTheme }: ThemeButtonProps) {
  const handleClick = () => {
    onSelectTheme(option.id);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isActive}
      className={[
        "min-h-12 rounded-[1.15rem] border px-3 text-left transition active:scale-[0.98]",
        isActive ? "border-sageDeep bg-sageSoft" : "border-line/70 bg-paper/70",
      ].join(" ")}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-ink">{option.name}</span>
        <span className="flex -space-x-1">
          {option.colors.map((color) => (
            <span
              key={color}
              className="h-4 w-4 rounded-full border border-white/80 shadow-[0_1px_3px_rgba(31,29,26,0.14)]"
              style={{ backgroundColor: color }}
            />
          ))}
        </span>
      </span>
    </button>
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
