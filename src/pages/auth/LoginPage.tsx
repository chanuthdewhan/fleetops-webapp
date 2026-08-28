// src/pages/auth/LoginPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Truck, UserCog, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { login as loginApi } from "@/services/auth";
import { loginSchema, type LoginForm } from "@/schemas/authSchema";

const DEMO_ACCOUNTS = [
  {
    role: "Dispatcher",
    username: "dispatcher1",
    password: "secret123",
    icon: UserCog,
  },
  { role: "Driver", username: "driver1", password: "secret123", icon: Truck },
];

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const res = await loginApi(data);
      login(res.token, { username: res.username, role: res.role });
      toast.success("Logged in successfully");
      navigate(res.role === "DRIVER" ? "/driver" : "/dashboard");
    } catch (err: any) {
      const message = err.response?.data?.detail ?? "Login failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (username: string, password: string) => {
    setValue("username", username);
    setValue("password", password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <div className="mx-auto h-11 w-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
            <Truck className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold mt-3">FleetOps</h1>
          <p className="text-sm text-muted-foreground">
            Fleet & Logistics Dispatch System
          </p>
        </div>

        <div className="rounded-xl border border-border bg-background p-6 shadow-sm space-y-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                autoComplete="username"
                {...register("username")}
              />
              {errors.username && (
                <p className="text-sm text-destructive">
                  {errors.username.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground">
                Demo accounts
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {DEMO_ACCOUNTS.map(({ role, username, password, icon: Icon }) => (
              <button
                key={username}
                type="button"
                onClick={() => fillDemo(username, password)}
                className="w-full flex items-center justify-between rounded-lg border border-border px-3 py-2 text-left hover:bg-accent hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{role}</p>
                    <p className="text-xs text-muted-foreground">{username}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  Use this →
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
