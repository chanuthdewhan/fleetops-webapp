import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Truck,
  Bell,
  LogOut,
  Menu,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth();
  const navItems = user?.role === "DRIVER" ? driverNav : dispatcherNav;

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 py-5 border-b border-border">
        <h1 className="text-lg font-semibold">FleetOps</h1>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
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
    </div>
  );
}

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden md:flex w-56 border-r border-border bg-background">
        <SidebarContent />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-56 p-0">
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center gap-3 border-b border-border bg-background px-4 py-3">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              }
            />
          </Sheet>
          <h1 className="text-lg font-semibold">FleetOps</h1>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-x-auto">
          <div>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
