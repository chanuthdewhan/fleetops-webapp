import { z } from "zod";

export const assignmentSchema = z.object({
  driverId: z.coerce.number().min(1, "Select a driver"),
  vehicleId: z.coerce.number().min(1, "Select a vehicle"),
});

export type AssignmentForm = z.infer<typeof assignmentSchema>;
