interface SummaryCardProps {
  title: string;
  value: string;
  color: string;
}

export function SummaryCards({ cards }: { cards: SummaryCardProps[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div key={card.title} className="bg-card border border-border rounded-lg p-6 text-center">
          <h3 className="text-sm text-muted-foreground mb-2">{card.title}</h3>
          <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
