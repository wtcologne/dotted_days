type ProgressBarProps = {
  value: number;
};

export function ProgressBar({ value }: ProgressBarProps) {
  const width = `${Math.min(Math.max(value, 0), 1) * 100}%`;

  return (
    <div className="h-2 overflow-hidden rounded-full bg-[#EFE7DC]" aria-hidden="true">
      <div
        className="h-full rounded-full bg-sage transition-[width] duration-500 ease-out"
        style={{ width }}
      />
    </div>
  );
}
