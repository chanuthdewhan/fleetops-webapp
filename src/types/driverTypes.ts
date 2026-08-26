export type DriverStatus = "AVAILABLE" | "ON_TRIP" | "OFF_DUTY";

export interface Driver {
  id: number;
  name: string;
  phone: string;
  licenseNumber: string;
  status: DriverStatus;
  createdAt: string;
}

export interface DriverRequest {
  name: string;
  phone: string;
  licenseNumber: string;
}
