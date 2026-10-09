import "./styles.css";

interface StatProps {
  label: string;
  value: string;
  hint: string;
  accent?: string;
}

function Stat({ label, value, hint, accent }: StatProps) {
  return (
    <div className="stat-card">
      <span className="stat-dot" style={{ background: accent }} />
      <div className="stat-body">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        <span className="stat-hint">{hint}</span>
      </div>
    </div>
  );
}

export default Stat;
