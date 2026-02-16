interface SummaryCardProps {
  title: string;
  value: string;
  color: string;
}

export function SummaryCards({ cards }: { cards: SummaryCardProps[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-xl border border-border/70 bg-[linear-gradient(145deg,color-mix(in_oklch,var(--card)_90%,var(--muted)_10%),var(--card))] p-6 shadow-sm"
        >
          <h3 className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{card.title}</h3>
          <p className={`mt-3 text-3xl font-semibold ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
