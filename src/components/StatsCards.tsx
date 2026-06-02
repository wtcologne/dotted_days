type StatsCardsProps = {
  progress: number;
  daysInMonth: number;
  streak: number;
};

export function StatsCards({ progress, daysInMonth, streak }: StatsCardsProps) {
  return (
    <section className="grid grid-cols-2 gap-3" aria-label="Monatsfortschritt">
      <StatCard value={`${progress}/${daysInMonth}`} label="Monat" />
      <StatCard value={String(streak)} label="Streak" />
    </section>
  );
}

type StatCardProps = {
  value: string;
  label: string;
};

function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="rounded-[1.65rem] border border-white/70 bg-paper/70 p-4 shadow-[0_14px_36px_rgba(72,55,40,0.06)] backdrop-blur">
      <div className="text-3xl font-semibold tracking-[-0.06em] text-ink">{value}</div>
      <div className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-muted">{label}</div>
    </div>
  );
}
