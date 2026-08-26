export type TripStatus = "STARTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type EventType = "LOCATION" | "STATUS_CHANGE";

export interface TripEvent {
  type: EventType;
  lat?: number;
  lng?: number;
  note?: string;
  timestamp: string;
}

export interface ProofOfDelivery {
  fileUrl: string;
  uploadedAt: string;
  notes?: string;
}

export interface Trip {
  id: string;
  orderId: number;
  driverId: number;
  vehicleId: number;
  status: TripStatus;
  startedAt: string;
  completedAt?: string;
  events: TripEvent[];
  proofOfDelivery?: ProofOfDelivery;
}

export interface StartTripRequest {
  orderId: number;
  driverId: number;
  vehicleId: number;
}

export interface AddEventRequest {
  type: EventType;
  lat?: number;
  lng?: number;
  note?: string;
}
