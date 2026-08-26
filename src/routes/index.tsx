// src/routes/index.tsx
import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types";
import { Spinner } from "@/components/ui/spinner";

const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage"));
const CustomersPage = lazy(() => import("@/pages/customers/CustomersPage"));
const FleetPage = lazy(() => import("@/pages/fleet/FleetPage"));
const OrderDetailPage = lazy(() => import("@/pages/orders/OrderDetailPage"));
const DriverPage = lazy(() => import("@/pages/driver/DriverPage"));
const NotificationsPage = lazy(
  () => import("@/pages/notifications/NotificationsPage"),
);
const NotFound = lazy(() => import("@/pages/NotFound"));
const AppLayout = lazy(() =>
  import("@/layouts/AppLayout").then((m) => ({ default: m.AppLayout })),
);

// Guards authentication only — used once, wrapping the whole protected area.
const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Guards role, assumes RequireAuth already ran above it in the tree.
const RequireRole = ({
  children,
  roles,
}: {
  children: ReactNode;
  roles: UserRole[];
}) => {
  const { user } = useAuth();
  if (user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

export default function Router() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/"
              element={
                <RequireAuth>
                  <AppLayout />
                </RequireAuth>
              }
            >
              <Route
                index
                element={
                  <RequireRole roles={["DISPATCHER"]}>
                    <DashboardPage />
                  </RequireRole>
                }
              />
              <Route
                path="dashboard"
                element={
                  <RequireRole roles={["DISPATCHER"]}>
                    <DashboardPage />
                  </RequireRole>
                }
              />
              <Route
                path="customers"
                element={
                  <RequireRole roles={["DISPATCHER"]}>
                    <CustomersPage />
                  </RequireRole>
                }
              />
              <Route
                path="fleet"
                element={
                  <RequireRole roles={["DISPATCHER"]}>
                    <FleetPage />
                  </RequireRole>
                }
              />
              <Route
                path="orders/:id"
                element={
                  <RequireRole roles={["DISPATCHER"]}>
                    <OrderDetailPage />
                  </RequireRole>
                }
              />
              <Route
                path="driver"
                element={
                  <RequireRole roles={["DRIVER"]}>
                    <DriverPage />
                  </RequireRole>
                }
              />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
