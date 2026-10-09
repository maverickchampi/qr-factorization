import { useEffect, useLayoutEffect } from "react";
import Loading from "./components/loading";
import storage from "./constants/storage";
import { SessionProvider, useSession } from "./context/session";
import { ToastProvider } from "./context/toast";
import useFetch from "./hooks/useFetch";
import AppRoutes from "./routes";

function AppContent() {
  const session = useSession();
  const { loading, data, fetchData  } = useFetch<{ token: string }>({
    baseUrl: import.meta.env.VITE_API_AUTH,
    url: "/v1/validate",
    method: "GET",
    hasAuthorization: true
  });

  useEffect(() => {
    if (data?.token) {
      session.login(data.token);
    }
  }, [data, session]);

  useLayoutEffect(() => {
    if (localStorage.getItem(storage.TOKEN)){
      fetchData();
    }
  }, [fetchData]);

  return (
    <>
      {loading
        ? <Loading full label="Verificando sesión…" />
        : <AppRoutes />
      }
    </>
  );
}

const App = () => (
  <SessionProvider>
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  </SessionProvider>
);

export default App;
