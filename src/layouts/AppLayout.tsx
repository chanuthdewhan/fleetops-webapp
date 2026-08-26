import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Users, Truck, Bell, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const dispatcherNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/fleet", label: "Fleet", icon: Truck },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

const driverNav = [
  { to: "/driver", label: "My Trip", icon: Truck },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const navItems = user?.role === "DRIVER" ? driverNav : dispatcherNav;

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-56 border-r border-border flex flex-col">
        <div className="px-4 py-5 border-b border-border">
          <h1 className="text-lg font-semibold">FleetOps</h1>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-border">
          <div className="text-sm text-muted-foreground mb-2">
            {user?.username} · {user?.role}
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
