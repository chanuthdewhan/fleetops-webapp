export type OrderStatus =
  | "PENDING"
  | "ASSIGNED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED";

export interface Order {
  id: number;
  customerId: number;
  customerName: string;
  pickupAddress: string;
  dropoffAddress: string;
  weightKg: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrderRequest {
  customerId: number;
  pickupAddress: string;
  dropoffAddress: string;
  weightKg: number;
}

export interface AssignmentRequest {
  driverId: number;
  vehicleId: number;
}
