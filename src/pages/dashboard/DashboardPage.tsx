import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Plus, ChevronRight } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { useOrders, useCreateOrder } from "@/hooks/useOrders";
import { useCustomers } from "@/hooks/useCustomers";
import { orderSchema, type OrderForm } from "@/schemas/orderSchema";

export default function DashboardPage() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);

  const { data, isLoading } = useOrders(page);
  const { data: customersData } = useCustomers(0);
  const createOrder = useCreateOrder();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<OrderForm>({ resolver: zodResolver(orderSchema) });

  const orders = data?.content ?? [];

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

      <div className="rounded-xl border border-border bg-background p-4 shadow-sm space-y-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : orders.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {order.pickupAddress} → {order.dropoffAddress}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/orders/${order.id}`}>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination
              page={page}
              totalPages={data?.totalPages ?? 0}
              onPageChange={setPage}
            />
          </>
        ) : (
          <EmptyState
            title="No orders yet"
            description="Create your first order to get started."
          />
        )}
      </div>
    </div>
  );
}
