export type VehicleType = "VAN" | "TRUCK" | "BIKE";
export type VehicleStatus = "AVAILABLE" | "ON_TRIP" | "MAINTENANCE";

export interface Vehicle {
  id: number;
  plateNumber: string;
  vehicleType: VehicleType;
  capacityKg: number;
  status: VehicleStatus;
  createdAt: string;
}

export interface VehicleRequest {
  plateNumber: string;
  vehicleType: VehicleType;
  capacityKg: number;
}
