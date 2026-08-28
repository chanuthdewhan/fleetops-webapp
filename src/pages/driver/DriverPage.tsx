// src/pages/driver/DriverPage.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Truck, MapPin, Upload, CheckCircle2, Search } from "lucide-react";
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
  type AddEventForm,
} from "@/schemas/tripSchema";

export default function DriverPage() {
  const [orderIdInput, setOrderIdInput] = useState("");
  const [activeOrderId, setActiveOrderId] = useState<number | null>(null);
  const [confirmComplete, setConfirmComplete] = useState(false);

  const { data: trips, isLoading: tripsLoading } = useTripsByOrder(
    activeOrderId ?? 0,
  );
  const { data: availableDrivers } = useDrivers(0, "AVAILABLE", 100);
  const { data: availableVehicles } = useVehicles(0, "AVAILABLE", 100);

  const startTrip = useStartTrip();
  const addEvent = useAddTripEvent(activeOrderId ?? 0);
  const uploadProof = useUploadProof(activeOrderId ?? 0);
  const completeTrip = useCompleteTrip(activeOrderId ?? 0);

  const trip = trips?.find(
    (t) => t.status !== "COMPLETED" && t.status !== "CANCELLED",
  );

  const startForm = useForm<StartTripForm>({
    resolver: zodResolver(startTripSchema),
  });
  const eventForm = useForm<AddEventForm>({
    resolver: zodResolver(addEventSchema),
  });

  const handleLoadOrder = () => {
    const id = Number(orderIdInput);
    if (!id || id < 1) {
      toast.error("Enter a valid order ID");
      return;
    }
    setActiveOrderId(id);
  };

  const onStartTrip = (data: StartTripForm) => {
    startTrip.mutate(data, {
      onSuccess: () => toast.success("Trip started"),
      onError: (err: any) =>
        toast.error(err.response?.data?.detail ?? "Failed to start trip"),
    });
  };

  const onAddEvent = (data: AddEventForm) => {
    if (!trip) return;
    addEvent.mutate(
      { tripId: trip.id, data },
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
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.detail ?? "Failed to complete trip");
        setConfirmComplete(false);
      },
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-semibold">My Trip</h1>

      <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
        <Label htmlFor="orderId">Order ID</Label>
        <div className="flex gap-2 mt-2">
          <Input
            id="orderId"
            placeholder="Enter order ID assigned to you"
            value={orderIdInput}
            onChange={(e) => setOrderIdInput(e.target.value)}
          />
          <Button onClick={handleLoadOrder}>
            <Search className="h-4 w-4" />
            Load
          </Button>
        </div>
      </div>

      {activeOrderId && (
        <>
          {tripsLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : !trip ? (
            <div className="rounded-xl border border-border bg-background p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Start Trip for Order #{activeOrderId}
              </h2>
              <form
                onSubmit={startForm.handleSubmit(onStartTrip)}
                className="space-y-4"
              >
                <input
                  type="hidden"
                  value={activeOrderId}
                  {...startForm.register("orderId")}
                />
                <div className="space-y-2">
                  <Label>Driver</Label>
                  <Select
                    onValueChange={(v) =>
                      startForm.setValue("driverId", Number(v))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select yourself" />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      {availableDrivers?.content.map((d) => (
                        <SelectItem key={d.id} value={String(d.id)}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Vehicle</Label>
                  <Select
                    onValueChange={(v) =>
                      startForm.setValue("vehicleId", Number(v))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      {availableVehicles?.content.map((v) => (
                        <SelectItem key={v.id} value={String(v.id)}>
                          {v.plateNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  className="w-full"
                  disabled={startTrip.isPending}
                  onClick={() =>
                    startForm.handleSubmit(onStartTrip)({
                      ...({} as any),
                    })
                  }
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
                  <span className="text-sm text-muted-foreground">
                    Trip status
                  </span>
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
                  <input
                    type="hidden"
                    value="LOCATION"
                    {...eventForm.register("type")}
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
