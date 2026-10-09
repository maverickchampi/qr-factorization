import "./styles.css";

interface StepperProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onMinus: () => void;
  onPlus: () => void;
}

function Stepper({ label, value, min, max, onMinus, onPlus }: StepperProps) {
  return (
    <div className="stepper">
      <span className="stepper-label">{label}</span>
      <div className="stepper-controls">
        <button
          type="button"
          className="step-btn"
          onClick={onMinus}
          disabled={value <= min}
          aria-label={`Reducir ${label}`}
        >
          −
        </button>
        <span className="stepper-value">{value}</span>
        <button
          type="button"
          className="step-btn"
          onClick={onPlus}
          disabled={value >= max}
          aria-label={`Aumentar ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

export default Stepper;
