"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SupabaseChallengeRepository } from "@/lib/challenge/supabase-repository";
import { useSupabaseAuth } from "@/lib/supabase/use-supabase-auth";
import { useTheme } from "@/lib/theme/use-theme";
import { AccountMenu } from "./AccountMenu";

type JoinChallengeProps = {
  inviteCode: string;
};

export function JoinChallenge({ inviteCode }: JoinChallengeProps) {
  const auth = useSupabaseAuth();
  const theme = useTheme();
  const [message, setMessage] = useState<string | null>(null);
  const repository = useMemo(() => {
    if (!auth.supabase || !auth.user) {
      return null;
    }

    return new SupabaseChallengeRepository(auth.supabase, auth.user.id);
  }, [auth.supabase, auth.user]);

  const handleJoinClick = async () => {
    if (!repository) {
      setMessage("Melde dich zuerst an, um beizutreten.");
      return;
    }

    try {
      await repository.joinSharedChallenge(inviteCode);
      setMessage("Du bist dabei. Öffne Dotted Days und schau im Monat unter Gemeinsam.");
    } catch {
      setMessage("Die Einladung konnte nicht gefunden werden.");
    }
  };

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col px-4 pb-[max(1.25rem,calc(env(safe-area-inset-bottom)+1rem))] pt-[max(1.5rem,calc(env(safe-area-inset-top)+1rem))]">
      <div className="flex flex-1 flex-col justify-center gap-5">
        <section className="rounded-[2rem] border border-white/70 bg-paper/75 p-5 shadow-soft backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
            Einladung
          </p>
          <h1 className="mt-2 text-[2.55rem] font-semibold leading-none tracking-[-0.08em] text-ink">
            Gemeinsame Challenge
          </h1>
          <p className="mt-4 text-sm leading-5 text-muted">
            Logge dich ein und tritt dieser Challenge bei. Danach findest du sie im passenden Monat
            im Bereich Gemeinsam.
          </p>
        </section>

        <AccountMenu auth={auth} theme={theme} />

        <button
          type="button"
          onClick={handleJoinClick}
          disabled={!repository}
          className="min-h-14 rounded-[1.5rem] bg-ink px-5 text-base font-semibold text-paper shadow-soft transition active:scale-[0.99] disabled:bg-muted/35"
        >
          Challenge beitreten
        </button>

        {message ? <p className="text-center text-sm leading-5 text-muted">{message}</p> : null}

        <Link
          href="/"
          className="text-center text-sm font-semibold text-muted underline-offset-4 hover:underline"
        >
          Zur App
        </Link>
      </div>
    </main>
  );
}
