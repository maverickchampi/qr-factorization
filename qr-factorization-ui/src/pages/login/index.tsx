import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Feature from "../../components/feature";
import Field from "../../components/field";
import Footer from "../../components/footer";
import Header from "../../components/header";
import Loading from "../../components/loading";
import { useSession } from "../../context/session";
import { useToast } from "../../context/toast";
import useFetch from "../../hooks/useFetch";
import "./styles.css";

const MIN_PASSWORD = 4;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function Login() {
  const navigate = useNavigate();
  const { login } = useSession();
  const { toast } = useToast();
  const { loading, data, fetchData } = useFetch<{ token: string }>({
    baseUrl: import.meta.env.VITE_API_AUTH,
    url: "/v1/login",
    method: "POST",
    errorMessage: "Correo o contraseña incorrectos."
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (data?.token) {
      login(data.token);
      toast("Sesión iniciada correctamente.", "success");
      navigate("/dashboard", { replace: true });
    }
  }, [data, login, navigate, toast]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    const emailValue = email.trim();
    if (!emailValue) {
      toast("Ingresa tu correo electrónico.", "error");
      return;
    }
    if (!isValidEmail(emailValue)) {
      toast("Ingresa un correo electrónico válido.", "error");
      return;
    }
    if (password.length < MIN_PASSWORD) {
      toast(`La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`, "error");
      return;
    }

    fetchData({ email: emailValue, password });
  };

  return (
    <>
      {loading && <Loading full label="Iniciando sesión…" />}

      <div className="page login-page">
        <Header
          title="Factorización QR"
          subtitle="Inicia sesión para usar la calculadora"
        />

        <main className="login-layout">
          <section className="login-hero">
            <div className="hero-inner">
              <span className="hero-badge">
                <span className="hero-dot" />
                Calculadora de matrices
              </span>

              <h2>
                Descompón matrices.
                <br />
                <span>Entiende álgebra lineal.</span>
              </h2>

              <p className="hero-desc">
                La descomposición QR factoriza una matriz A en una matriz
                ortogonal Q y una triangular superior R, con métricas de
                verificación en tiempo real.
              </p>

              <ul className="hero-features">
                <Feature text="Rotaciones de Givens" />
                <Feature text="Métricas: reconstrucción y ortogonalidad" />
                <Feature text="Modo claro y oscuro" />
              </ul>
            </div>
          </section>

          <section className="login-card">
            <h2>Inicia sesión</h2>
            <p className="login-subtitle">Tu sesión durará 5 minutos</p>

            <form onSubmit={handleSubmit} noValidate>
              <Field
                label="Correo electrónico"
                type="email"
                placeholder="admin@admin.com"
                value={email}
                onChange={setEmail}
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    width="17"
                    height="17"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="3" />
                    <path d="m3 7 9 6 9-6" />
                  </svg>
                }
              />
              <Field
                label="Contraseña"
                type="password"
                placeholder="admin"
                value={password}
                onChange={setPassword}
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    width="17"
                    height="17"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                }
              />

              <button
                type="submit"
                className="btn-login"
                disabled={loading}
              >
                Ingresar
              </button>
            </form>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}

export default Login;
