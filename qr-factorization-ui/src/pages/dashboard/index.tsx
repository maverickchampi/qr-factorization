import { useEffect, useState } from "react";
import Footer from "../../components/footer";
import Header from "../../components/header";
import Loading from "../../components/loading";
import MatrixTable from "../../components/matrix-table";
import Stat from "../../components/stat";
import Stepper from "../../components/stepper";
import { useToast } from "../../context/toast";
import useFetch from "../../hooks/useFetch";
import { resize } from "../../utils/matrix";
import { fmt, parseNumber, sanitizeNumeric, type Matrix } from "../../utils/qr";
import "./styles.css";

const MAX_SIZE = 10;
const MIN_SIZE = 1;

interface QRData {
  q: Matrix;
  r: Matrix;
}

interface StatsData {
  max: number;
  min: number;
  average: number;
  sum: number;
  length: number;
  isDiagonal: {
    q: boolean;
    r: boolean;
  };
}

function Dashboard() {
  const { toast } = useToast();
  const { data: qrData, loading: qrLoading, fetchData: fetchQR } = useFetch<QRData>({
    baseUrl: import.meta.env.VITE_API_AUTH,
    url: "/v1/factorization",
    method: "POST",
    hasAuthorization: true
  });
  const { data: statsData, loading: statsLoading, fetchData: fetchStats } = useFetch<StatsData>({
    baseUrl: import.meta.env.VITE_API_STATS,
    url: "/v1/statistics",
    method: "POST",
    hasAuthorization: true
  });
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [matrix, setMatrix] = useState<string[][]>(() => resize([], 3, 3));
  const [digits, setDigits] = useState(4);
  const [qMatrix, setQMatrix] = useState<Matrix | null>(null);
  const [rMatrix, setRMatrix] = useState<Matrix | null>(null);
  const [factorized, setFactorized] = useState<Matrix | null>(null);
  const [blurred, setBlurred] = useState(true);

  const setSize = (r: number, c: number) => {
    const rr = Math.min(Math.max(r, MIN_SIZE), MAX_SIZE);
    const cc = Math.min(Math.max(c, MIN_SIZE), MAX_SIZE);
    setRows(rr);
    setCols(cc);
    setMatrix((prev) => resize(prev, rr, cc));
  };

  const updateCell = (i: number, j: number, val: string) => {
    const sanitized = sanitizeNumeric(val);
    setMatrix((prev) =>
      prev.map((row, ri) => (ri === i ? row.map((v, cj) => (cj === j ? sanitized : v)) : row))
    );
  };

  const loading = qrLoading || statsLoading;

  useEffect(() => {
    if (qrData) {
      void fetchStats({ q: qrData.q, r: qrData.r });
    }
  }, [qrData]);

  useEffect(() => {
    if (qrData && statsData) {
      setQMatrix(qrData.q);
      setRMatrix(qrData.r);
      setFactorized(qrData.q);
      setBlurred(false);
    }
  }, [qrData, statsData]);

  const run = () => {
    if (loading) return;

    const hasEmpty = matrix.some((row) => row.some((v) => v.trim() === ""));
    if (hasEmpty) {
      toast("Completa todas las celdas de la matriz, ninguna puede quedar vacía.", "error");
      return;
    }

    const A = matrix.map((row) => row.map(parseNumber));
    setQMatrix(null);
    setRMatrix(null);
    setFactorized(null);
    setBlurred(true);
    void fetchQR({ matrix: A });
  };

  const randomize = () => {
    setMatrix((prev) =>
      prev.map((row) => row.map(() => String(Math.floor(Math.random() * 19) - 9)))
    );
  };

  const clear = () => {
    setBlurred(true);
    setFactorized(null);
    setMatrix((prev) => prev.map((row) => row.map(() => "")));
  };

  const blurredClass = blurred ? " is-blurred" : "";

  return (
    <>
      <div className="page">
        <Header />

        <div className="workspace">
          <section className="panel input-panel">
            <div className="panel-title">Matriz A</div>

            <div className="steppers">
              <Stepper
                label="Filas (n)"
                value={rows}
                min={MIN_SIZE}
                max={MAX_SIZE}
                onMinus={() => setSize(rows - 1, cols)}
                onPlus={() => setSize(rows + 1, cols)}
              />
              <Stepper
                label="Columnas (m)"
                value={cols}
                min={MIN_SIZE}
                max={MAX_SIZE}
                onMinus={() => setSize(rows, cols - 1)}
                onPlus={() => setSize(rows, cols + 1)}
              />
            </div>

            <p className="caption">
              Ingresa los valores de la matriz ({rows}×{cols}). Usa punto (.) para
              decimales.
            </p>

            <div
              className="matrix-grid"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
              {matrix.flatMap((row, i) =>
                row.map((v, j) => (
                  <input
                    key={`${i}-${j}`}
                    className="cell-input"
                    type="text"
                    inputMode="decimal"
                    value={v}
                    onChange={(e) => updateCell(i, j, e.target.value)}
                    aria-label={`a[${i + 1}][${j + 1}]`}
                  />
                ))
              )}
            </div>

            <div className="actions">
              <button type="button" className="btn btn-ghost" onClick={clear}>
                Limpiar
              </button>
              <button type="button" className="btn btn-ghost" onClick={randomize}>
                Aleatorio
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={run}
                disabled={loading}
              >
                Factorizar
              </button>
            </div>
          </section>

          <section className={`output${blurredClass}${factorized ? "" : " is-empty"}`}>
            <div className="result-head">
              <div>
                <h2>Resultados</h2>
                <p className="result-eq">
                  A <span>=</span> Q <span>·</span> R
                </p>
              </div>
              <label className="digits">
                Decimales
                <select
                  value={digits}
                  onChange={(e) => setDigits(Number(e.target.value))}
                >
                  <option value={2}>2</option>
                  <option value={4}>4</option>
                  <option value={6}>6</option>
                  <option value={8}>8</option>
                </select>
              </label>
            </div>

            {qMatrix && rMatrix && (
              <div className="result-grid">
                <MatrixTable
                  name="Q"
                  title="Matriz ortogonal"
                  tone="q"
                  data={qMatrix}
                  digits={digits}
                />
                <MatrixTable
                  name="R"
                  title="Matriz triangular superior"
                  tone="r"
                  data={rMatrix}
                  digits={digits}
                />
              </div>
            )}

            {blurred && (
              <div className="results-placeholder">
                {loading ? (
                  <Loading label="Calculando métricas…" />
                ) : (
                  <>
                    <svg
                      className="placeholder-icon"
                      viewBox="0 0 24 24"
                      width="26"
                      height="26"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <p>Sin resultados aún</p>
                    <span>Completa la matriz y presiona Factorizar</span>
                  </>
                )}
              </div>
            )}
          </section>
        </div>

        {qMatrix && rMatrix && statsData && (
          <section className={`stats-section${blurredClass}`}>
            <div className="stats-head">
              <h2>Métricas</h2>
              <p>Estadísticas sobre las matrices Q y R</p>
            </div>
            <div className="stats-grid">
              <Stat
                label="Valor mayor"
                value={fmt(statsData.max, digits)}
                hint="Mayor valor en Q y R"
                accent="#4f46e5"
              />
              <Stat
                label="Valor menor"
                value={fmt(statsData.min, digits)}
                hint="Menor valor en Q y R"
                accent="#0d9488"
              />
              <Stat
                label="Valor promedio"
                value={fmt(statsData.average, digits)}
                hint="Media aritmética de los valores"
                accent="#d97706"
              />
              <Stat
                label="Suma de valores"
                value={fmt(statsData.sum, digits)}
                hint="Suma total de las entradas"
                accent="#db2777"
              />
              <Stat
                label="Cantidad de valores"
                value={fmt(statsData.length, 0)}
                hint="Total de entradas en Q y R"
                accent="#2563eb"
              />
              <Stat
                label="Q es diagonal"
                value={statsData.isDiagonal.q ? "Sí" : "No"}
                hint="Todas las entradas fuera de la diagonal son 0"
                accent="#7c3aed"
              />
              <Stat
                label="R es diagonal"
                value={statsData.isDiagonal.r ? "Sí" : "No"}
                hint="Todas las entradas fuera de la diagonal son 0"
                accent="#0891b2"
              />
            </div>
          </section>
        )}

        <Footer />
      </div>
    </>
  );
}

export default Dashboard;
