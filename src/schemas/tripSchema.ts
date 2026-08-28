import { z } from "zod";

export const startTripSchema = z.object({
  driverId: z.coerce.number().min(1, "Select a driver"),
  vehicleId: z.coerce.number().min(1, "Select a vehicle"),
});
export type StartTripFormInput = z.input<typeof startTripSchema>;
export type StartTripForm = z.output<typeof startTripSchema>;

export const addEventSchema = z.object({
  type: z.enum(["LOCATION", "STATUS_CHANGE"]).optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  note: z.string().optional(),
});
export type AddEventFormInput = z.input<typeof addEventSchema>;
export type AddEventForm = z.output<typeof addEventSchema>;
