"use client";

import type { ChangeEvent, FormEvent, MutableRefObject } from "react";
import { useRef, useState } from "react";
import { challengeSuggestions } from "@/lib/challenge/suggestions";

type ChallengeSuggestionsProps = {
  title: string;
  buttonLabel?: string;
  onAcceptTitle(title: string): void;
};

export function ChallengeSuggestions({
  title,
  buttonLabel = "Neue Challenge",
  onAcceptTitle,
}: ChallengeSuggestionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const fallbackIndexRef = useRef(0);

  const handleOpenClick = () => {
    setDraftTitle(title);
    setIsOpen(true);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDraftTitle(event.target.value);
  };

  const handleRandomClick = () => {
    const suggestion = getRandomSuggestion(fallbackIndexRef);
    applySuggestion(suggestion);
  };

  const applySuggestion = (suggestion: string) => {
    setDraftTitle(suggestion);
  };

  const handleAccept = () => {
    const nextTitle = draftTitle.trim();

    if (!nextTitle) {
      return;
    }

    onAcceptTitle(nextTitle);
    setIsOpen(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleAccept();
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={handleOpenClick}
        className="min-h-14 w-full rounded-[1.65rem] border border-line/80 bg-paper/70 px-5 text-left text-base font-semibold text-ink shadow-[0_14px_36px_rgba(72,55,40,0.06)] backdrop-blur transition active:scale-[0.99]"
      >
        {buttonLabel}
      </button>
    );
  }

  return (
    <section className="rounded-[1.75rem] border border-white/70 bg-paper/60 p-4 shadow-[0_14px_36px_rgba(72,55,40,0.05)] backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">Neue Challenge</p>
          <p className="mt-0.5 text-xs text-muted">Schreib frei oder nutze einen Vorschlag</p>
        </div>
        <button
          type="button"
          onClick={handleRandomClick}
          className="min-h-10 rounded-full bg-ink px-4 text-sm font-semibold text-paper transition active:scale-95"
        >
          Zufällig
        </button>
      </div>

      <form className="mt-4 flex gap-2" onSubmit={handleSubmit}>
        <label className="block min-w-0 flex-1">
          <span className="sr-only">Neue Challenge eingeben</span>
          <input
            value={draftTitle}
            onChange={handleInputChange}
            maxLength={120}
            placeholder="Was möchtest du machen?"
            className="min-h-13 w-full rounded-[1.25rem] border border-line/70 bg-input px-4 text-base font-semibold text-ink outline-none placeholder:text-muted/50 focus:border-sageDeep/40 focus:ring-2 focus:ring-sageDeep/10"
          />
        </label>
        <button
          type="submit"
          disabled={draftTitle.trim().length === 0}
          className="min-h-13 shrink-0 rounded-[1.25rem] bg-sageDeep px-4 text-sm font-semibold text-white transition active:scale-95 disabled:cursor-not-allowed disabled:bg-muted/35"
        >
          OK
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {challengeSuggestions.map((suggestion) => (
          <SuggestionChip
            key={suggestion}
            suggestion={suggestion}
            onSelectSuggestion={applySuggestion}
          />
        ))}
      </div>
    </section>
  );
}

type SuggestionChipProps = {
  suggestion: string;
  onSelectSuggestion(title: string): void;
};

function SuggestionChip({ suggestion, onSelectSuggestion }: SuggestionChipProps) {
  const handleClick = () => {
    onSelectSuggestion(suggestion);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="min-h-10 rounded-full border border-line/70 bg-chip px-3 text-sm font-medium text-ink/75 transition hover:bg-sageSoft active:scale-95"
    >
      {suggestion}
    </button>
  );
}

function getRandomSuggestion(fallbackIndexRef: MutableRefObject<number>): string {
  if (typeof window !== "undefined" && window.crypto) {
    const values = new Uint32Array(1);
    window.crypto.getRandomValues(values);

    return challengeSuggestions[values[0] % challengeSuggestions.length];
  }

  fallbackIndexRef.current = (fallbackIndexRef.current + 1) % challengeSuggestions.length;

  return challengeSuggestions[fallbackIndexRef.current];
}
