import "./styles.css";

interface LoadingProps {
  label?: string;
  full?: boolean;
}

function Loading({ label = "Cargando…", full = false }: LoadingProps) {
  return (
    <div
      className={`loading${full ? " loading-full" : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="spinner" aria-hidden="true" />
      {label && <p>{label}</p>}
    </div>
  );
}

export default Loading;
