// src/pages/orders/OrderDetailPage.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Package,
  MapPin,
  User,
  Truck,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { useOrder, useAssignOrder } from "@/hooks/useOrders";
import { useDrivers } from "@/hooks/useDrivers";
import { useVehicles } from "@/hooks/useVehicles";
import { useTripsByOrder } from "@/hooks/useTrips";
import {
  assignmentSchema,
  type AssignmentForm,
} from "@/schemas/assignmentSchema";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);

  const { data: order, isLoading: orderLoading } = useOrder(orderId);
  const { data: availableDrivers } = useDrivers(0, "AVAILABLE", 100);
  const { data: availableVehicles } = useVehicles(0, "AVAILABLE", 100);
  const { data: trips, isLoading: tripsLoading } = useTripsByOrder(orderId);
  const assignOrder = useAssignOrder();

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AssignmentForm>({ resolver: zodResolver(assignmentSchema) });

  const onSubmit = (data: AssignmentForm) => {
    assignOrder.mutate(
      { orderId, data },
      {
        onSuccess: () => toast.success("Driver and vehicle assigned"),
        onError: (err: any) =>
          toast.error(err.response?.data?.detail ?? "Failed to assign order"),
      },
    );
  };

  if (orderLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!order) {
    return <EmptyState title="Order not found" />;
  }

  const activeTrip = trips?.find(
    (t) => t.status !== "COMPLETED" && t.status !== "CANCELLED",
  );
  const trip = activeTrip ?? trips?.[trips.length - 1];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Order #{order.id}</h1>
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* Order details panel */}
      <div className="rounded-xl border border-border bg-background p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Order Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <User className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-muted-foreground">Customer</p>
              <p className="font-medium">{order.customerName}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-muted-foreground">Weight</p>
              <p className="font-medium">{order.weightKg} kg</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-muted-foreground">Pickup</p>
              <p className="font-medium">{order.pickupAddress}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-muted-foreground">Dropoff</p>
              <p className="font-medium">{order.dropoffAddress}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment panel — conditional on order status */}
      <div className="rounded-xl border border-border bg-background p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Assignment
        </h2>

        {order.status === "PENDING" ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Driver</Label>
                <Select onValueChange={(v) => setValue("driverId", Number(v))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a driver" />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    {availableDrivers?.content.length ? (
                      availableDrivers.content.map((d) => (
                        <SelectItem key={d.id} value={String(d.id)}>
                          {d.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                        No available drivers
                      </div>
                    )}
                  </SelectContent>
                </Select>
                {errors.driverId && (
                  <p className="text-sm text-destructive">
                    {errors.driverId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Vehicle</Label>
                <Select onValueChange={(v) => setValue("vehicleId", Number(v))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a vehicle" />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    {availableVehicles?.content.length ? (
                      availableVehicles.content.map((v) => (
                        <SelectItem key={v.id} value={String(v.id)}>
                          {v.plateNumber} ({v.vehicleType})
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                        No available vehicles
                      </div>
                    )}
                  </SelectContent>
                </Select>
                {errors.vehicleId && (
                  <p className="text-sm text-destructive">
                    {errors.vehicleId.message}
                  </p>
                )}
              </div>
            </div>
            <Button type="submit" disabled={assignOrder.isPending}>
              {assignOrder.isPending
                ? "Assigning..."
                : "Assign Driver & Vehicle"}
            </Button>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">
            This order has already been assigned.
          </p>
        )}
      </div>

      {/* Trip progress panel — read-only */}
      <div className="rounded-xl border border-border bg-background p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Trip Progress
        </h2>

        {tripsLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : !trip ? (
          <p className="text-sm text-muted-foreground">
            No trip has started for this order yet.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Trip status</span>
              <StatusBadge status={trip.status} />
            </div>

            {trip.events.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Event Log</p>
                <ul className="space-y-2">
                  {trip.events.map((event, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">
                          {event.type.replace("_", " ")}
                        </p>
                        <p className="text-muted-foreground">
                          {event.note ||
                            (event.lat && event.lng
                              ? `${event.lat.toFixed(4)}, ${event.lng.toFixed(4)}`
                              : "")}
                          {" · "}
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {trip.proofOfDelivery && (
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Proof of Delivery
                </p>
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL?.replace("/api/v1", "")}${trip.proofOfDelivery.fileUrl}`}
                  alt="Proof of delivery"
                  className="max-w-xs rounded-lg border border-border"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
