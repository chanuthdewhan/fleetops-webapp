import { z } from "zod";

export const startTripSchema = z.object({
  orderId: z.coerce.number().min(1, "Order ID is required"),
  driverId: z.coerce.number().min(1, "Driver ID is required"),
  vehicleId: z.coerce.number().min(1, "Vehicle ID is required"),
});
export type StartTripForm = z.infer<typeof startTripSchema>;

export const addEventSchema = z.object({
  type: z.enum(["LOCATION", "STATUS_CHANGE"]),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  note: z.string().optional(),
});
export type AddEventForm = z.infer<typeof addEventSchema>;
