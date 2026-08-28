import { z } from "zod";

export const vehicleSchema = z.object({
  plateNumber: z.string().min(1, "Plate number is required"),
  vehicleType: z.enum(["VAN", "TRUCK", "BIKE"]),
  capacityKg: z.coerce.number().positive("Must be a positive number"),
});
export type VehicleFormInput = z.input<typeof vehicleSchema>;
export type VehicleForm = z.output<typeof vehicleSchema>;
