import { fmt, type Matrix } from "../../utils/qr";
import "./styles.css";

interface MatrixTableProps {
  name: string;
  title: string;
  tone: "q" | "r";
  data: Matrix;
  digits: number;
}

function MatrixTable({ name, title, tone, data, digits }: MatrixTableProps) {
  const cols = data[0]?.length ?? 0;
  return (
    <div className={`matrix-card matrix-card-${tone}`}>
      <div className="card-head">
        <span className="chip">{name}</span>
        <h3>{title}</h3>
      </div>
      <div className="table-wrap">
        <table className="matrix-table">
          <thead>
            <tr>
              <th className="corner" />
              {Array.from({ length: cols }, (_, j) => (
                <th key={j}>{j + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <th>{i + 1}</th>
                {row.map((v, j) => (
                  <td key={j}>{fmt(v, digits)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MatrixTable;
