"use client";

import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createBrowserSupabaseClient } from "./client";

export type SupabaseAuthState = {
  supabase: SupabaseClient | null;
  session: Session | null;
  user: User | null;
  isConfigured: boolean;
  isLoading: boolean;
  message: string | null;
  signInWithEmail(email: string): Promise<void>;
  signOut(): Promise<void>;
};

export function useSupabaseAuth(): SupabaseAuthState {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(supabase));
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const client = supabase;
    let isMounted = true;

    async function loadSession(): Promise<void> {
      const { data } = await client.auth.getSession();

      if (isMounted) {
        setSession(data.session);
        setIsLoading(false);
      }
    }

    void loadSession();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signInWithEmail = useCallback(
    async (email: string) => {
      if (!supabase) {
        setMessage("Supabase ist noch nicht konfiguriert.");
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      setMessage(error ? error.message : "Check deine E-Mail für den Login-Link.");
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setMessage(null);
  }, [supabase]);

  return {
    supabase,
    session,
    user: session?.user ?? null,
    isConfigured: Boolean(supabase),
    isLoading,
    message,
    signInWithEmail,
    signOut,
  };
}
