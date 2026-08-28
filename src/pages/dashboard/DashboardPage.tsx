// src/pages/dashboard/DashboardPage.tsx
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Plus,
  Clock,
  UserCheck,
  Truck,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders, useCreateOrder } from "@/hooks/useOrders";
import { useCustomers } from "@/hooks/useCustomers";
import {
  orderSchema,
  type OrderForm,
  type OrderFormInput,
} from "@/schemas/orderSchema";
import type { Order, OrderStatus } from "@/types";
import { cn } from "@/lib/utils";

const COLUMNS: {
  status: OrderStatus;
  label: string;
  icon: typeof Clock;
  accent: string;
}[] = [
  {
    status: "PENDING",
    label: "Pending",
    icon: Clock,
    accent: "text-slate-500",
  },
  {
    status: "ASSIGNED",
    label: "Assigned",
    icon: UserCheck,
    accent: "text-blue-500",
  },
  {
    status: "IN_TRANSIT",
    label: "In Transit",
    icon: Truck,
    accent: "text-amber-500",
  },
  {
    status: "DELIVERED",
    label: "Delivered",
    icon: CheckCircle2,
    accent: "text-emerald-500",
  },
];

function StatCard({
  label,
  count,
  icon: Icon,
  accent,
}: {
  label: string;
  count: number;
  icon: typeof Clock;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4 shadow-sm flex items-center gap-3">
      <div
        className={cn(
          "h-9 w-9 rounded-lg bg-muted flex items-center justify-center",
          accent,
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-2xl font-semibold leading-none">{count}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  return (
    <Link
      to={`/orders/${order.id}`}
      className="block rounded-lg border border-border bg-background p-3 hover:border-primary/50 hover:shadow-sm transition-all"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          #{order.id}
        </span>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium mt-1">{order.customerName}</p>
      <p className="text-xs text-muted-foreground mt-0.5 truncate">
        {order.pickupAddress} → {order.dropoffAddress}
      </p>
    </Link>
  );
}

export default function DashboardPage() {
  const [open, setOpen] = useState(false);

  const { data: board, isLoading } = useOrders(0, undefined, 50);
  const { data: pendingCount } = useOrders(0, "PENDING", 1);
  const { data: assignedCount } = useOrders(0, "ASSIGNED", 1);
  const { data: transitCount } = useOrders(0, "IN_TRANSIT", 1);
  const { data: deliveredCount } = useOrders(0, "DELIVERED", 1);
  const { data: customersData } = useCustomers(0);
  const createOrder = useCreateOrder();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<OrderFormInput, unknown, OrderForm>({
    resolver: zodResolver(orderSchema),
  });

  const columns = useMemo(() => {
    const grouped: Record<OrderStatus, Order[]> = {
      PENDING: [],
      ASSIGNED: [],
      IN_TRANSIT: [],
      DELIVERED: [],
      CANCELLED: [],
    };
    board?.content.forEach((o) => grouped[o.status]?.push(o));
    return grouped;
  }, [board]);

  const counts = [
    {
      label: "Pending",
      count: pendingCount?.totalElements ?? 0,
      icon: Clock,
      accent: "text-slate-500",
    },
    {
      label: "Assigned",
      count: assignedCount?.totalElements ?? 0,
      icon: UserCheck,
      accent: "text-blue-500",
    },
    {
      label: "In Transit",
      count: transitCount?.totalElements ?? 0,
      icon: Truck,
      accent: "text-amber-500",
    },
    {
      label: "Delivered",
      count: deliveredCount?.totalElements ?? 0,
      icon: CheckCircle2,
      accent: "text-emerald-500",
    },
  ];

  const onSubmit = (data: OrderForm) => {
    createOrder.mutate(data, {
      onSuccess: () => {
        toast.success("Order created");
        reset();
        setOpen(false);
      },
      onError: (err: any) =>
        toast.error(err.response?.data?.detail ?? "Failed to create order"),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="h-4 w-4" />
                New Order
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Order</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Customer</Label>
                <Select
                  onValueChange={(v) => setValue("customerId", Number(v))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    {customersData?.content.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.customerId && (
                  <p className="text-sm text-destructive">
                    {errors.customerId.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickupAddress">Pickup Address</Label>
                <Input id="pickupAddress" {...register("pickupAddress")} />
                {errors.pickupAddress && (
                  <p className="text-sm text-destructive">
                    {errors.pickupAddress.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dropoffAddress">Dropoff Address</Label>
                <Input id="dropoffAddress" {...register("dropoffAddress")} />
                {errors.dropoffAddress && (
                  <p className="text-sm text-destructive">
                    {errors.dropoffAddress.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="weightKg">Weight (kg)</Label>
                <Input
                  id="weightKg"
                  type="number"
                  step="0.01"
                  {...register("weightKg")}
                />
                {errors.weightKg && (
                  <p className="text-sm text-destructive">
                    {errors.weightKg.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? "Creating..." : "Create Order"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {counts.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {COLUMNS.map(({ status, label, icon: Icon, accent }) => (
            <div
              key={status}
              className="rounded-xl border border-border bg-muted/40 p-3 space-y-3"
            >
              <div className="flex items-center gap-2 px-1">
                <Icon className={cn("h-4 w-4", accent)} />
                <h2 className="text-sm font-semibold">{label}</h2>
                <span className="text-xs text-muted-foreground ml-auto">
                  {columns[status].length}
                </span>
              </div>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {columns[status].length > 0 ? (
                  columns[status].map((o) => <OrderCard key={o.id} order={o} />)
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    No orders
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
