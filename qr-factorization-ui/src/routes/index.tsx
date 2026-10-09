import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useSession } from "../context/session";
import Dashboard from "../pages/dashboard";
import Login from "../pages/login";

function RequireAuth() {
  const { isAuthenticated } = useSession();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function GuestOnly() {
  const { isAuthenticated } = useSession();
  return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" replace />;
}

export default function AppRoutes() {
  const { isAuthenticated } = useSession();
  const redirectTo = isAuthenticated ? "/dashboard" : "/login";

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestOnly />}>
          <Route path="/login" element={<Login />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route path="/" element={<Navigate to={redirectTo} replace />} />
        <Route path="*" element={<Navigate to={redirectTo} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
