interface KpiCardProps {
  label: string;
  value: string;
  hint: string;
}

export function KpiCard({ label, value, hint }: KpiCardProps) {
  return (
    <article className="kpi-card">
      <span className="kpi-card__label">{label}</span>
      <strong>{value}</strong>
      <p>{hint}</p>
    </article>
  );
}
