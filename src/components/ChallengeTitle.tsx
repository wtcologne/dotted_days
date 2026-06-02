"use client";

import type { ChangeEvent } from "react";
import { useEffect, useRef } from "react";

type ChallengeTitleProps = {
  title: string;
  onTitleChange(title: string): void;
};

export function ChallengeTitle({ title, onTitleChange }: ChallengeTitleProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function resizeTextarea() {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 148)}px`;
  }

  useEffect(() => {
    resizeTextarea();
  }, [title]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onTitleChange(event.target.value);
  };

  return (
    <label className="block">
      <span className="sr-only">Challenge-Titel</span>
      <textarea
        ref={textareaRef}
        value={title}
        onChange={handleChange}
        rows={2}
        maxLength={120}
        placeholder="Was ist deine Challenge?"
        className="max-h-40 min-h-[5.2rem] w-full resize-none bg-transparent text-[2.45rem] font-semibold leading-[0.98] tracking-[-0.075em] text-ink outline-none placeholder:text-muted/50 sm:text-5xl"
      />
    </label>
  );
}
