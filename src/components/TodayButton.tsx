"use client";

type TodayButtonProps = {
  isDone: boolean;
  onToggleToday(): void;
};

export function TodayButton({ isDone, onToggleToday }: TodayButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggleToday}
      className="min-h-16 w-full rounded-[1.7rem] bg-ink px-5 text-lg font-semibold tracking-[-0.035em] text-paper shadow-soft transition duration-200 active:scale-[0.985] data-[done=true]:bg-sageDeep"
      data-done={isDone}
    >
      {isDone ? "Heute geschafft" : "Heute erledigen"}
    </button>
  );
}
