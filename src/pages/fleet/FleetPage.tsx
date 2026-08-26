import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  useDrivers,
  useCreateDriver,
  useUpdateDriverStatus,
} from "@/hooks/useDrivers";
import {
  useVehicles,
  useCreateVehicle,
  useUpdateVehicleStatus,
} from "@/hooks/useVehicles";
import { driverSchema, type DriverForm } from "@/schemas/driverSchema";
import { vehicleSchema, type VehicleForm } from "@/schemas/vehicleSchema";
import type { DriverStatus, VehicleStatus } from "@/types";

const DRIVER_STATUSES: DriverStatus[] = ["AVAILABLE", "ON_TRIP", "OFF_DUTY"];
const VEHICLE_STATUSES: VehicleStatus[] = [
  "AVAILABLE",
  "ON_TRIP",
  "MAINTENANCE",
];

function DriversTab() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<DriverStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useDrivers(
    page,
    statusFilter === "ALL" ? undefined : statusFilter,
  );
  const createDriver = useCreateDriver();
  const updateStatus = useUpdateDriverStatus();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DriverForm>({ resolver: zodResolver(driverSchema) });

  const drivers = data?.content ?? [];

  const filteredDrivers = useMemo(() => {
    if (!search.trim()) return drivers;
    const q = search.toLowerCase();
    return drivers.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.phone.includes(q) ||
        d.licenseNumber.toLowerCase().includes(q),
    );
  }, [drivers, search]);

  const onSubmit = (data: DriverForm) => {
    createDriver.mutate(data, {
      onSuccess: () => {
        toast.success("Driver added");
        reset();
        setOpen(false);
      },
      onError: (err: any) =>
        toast.error(err.response?.data?.detail ?? "Failed to add driver"),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as DriverStatus | "ALL");
            setPage(0);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectItem value="ALL">All statuses</SelectItem>
            {DRIVER_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="h-4 w-4" />
                Add Driver
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Driver</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register("phone")} />
                {errors.phone && (
                  <p className="text-sm text-destructive">
                    {errors.phone.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input id="licenseNumber" {...register("licenseNumber")} />
                {errors.licenseNumber && (
                  <p className="text-sm text-destructive">
                    {errors.licenseNumber.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createDriver.isPending}
              >
                {createDriver.isPending ? "Adding..." : "Add Driver"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border border-border bg-background p-4 shadow-sm space-y-4">
        {!isLoading && drivers.length > 0 && (
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, or license..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : filteredDrivers.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell className="font-medium">{driver.name}</TableCell>
                    <TableCell>{driver.phone}</TableCell>
                    <TableCell>{driver.licenseNumber}</TableCell>
                    <TableCell>
                      <Select
                        value={driver.status}
                        onValueChange={(v) =>
                          updateStatus.mutate(
                            { id: driver.id, status: v as DriverStatus },
                            {
                              onSuccess: () => toast.success("Status updated"),
                              onError: (err: any) =>
                                toast.error(
                                  err.response?.data?.detail ?? "Update failed",
                                ),
                            },
                          )
                        }
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue>
                            <StatusBadge status={driver.status} />
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent alignItemWithTrigger={false}>
                          {DRIVER_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s.replace("_", " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
            title="No drivers found"
            description="Add a driver to get started."
          />
        )}
      </div>
    </div>
  );
}

function VehiclesTab() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | "ALL">(
    "ALL",
  );
  const [search, setSearch] = useState("");

  const { data, isLoading } = useVehicles(
    page,
    statusFilter === "ALL" ? undefined : statusFilter,
  );
  const createVehicle = useCreateVehicle();
  const updateStatus = useUpdateVehicleStatus();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VehicleForm>({ resolver: zodResolver(vehicleSchema) });

  const vehicles = data?.content ?? [];

  const filteredVehicles = useMemo(() => {
    if (!search.trim()) return vehicles;
    const q = search.toLowerCase();
    return vehicles.filter((v) => v.plateNumber.toLowerCase().includes(q));
  }, [vehicles, search]);

  const onSubmit = (data: VehicleForm) => {
    createVehicle.mutate(data, {
      onSuccess: () => {
        toast.success("Vehicle added");
        reset();
        setOpen(false);
      },
      onError: (err: any) =>
        toast.error(err.response?.data?.detail ?? "Failed to add vehicle"),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as VehicleStatus | "ALL");
            setPage(0);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectItem value="ALL">All statuses</SelectItem>
            {VEHICLE_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="h-4 w-4" />
                Add Vehicle
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Vehicle</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plateNumber">Plate Number</Label>
                <Input id="plateNumber" {...register("plateNumber")} />
                {errors.plateNumber && (
                  <p className="text-sm text-destructive">
                    {errors.plateNumber.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleType">Vehicle Type</Label>
                <select
                  id="vehicleType"
                  {...register("vehicleType")}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="VAN">Van</option>
                  <option value="TRUCK">Truck</option>
                  <option value="BIKE">Bike</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacityKg">Capacity (kg)</Label>
                <Input
                  id="capacityKg"
                  type="number"
                  step="0.01"
                  {...register("capacityKg")}
                />
                {errors.capacityKg && (
                  <p className="text-sm text-destructive">
                    {errors.capacityKg.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createVehicle.isPending}
              >
                {createVehicle.isPending ? "Adding..." : "Add Vehicle"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border border-border bg-background p-4 shadow-sm space-y-4">
        {!isLoading && vehicles.length > 0 && (
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by plate number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : filteredVehicles.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plate Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Capacity (kg)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">
                      {vehicle.plateNumber}
                    </TableCell>
                    <TableCell>{vehicle.vehicleType}</TableCell>
                    <TableCell>{vehicle.capacityKg}</TableCell>
                    <TableCell>
                      <Select
                        value={vehicle.status}
                        onValueChange={(v) =>
                          updateStatus.mutate(
                            { id: vehicle.id, status: v as VehicleStatus },
                            {
                              onSuccess: () => toast.success("Status updated"),
                              onError: (err: any) =>
                                toast.error(
                                  err.response?.data?.detail ?? "Update failed",
                                ),
                            },
                          )
                        }
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue>
                            <StatusBadge status={vehicle.status} />
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent alignItemWithTrigger={false}>
                          {VEHICLE_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s.replace("_", " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
            title="No vehicles found"
            description="Add a vehicle to get started."
          />
        )}
      </div>
    </div>
  );
}

export default function FleetPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Fleet</h1>
      <Tabs defaultValue="drivers">
        <TabsList>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
        </TabsList>
        <TabsContent value="drivers" className="mt-4">
          <DriversTab />
        </TabsContent>
        <TabsContent value="vehicles" className="mt-4">
          <VehiclesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
