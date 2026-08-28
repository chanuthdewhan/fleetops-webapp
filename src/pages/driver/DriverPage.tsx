import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Truck,
  MapPin,
  Upload,
  CheckCircle2,
  ArrowLeft,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useOrders } from "@/hooks/useOrders";
import {
  useTripsByOrder,
  useStartTrip,
  useAddTripEvent,
  useUploadProof,
  useCompleteTrip,
} from "@/hooks/useTrips";
import { useDrivers } from "@/hooks/useDrivers";
import { useVehicles } from "@/hooks/useVehicles";
import {
  startTripSchema,
  addEventSchema,
  type StartTripForm,
  type StartTripFormInput,
  type AddEventForm,
  type AddEventFormInput,
} from "@/schemas/tripSchema";
import type { Order } from "@/types";

function OrderPickCard({
  order,
  onClick,
}: {
  order: Order;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg border border-border bg-background p-3 hover:border-primary/50 hover:shadow-sm transition-all"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          Order #{order.id} · {order.customerName}
        </span>
        <StatusBadge status={order.status} />
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        {order.pickupAddress} → {order.dropoffAddress}
      </p>
    </button>
  );
}

export default function DriverPage() {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [confirmComplete, setConfirmComplete] = useState(false);

  const { data: readyOrders, isLoading: readyLoading } = useOrders(
    0,
    "ASSIGNED",
    50,
  );
  const { data: activeOrders, isLoading: activeLoading } = useOrders(
    0,
    "IN_TRANSIT",
    50,
  );
  const { data: trips, isLoading: tripsLoading } = useTripsByOrder(
    selectedOrderId ?? 0,
  );

  const { data: allDrivers } = useDrivers(0, undefined, 100);
  const { data: allVehicles } = useVehicles(0, undefined, 100);

  const startTrip = useStartTrip();
  const addEvent = useAddTripEvent(selectedOrderId ?? 0);
  const uploadProof = useUploadProof(selectedOrderId ?? 0);
  const completeTrip = useCompleteTrip(selectedOrderId ?? 0);

  const trip = trips?.find(
    (t) => t.status !== "COMPLETED" && t.status !== "CANCELLED",
  );

  const startForm = useForm<StartTripFormInput, unknown, StartTripForm>({
    resolver: zodResolver(startTripSchema),
  });
  const eventForm = useForm<AddEventFormInput, unknown, AddEventForm>({
    resolver: zodResolver(addEventSchema),
  });

  const selectedDriverId = startForm.watch("driverId");
  const selectedVehicleId = startForm.watch("vehicleId");
  const selectedDriver = allDrivers?.content.find(
    (d) => d.id === selectedDriverId,
  );
  const selectedVehicle = allVehicles?.content.find(
    (v) => v.id === selectedVehicleId,
  );

  const onStartTrip = (data: StartTripForm) => {
    if (!selectedOrderId) return;
    startTrip.mutate(
      { ...data, orderId: selectedOrderId },
      {
        onSuccess: () => toast.success("Trip started"),
        onError: (err: any) =>
          toast.error(err.response?.data?.detail ?? "Failed to start trip"),
      },
    );
  };

  const onAddEvent = (data: AddEventForm) => {
    if (!trip) return;
    addEvent.mutate(
      { tripId: trip.id, data: { ...data, type: "LOCATION" } },
      {
        onSuccess: () => {
          toast.success("Event logged");
          eventForm.reset();
        },
        onError: (err: any) =>
          toast.error(err.response?.data?.detail ?? "Failed to log event"),
      },
    );
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !trip) return;
    uploadProof.mutate(
      { tripId: trip.id, file },
      {
        onSuccess: () => toast.success("Proof of delivery uploaded"),
        onError: (err: any) =>
          toast.error(err.response?.data?.detail ?? "Upload failed"),
      },
    );
  };

  const onCompleteTrip = () => {
    if (!trip) return;
    completeTrip.mutate(trip.id, {
      onSuccess: () => {
        toast.success("Trip completed — order delivered");
        setConfirmComplete(false);
        setSelectedOrderId(null);
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.detail ?? "Failed to complete trip");
        setConfirmComplete(false);
      },
    });
  };

  const selectedOrder =
    readyOrders?.content.find((o) => o.id === selectedOrderId) ??
    activeOrders?.content.find((o) => o.id === selectedOrderId);

  if (!selectedOrderId) {
    return (
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-2xl font-semibold">My Trips</h1>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Ready to Start
          </h2>
          {readyLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : readyOrders && readyOrders.content.length > 0 ? (
            <div className="space-y-2">
              {readyOrders.content.map((o) => (
                <OrderPickCard
                  key={o.id}
                  order={o}
                  onClick={() => setSelectedOrderId(o.id)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No orders ready to start.
            </p>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            In Progress
          </h2>
          {activeLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : activeOrders && activeOrders.content.length > 0 ? (
            <div className="space-y-2">
              {activeOrders.content.map((o) => (
                <OrderPickCard
                  key={o.id}
                  order={o}
                  onClick={() => setSelectedOrderId(o.id)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No trips in progress.
            </p>
          )}
        </div>

        {!readyLoading &&
          !activeLoading &&
          !readyOrders?.content.length &&
          !activeOrders?.content.length && (
            <EmptyState
              title="No trips right now"
              description="Assigned orders will appear here."
            />
          )}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSelectedOrderId(null)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <h1 className="text-lg font-semibold">
            Order #{selectedOrderId}{" "}
            {selectedOrder ? `· ${selectedOrder.customerName}` : ""}
          </h1>
        </div>
      </div>

      {tripsLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : !trip ? (
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Start Trip
          </h2>
          <form
            onSubmit={startForm.handleSubmit(onStartTrip)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Driver</Label>
              <Select
                value={selectedDriverId ? String(selectedDriverId) : undefined}
                onValueChange={(v) => startForm.setValue("driverId", Number(v))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select yourself">
                    {selectedDriver?.name ?? "Select yourself"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  {allDrivers?.content.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.name} ({d.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {startForm.formState.errors.driverId && (
                <p className="text-sm text-destructive">
                  {startForm.formState.errors.driverId.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Vehicle</Label>
              <Select
                value={
                  selectedVehicleId ? String(selectedVehicleId) : undefined
                }
                onValueChange={(v) =>
                  startForm.setValue("vehicleId", Number(v))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select vehicle">
                    {selectedVehicle?.plateNumber ?? "Select vehicle"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  {allVehicles?.content.map((v) => (
                    <SelectItem key={v.id} value={String(v.id)}>
                      {v.plateNumber} ({v.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {startForm.formState.errors.vehicleId && (
                <p className="text-sm text-destructive">
                  {startForm.formState.errors.vehicleId.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={startTrip.isPending}
            >
              {startTrip.isPending ? "Starting..." : "Start Trip"}
            </Button>
          </form>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-border bg-background p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Trip status</span>
              <StatusBadge status={trip.status} />
            </div>
            {trip.events.length > 0 && (
              <ul className="space-y-1">
                {trip.events.map((event, i) => (
                  <li key={i} className="text-sm text-muted-foreground">
                    {event.type.replace("_", " ")}
                    {event.note ? ` — ${event.note}` : ""}
                    {" · "}
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-border bg-background p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Log Event
            </h2>
            <form
              onSubmit={eventForm.handleSubmit(onAddEvent)}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Latitude"
                  type="number"
                  step="any"
                  {...eventForm.register("lat")}
                />
                <Input
                  placeholder="Longitude"
                  type="number"
                  step="any"
                  {...eventForm.register("lng")}
                />
              </div>
              <Input
                placeholder="Note (optional)"
                {...eventForm.register("note")}
              />
              <Button
                type="submit"
                variant="outline"
                className="w-full"
                disabled={addEvent.isPending}
              >
                <MapPin className="h-4 w-4" />
                {addEvent.isPending ? "Logging..." : "Log Location Event"}
              </Button>
            </form>
          </div>

          <div className="rounded-xl border border-border bg-background p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Proof of Delivery
            </h2>
            {trip.proofOfDelivery ? (
              <p className="text-sm text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Uploaded
              </p>
            ) : (
              <label className="flex items-center justify-center gap-2 border border-dashed border-border rounded-lg py-6 cursor-pointer text-sm text-muted-foreground hover:bg-accent transition-colors">
                <Upload className="h-4 w-4" />
                {uploadProof.isPending
                  ? "Uploading..."
                  : "Click to upload photo"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onFileSelected}
                  disabled={uploadProof.isPending}
                />
              </label>
            )}
          </div>

          <Button
            className="w-full"
            disabled={!trip.proofOfDelivery || trip.status === "COMPLETED"}
            onClick={() => setConfirmComplete(true)}
          >
            Complete Trip
          </Button>
        </>
      )}

      <ConfirmDialog
        open={confirmComplete}
        onOpenChange={setConfirmComplete}
        title="Complete trip"
        description="This will mark the order as delivered. This cannot be undone."
        confirmLabel="Complete"
        destructive={false}
        onConfirm={onCompleteTrip}
        isLoading={completeTrip.isPending}
      />
    </div>
  );
}
