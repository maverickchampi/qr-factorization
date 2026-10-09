import "./styles.css";

function Feature({ text }: { text: string }) {
  return (
    <li>
      <span className="feat-ic">
        <svg
          viewBox="0 0 24 24"
          width="11"
          height="11"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
      {text}
    </li>
  );
}

export default Feature;
