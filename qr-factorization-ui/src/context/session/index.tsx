import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import storage from "../../constants/storage";

interface SessionContextValue {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => Boolean(localStorage.getItem(storage.TOKEN))
  );

  const login = useCallback((token: string) => {
    localStorage.setItem(storage.TOKEN, token);
    setIsAuthenticated(true);
  }, []);
  const logout = useCallback(() => {
    localStorage.removeItem(storage.TOKEN);
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, login, logout }),
    [isAuthenticated, login, logout]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

/* eslint-disable-next-line react-refresh/only-export-components */
export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession debe usarse dentro de SessionProvider");
  return ctx;
}
